# Room Scheduling App

A modern, full-stack meeting room booking platform with AI-powered recommendations, real-time availability calendars, and seamless integrations with Microsoft Teams and Outlook.

---

## 🎯 Features

- **Smart AI Assistant**: Ask the AI for meeting room suggestions and it instantly recommends the best available rooms and times
- **Interactive Room Calendar**: View real-time availability for each room with visual calendar displays and participant avatars
- **One-Click Booking**: Book rooms instantly from recommendations or calendar slots
- **3D Facility Radar**: Interactive visualization of facility spaces, room status, and real-time availability
- **Live Updates**: Server-Sent Events (SSE) for real-time booking and availability changes without page refresh
- **Role-Based Access**: Admins can manage rooms, wings/facilities, users, and booking rules
- **User Authentication**: Secure login with JWT tokens and session persistence
- **Mobile-Friendly**: Responsive design for seamless booking on any device
- **Booking Management**: View, modify, and cancel bookings with real-time notifications
- **Amenities Filtering**: Filter rooms by amenities (projector, whiteboard, video conference, etc.)

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type-safe development
- **@tanstack/react-query** - Server state management & data fetching
- **@fullcalendar/react** - Interactive calendar component
- **react-datepicker** - Date/time selection
- **react-toastify** - Toast notifications
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Minimalist web framework
- **MongoDB/Mongoose** - NoSQL database with schema validation
- **JWT** - Secure authentication
- **Gemini AI API** - Natural language room suggestions
- **Axios** - HTTP client

### Infrastructure
- **MongoDB Atlas** - Cloud database hosting
- **Google AI API** - For AI recommendations
- **CORS-enabled** - Multi-origin support for frontend development

---

## 📁 Project Structure

```
room-scheduling-app/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── api/                 # API client modules
│   │   ├── contexts/            # React context (auth)
│   │   ├── layouts/             # Layout components
│   │   └── lib/                 # Utilities & data
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Express.js backend
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Booking.js
│   │   └── Wing.js
│   ├── routes/
│   │   ├── ai-new.js            # AI-powered booking suggestions
│   │   └── ai.js                # Legacy AI route
│   ├── server.js                # Express app & routes
│   ├── seed.js                  # Database seeding
│   ├── .env                     # Environment variables
│   └── package.json
│
└── README.md                    # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB Atlas** account (free tier available)
- **Google Gemini API key** (free tier available)

### Installation

#### 1. Clone & Install Dependencies

```bash
# Backend setup
cd backend
npm install

# Frontend setup (in another terminal)
cd frontend
npm install
```

#### 2. Environment Configuration

Create `backend/.env` with your credentials:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/room_scheduling?retryWrites=true&w=majority&appName=Cluster0
PORT=5005
GOOGLE_AI_API_KEY=your_google_gemini_api_key_here
JWT_SECRET=your_jwt_secret_key
```

**Where to get credentials:**
- **MongoDB URI**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Connect → Copy connection string
- **Google API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey) → Create API key
- **JWT Secret**: Any random string (e.g., `your-super-secret-key-12345`)

#### 3. Database Initialization

```bash
cd backend
npm run seed
```

This creates:
- Facilities (Wings B, C, D)
- Sample rooms with amenities
- Demo users (password: `Demo123!`)
- Admin user (`admin@siemensbooking.local` / `Admin123!`)
- 40+ sample bookings

#### 4. Start the App

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
Runs on `http://localhost:5005`

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Runs on `http://localhost:5173`

---

## 📖 Usage

### Login

1. Navigate to `http://localhost:5173`
2. Sign up or use demo credentials:
   - **Email**: `alex.morgan@demo.siemensbooking.local`
   - **Password**: `Demo123!`

### Booking a Room

**Option 1: AI Assistant**
1. Go to **Dashboard** → **AI Chat**
2. Type: "I need a meeting room for 5 people tomorrow at 2 PM"
3. AI suggests available rooms
4. Click **Book** to confirm

**Option 2: Browse Rooms**
1. Go to **Available Rooms**
2. Click **View Availability** to see room calendar
3. Select a time slot
4. Confirm booking in modal

**Option 3: Recommendations**
1. Dashboard shows recommended rooms
2. Click **Book** on any room card

### Admin Functions

1. Login as admin or create an admin account
2. Go to **Admin Module**
3. Register new workspace (room):
   - Enter room name, capacity, wing, amenities
   - Upload optional image
   - Click **Add Room**
4. Manage rooms in the **Manage Rooms** section

### Facility Radar

- Click **Facility Map** on dashboard
- Visualize all rooms in 3D layout
- See real-time availability status
- Click rooms to view details

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Rooms
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create room (admin)
- `DELETE /api/rooms/:id` - Delete room (admin)

### Bookings
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### AI
- `POST /api/ai/parse` - AI room suggestion engine

### Real-Time
- `GET /api/notifications/stream` - SSE endpoint for live updates

---

## 🔐 Security

- **JWT Authentication**: All API routes require valid tokens
- **Password Hashing**: Bcrypt for secure password storage
- **CORS Protection**: Restricted origins (frontend + localhost)
- **Role-Based Access**: Admin/user permissions enforced
- **Input Validation**: Mongoose schema validation

---

## 🗄️ Database Schema

### User
- Email, password (hashed), name, avatar
- Role (admin / user)
- Preferences (default wing, amenities)

### Room
- Name, capacity, wing, amenities
- Images (base64 or URLs)
- Availability status

### Booking
- User, room, startAt, endAt
- Status (confirmed, cancelled, pending)
- Attendees, purpose, notes

### Wing
- Key, name, description, sort order

---

## 🚨 Troubleshooting

### MongoDB Connection Error
- Verify IP is whitelisted in [Atlas Network Access](https://account.mongodb.com/account/security-quickstart)
- Check credentials in `.env`
- Ensure database name is in URI: `mongodb+srv://...cluster.../room_scheduling?...`

### AI Suggestions Not Working
- Verify `GOOGLE_AI_API_KEY` in `.env`
- Check Gemini API quota at [Google AI Studio](https://aistudio.google.com/app/apikey)

### Frontend Not Connecting to Backend
- Backend running on `http://localhost:5005`?
- Frontend configured to hit correct backend URL in `src/api/client.ts`
- Check CORS origin in `backend/server.js`

---

## 🎯 Future Enhancements

- Outlook & Teams calendar sync
- Email notifications for bookings
- Advanced analytics & reporting
- Multi-facility support
- Recurring bookings
- Room capacity management
- Booking conflicts resolution UI

---

## 📝 Development Notes

- **Hot reload**: Both frontend (Vite) and backend (nodemon) support hot reload
- **Database seeding**: Safe to run multiple times (uses upsert logic)
- **Timezone handling**: All times stored in UTC, client sends local timezone
- **AI parsing**: Fallback logic if Gemini API fails

---

## 📄 License

ISC

---

## 👥 Team

Built with ❤️ for intelligent workspace management.

---

## 📞 Support

For issues or questions, check the logs:
- **Frontend**: Browser console (`F12`)
- **Backend**: Terminal output when running `npm run dev`
- **Database**: MongoDB Atlas dashboard

---

**Last Updated**: May 15, 2026