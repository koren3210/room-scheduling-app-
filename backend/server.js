require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Wing = require('./models/Wing');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT;

function asyncHandler(fn) {
	return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Connect to MongoDB
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log('Connected to MongoDB Atlas'))
	.catch(err => console.error('MongoDB connection error:', err));

// Middleware
// 2. CORS must be the VERY FIRST middleware
app.use(
	cors({
		origin: (origin, callback) => {
			// This allows requests with no origin (like mobile apps or curl)
			// and checks if the origin matches your frontend exactly
			const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
		optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
	}),
);
app.use(express.json());

// Health
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date() });
});

// Auth routes
app.post(
	'/api/auth/register',
	asyncHandler(async (req, res) => {
		const { name, email, password, avatarUrl, preferences } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password are required.' });
		}

		const existing = await User.findOne({ email: email.toLowerCase() });
		if (existing) {
			return res.status(409).json({ error: 'Email already registered.' });
		}

		const user = new User({
			name: name || '',
			email,
			avatarUrl,
			preferences: preferences || {},
		});
		user.setPassword(password);
		await user.save();

		res.status(201).json({
			id: user._id,
			name: user.name,
			email: user.email,
			avatarUrl: user.getAvatar(),
			role: user.role,
			preferences: user.preferences,
		});
	}),
);

app.post(
	'/api/auth/login',
	asyncHandler(async (req, res) => {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password are required.' });
		}

		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user || !user.validatePassword(password)) {
			return res.status(401).json({ error: 'Invalid credentials.' });
		}

		res.json({
			token: jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret'),
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				avatarUrl: user.getAvatar(),
				role: user.role,
				preferences: user.preferences,
			},
		});
	}),
);

// Wings
app.get(
	'/api/wings',
	asyncHandler(async (req, res) => {
		const wings = await Wing.find({ active: true }).sort({ sortOrder: 1 });
		if (wings.length === 0) {
			const defaultWings = [
				{ key: 'Wing A', name: 'Wing A', description: 'Corporate offices and strategy rooms', sortOrder: 1 },
				{ key: 'Wing B', name: 'Wing B', description: 'Technology and collaboration spaces', sortOrder: 2 },
				{ key: 'Wing C', name: 'Wing C', description: 'Training and event facilities', sortOrder: 3 },
				{ key: 'Wing D', name: 'Wing D', description: 'Executive suites and private offices', sortOrder: 4 },
			];
			await Wing.insertMany(defaultWings);
			return res.json(defaultWings);
		}
		res.json(wings);
	}),
);

// Rooms
app.get(
	'/api/rooms',
	asyncHandler(async (req, res) => {
		const { wing, capacity, amenities, available } = req.query;
		const filter = {};

		if (wing) filter.wing = wing;
		if (capacity) filter.capacity = { $gte: Number(capacity) };
		if (amenities) filter.amenities = { $all: amenities.split(',').map(item => item.trim()) };
		if (available !== undefined) filter.isAvailable = available === 'true';

		const rooms = await Room.find(filter).sort({ wing: 1, roomNumber: 1 });
		res.json(rooms);
	}),
);

app.post(
	'/api/rooms',
	asyncHandler(async (req, res) => {
		const room = new Room(req.body);
		await room.save();
		res.status(201).json(room);
	}),
);

// Bookings
app.get(
	'/api/bookings',
	asyncHandler(async (req, res) => {
		const { userId, roomId, status } = req.query;
		const filter = {};
		if (userId) filter.user = userId;
		if (roomId) filter.room = roomId;
		if (status) filter.status = status;

		const bookings = await Booking.find(filter)
			.populate('user', 'name email avatarUrl')
			.populate('room', 'name wing roomNumber capacity')
			.sort({ startAt: 1 });

		res.json(bookings);
	}),
);

app.post(
	'/api/bookings',
	asyncHandler(async (req, res) => {
		const { user, room, wing, startAt, endAt, attendees, purpose } = req.body;
		if (!user || !room || !wing || !startAt || !endAt) {
			return res.status(400).json({ error: 'Booking must include user, room, wing, startAt, and endAt.' });
		}

		const start = new Date(startAt);
		const end = new Date(endAt);
		if (start >= end) {
			return res.status(400).json({ error: 'Invalid booking time range.' });
		}

		const overlap = await Booking.findOne({
			room,
			status: { $in: ['pending', 'confirmed'] },
			$or: [{ startAt: { $lt: end }, endAt: { $gt: start } }],
		});

		if (overlap) {
			return res.status(409).json({ error: 'Room is already booked during that time.' });
		}

		const booking = new Booking({
			...req.body,
			startAt: start,
			endAt: end,
		});
		await booking.save();
		res.status(201).json(booking);
	}),
);

app.put(
	'/api/bookings/:id',
	asyncHandler(async (req, res) => {
		const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!booking) return res.status(404).json({ error: 'Booking not found.' });
		res.json(booking);
	}),
);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err);
	const status = err.status || 500;
	res.status(status).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
