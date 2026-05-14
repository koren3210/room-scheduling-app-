# Deployment Guide: Render

This guide explains how to deploy the Room Scheduling App to **Render** using two free services:
- **Backend**: Web Service (Node.js)
- **Frontend**: Static Site (React/Vite)

---

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub (Render deploys from GitHub)
3. **MongoDB Atlas**: Have your connection string ready
4. **Google Gemini API Key**: Have your API key ready

---

## 🚀 Step 1: Prepare Your Repository

### 1.1 Update `.gitignore`
Ensure your repo is properly structured for Render deployment:

```bash
# In root directory, create or update .gitignore
frontend/node_modules/
frontend/dist/
backend/node_modules/
.env
.env.local
```

### 1.2 Verify Build Scripts
Check that both `package.json` files have correct scripts:

**Frontend** (`frontend/package.json`):
```json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "preview": "vite preview"
  }
}
```

**Backend** (`backend/package.json`):
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seed.js"
  }
}
```

### 1.3 Check Vite Output
Verify `frontend/vite.config.js` builds to `dist` folder (default):
```js
export default defineConfig({
  plugins: [react()],
  // dist folder is default output
});
```

### 1.4 Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## 🔧 Step 2: Deploy Backend (Web Service)

### 2.1 Create Backend Service on Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Select your GitHub repository
4. Fill in the form:
   - **Name**: `room-scheduling-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Free`

### 2.2 Set Environment Variables

In the Render dashboard, add **Environment Variables**:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/room_scheduling?...` | From MongoDB Atlas |
| `GOOGLE_AI_API_KEY` | Your Google Gemini API key | From Google AI Studio |
| `JWT_SECRET` | Any random string | E.g., `your-secret-key-12345` |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | (Render assigns automatically) |

### 2.3 Deploy

Click **Create Web Service** and wait for deployment (~2-3 minutes).

**Note the backend URL**: `https://room-scheduling-backend.onrender.com`

---

## 🎨 Step 3: Deploy Frontend (Static Site)

### 3.1 Create Static Site on Render

1. Go to Render Dashboard → **New +** → **Static Site**
2. Select your GitHub repository
3. Fill in the form:
   - **Name**: `room-scheduling-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: `Free`

### 3.2 Set Environment Variables

Add **Environment Variable**:

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_API_URL` | `https://room-scheduling-backend.onrender.com` | Backend URL from Step 2 |

### 3.3 Deploy

Click **Create Static Site** and wait for deployment (~3-5 minutes).

**Note the frontend URL**: `https://room-scheduling-frontend.onrender.com`

---

## 🔗 Step 4: Connect Frontend to Backend

### 4.1 Update Backend CORS

In `backend/server.js`, update CORS origins to include Render URL:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://room-scheduling-frontend.onrender.com',  // Add this
];
```

Then commit and push:
```bash
git add backend/server.js
git commit -m "Add Render frontend to CORS origins"
git push origin main
```

Render will automatically redeploy the backend.

### 4.2 Verify Frontend API Connection

1. Visit your frontend URL: `https://room-scheduling-frontend.onrender.com`
2. Try logging in—it should connect to the backend
3. Check browser console (F12) for any errors

---

## 📊 Step 5: Verify Deployment

### Health Checks

**Backend Health**:
```bash
curl https://room-scheduling-backend.onrender.com/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

**Frontend Load**:
Visit `https://room-scheduling-frontend.onrender.com` in browser.

### Database Seeding (Optional)

To seed the database on production:
1. Go to Render Backend dashboard
2. Click **Shell** tab
3. Run: `cd backend && npm run seed`

---

## ⚠️ Important Notes

### Free Tier Limitations

- **Backend**: Spins down after 15 mins of inactivity (slow first request)
- **Frontend**: Static site has no downtime
- **Storage**: Both have limited resources
- **Bandwidth**: Limited free tier allowance

### Cost Optimization

- Use free tier only for testing/demo
- Upgrade to paid plan for production use
- Monitor Render dashboard for usage

### Environment Variables

**Never commit `.env` to GitHub!**
- Add to `.gitignore`
- Set all secrets in Render dashboard
- Use separate values for dev and production

---

## 🔄 Workflow: Making Changes

### To update your live app:

1. Make code changes locally
2. Test: `npm run dev` (backend) + `npm run dev` (frontend)
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```
4. Render auto-deploys within 2-5 minutes
5. Visit your live URL to verify

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

**Error**: CORS error or network failure

**Fix**:
1. Verify backend URL in frontend env: `VITE_API_URL=https://room-scheduling-backend.onrender.com`
2. Check backend CORS includes frontend URL
3. Restart both services (in Render dashboard, click "Restart Instance")

### Backend crashes after deploy

**Error**: Service spins down or shows error logs

**Fix**:
1. Check Render logs: Dashboard → Logs tab
2. Verify `MONGODB_URI` and `GOOGLE_AI_API_KEY` are set correctly
3. Ensure `backend/package.json` has `"start": "node server.js"`
4. Try manual redeploy: Dashboard → Manual Deploy

### Frontend shows blank page

**Error**: Static site deploys but shows nothing

**Fix**:
1. Check build logs: Dashboard → Deployments → Latest → Logs
2. Verify `frontend/dist` folder exists after build
3. Confirm `vite.config.js` doesn't have custom `build.outDir`
4. Try clearing browser cache (Ctrl+Shift+Delete)

### Slow first request on backend

**Normal on free tier** - backend spins down after 15 mins inactivity.
First request will be slow (~10-30s). Subsequent requests are fast.

---

## 📈 Next Steps (Production)

When ready for production:

1. **Upgrade Plan**: Switch from Free to paid tiers
2. **Custom Domain**: Connect your domain to Render
3. **SSL Certificate**: Render provides free HTTPS
4. **Monitoring**: Set up alerts for downtime
5. **Backups**: Enable MongoDB Atlas backups
6. **CDN**: Consider Render's edge network for faster static delivery

---

## 🎯 Deployment Checklist

- [ ] GitHub repo created with code committed
- [ ] MongoDB Atlas database ready with user/password
- [ ] Google Gemini API key obtained
- [ ] Backend service created on Render
- [ ] Backend environment variables set
- [ ] Frontend service created on Render
- [ ] Frontend `VITE_API_URL` set to backend URL
- [ ] Backend CORS updated with frontend URL
- [ ] Both services deployed and running
- [ ] Frontend successfully connects to backend
- [ ] Test login/booking flow works end-to-end
- [ ] Share live URL for AI Challenge Week!

---

## 📞 Support

**Issues?**
1. Check Render logs (Dashboard → Logs)
2. Test locally: `npm run dev` (backend) + `npm run dev` (frontend)
3. Verify all environment variables are set
4. Restart services in Render dashboard

**Documentation**:
- [Render Docs](https://render.com/docs)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com)

---

**Deployment Date**: May 15, 2026
