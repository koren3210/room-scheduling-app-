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

function serializeUser(user) {
	return {
		id: user._id,
		name: user.name,
		email: user.email,
		avatarUrl: user.getAvatar(),
		role: user.role,
		preferences: user.preferences,
	};
}

function verifyToken(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Authentication required.' });
	}

	const token = authHeader.split(' ')[1];
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
		req.user = payload;
		next();
	} catch {
		return res.status(401).json({ error: 'Invalid or expired token.' });
	}
}

function parseTokenPayload(token) {
	if (!token) return null;
	try {
		return jwt.verify(token, process.env.JWT_SECRET || 'secret');
	} catch {
		return null;
	}
}

const notificationClients = new Map();

function normalizeId(value) {
	if (!value) return null;
	if (typeof value === 'string') return value;
	if (value._id) return String(value._id);
	if (value.id) return String(value.id);
	return String(value);
}

function registerClient(userId, res) {
	const key = normalizeId(userId);
	if (!key) return;
	if (!notificationClients.has(key)) {
		notificationClients.set(key, new Set());
	}
	notificationClients.get(key).add(res);
}

function unregisterClient(userId, res) {
	const key = normalizeId(userId);
	if (!key || !notificationClients.has(key)) return;
	const clients = notificationClients.get(key);
	clients.delete(res);
	if (clients.size === 0) {
		notificationClients.delete(key);
	}
}

function notifyUsers(userIds, payload) {
	const serializedPayload = `data: ${JSON.stringify(payload)}\n\n`;
	for (const userId of userIds) {
		const key = normalizeId(userId);
		if (!key) continue;
		const clients = notificationClients.get(key);
		if (!clients) continue;
		for (const client of clients) {
			client.write(serializedPayload);
		}
	}
}

function buildBookingAudience(booking) {
	const audience = new Set();
	audience.add(normalizeId(booking.user));
	for (const attendee of booking.attendeeUsers || []) {
		audience.add(normalizeId(attendee));
	}
	audience.delete(null);
	return audience;
}

function emitBookingEvent(booking, eventType, extra = {}) {
	const audience = buildBookingAudience(booking);
	const payload = {
		eventType,
		bookingId: normalizeId(booking._id),
		status: booking.status,
		timestamp: new Date().toISOString(),
		...extra,
	};
	notifyUsers(audience, payload);
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
app.use(express.json({ limit: '8mb' }));

// Health
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/notifications/stream', (req, res) => {
	const token = typeof req.query.token === 'string' ? req.query.token : null;
	const payload = parseTokenPayload(token);
	if (!payload?.id) {
		return res.status(401).json({ error: 'Invalid or expired token.' });
	}

	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache, no-transform');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders?.();

	const userId = normalizeId(payload.id);
	registerClient(userId, res);

	res.write(`data: ${JSON.stringify({ eventType: 'connected', timestamp: new Date().toISOString(), userId })}\n\n`);

	const heartbeat = setInterval(() => {
		res.write(': keep-alive\n\n');
	}, 25000);

	req.on('close', () => {
		clearInterval(heartbeat);
		unregisterClient(userId, res);
	});
});

// AI routes
app.use('/api/ai', require('./routes/ai-new'));

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

		const normalizedAvatarUrl = typeof avatarUrl === 'string' ? avatarUrl.trim() : undefined;

		const user = new User({
			name: name || '',
			email,
			avatarUrl: normalizedAvatarUrl,
			preferences: preferences || {},
		});
		user.setPassword(password);
		await user.save();

		res.status(201).json({
			token: jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret'),
			user: serializeUser(user),
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
			token: jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret'),
			user: serializeUser(user),
		});
	}),
);

app.get(
	'/api/auth/me',
	verifyToken,
	asyncHandler(async (req, res) => {
		const user = await User.findById(req.user.id);
		if (!user) return res.status(404).json({ error: 'User not found.' });
		res.json(serializeUser(user));
	}),
);

app.get(
	'/api/users',
	verifyToken,
	asyncHandler(async (req, res) => {
		const query = (req.query.q || '').toString().trim();
		const filter = query
			? {
					$or: [{ name: { $regex: query, $options: 'i' } }, { email: { $regex: query, $options: 'i' } }],
				}
			: {};

		const users = await User.find(filter).limit(30).sort({ name: 1, email: 1 });
		res.json(users.map(serializeUser));
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
		const { wing, capacity, amenities, available, sortBy, sortOrder } = req.query;
		const filter = {};

		if (wing) filter.wing = wing;
		if (capacity) filter.capacity = { $gte: Number(capacity) };
		if (amenities) filter.amenities = { $all: amenities.split(',').map(item => item.trim()) };
		if (available !== undefined) filter.isAvailable = available === 'true';

		const order = sortOrder === 'desc' ? -1 : 1;

		if (sortBy === 'nextBookingDate') {
			const now = new Date();
			const rooms = await Room.aggregate([
				{ $match: filter },
				{
					$lookup: {
						from: 'bookings',
						let: { roomId: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{ $eq: ['$room', '$$roomId'] },
											{ $gte: ['$startAt', now] },
											{ $in: ['$status', ['pending', 'confirmed']] },
										],
									},
								},
							},
							{ $sort: { startAt: 1 } },
							{ $limit: 1 },
						],
						as: 'nextBooking',
					},
				},
				{
					$addFields: {
						nextBookingAt: {
							$ifNull: [{ $arrayElemAt: ['$nextBooking.startAt', 0] }, null],
						},
						nextBookingPriority: {
							$cond: [{ $ifNull: [{ $arrayElemAt: ['$nextBooking.startAt', 0] }, false] }, 0, 1],
						},
					},
				},
				{ $sort: { nextBookingPriority: 1, nextBookingAt: order, name: 1 } },
				{ $project: { nextBooking: 0, nextBookingPriority: 0 } },
			]);

			return res.json(rooms);
		}

		let sort = { wing: 1, roomNumber: 1 };
		if (sortBy === 'name') sort = { name: order, wing: 1 };
		if (sortBy === 'capacity') sort = { capacity: order, wing: 1 };
		if (sortBy === 'wing') sort = { wing: order, roomNumber: 1 };

		const rooms = await Room.find(filter).sort(sort);
		res.json(rooms);
	}),
);

app.post(
	'/api/rooms',
	verifyToken,
	asyncHandler(async (req, res) => {
		const normalizedImages = Array.isArray(req.body.images)
			? req.body.images.filter(image => typeof image === 'string' && image.trim().length > 0)
			: [];

		const room = new Room({
			...req.body,
			images: normalizedImages,
		});
		await room.save();
		res.status(201).json(room);
	}),
);

// Bookings
app.get(
	'/api/bookings',
	verifyToken,
	asyncHandler(async (req, res) => {
		const { userId, roomId, status, mine } = req.query;
		const filter = {};
		if (String(mine) === 'true') {
			const targetUserId = String(req.user.id);
			filter.$or = [{ user: targetUserId }, { attendeeUsers: targetUserId }];
		} else if (req.user.role === 'admin') {
			if (userId) filter.user = userId;
		} else {
			if (userId && String(userId) !== String(req.user.id)) {
				return res.status(403).json({ error: 'You can only query your own bookings.' });
			}
			const targetUserId = userId ? String(userId) : String(req.user.id);
			filter.$or = [{ user: targetUserId }, { attendeeUsers: targetUserId }];
		}
		if (roomId) filter.room = roomId;
		if (status) filter.status = status;

		const bookings = await Booking.find(filter)
			.populate('user', 'name email avatarUrl')
			.populate('attendeeUsers', 'name email avatarUrl')
			.populate('room', 'name wing roomNumber capacity')
			.sort({ startAt: 1 });

		res.json(bookings);
	}),
);

app.post(
	'/api/bookings',
	verifyToken,
	asyncHandler(async (req, res) => {
		const { room, wing, startAt, endAt, attendees } = req.body;
		if (!room || !wing || !startAt || !endAt) {
			return res.status(400).json({ error: 'Booking must include room, wing, startAt, and endAt.' });
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

		const attendeeUsers = Array.isArray(req.body.attendeeUsers)
			? req.body.attendeeUsers.filter(Boolean).map(item => item.toString())
			: [];
		const normalizedAttendees = Number(attendees) > 0 ? Number(attendees) : Math.max(attendeeUsers.length, 1);

		const booking = new Booking({
			...req.body,
			user: req.user.id,
			createdBy: req.user.id,
			attendeeUsers,
			attendees: normalizedAttendees,
			startAt: start,
			endAt: end,
		});
		await booking.save();

		const populatedBooking = await Booking.findById(booking._id)
			.populate('user', 'name email avatarUrl')
			.populate('attendeeUsers', 'name email avatarUrl')
			.populate('room', 'name wing roomNumber capacity');

		emitBookingEvent(populatedBooking, 'booking_created', {
			actorId: normalizeId(req.user.id),
		});

		res.status(201).json(populatedBooking);
	}),
);

app.put(
	'/api/bookings/:id',
	verifyToken,
	asyncHandler(async (req, res) => {
		const existingBooking = await Booking.findById(req.params.id);
		if (!existingBooking) return res.status(404).json({ error: 'Booking not found.' });

		const isOwner = String(existingBooking.user) === String(req.user.id);
		if (req.user.role !== 'admin' && !isOwner) {
			return res.status(403).json({ error: 'You are not allowed to update this booking.' });
		}

		const previousAudience = buildBookingAudience(existingBooking);
		Object.assign(existingBooking, req.body);
		const booking = await existingBooking.save();
		const populatedBooking = await Booking.findById(booking._id)
			.populate('user', 'name email avatarUrl')
			.populate('attendeeUsers', 'name email avatarUrl')
			.populate('room', 'name wing roomNumber capacity');

		const currentAudience = buildBookingAudience(populatedBooking);
		const mergedAudience = new Set([...previousAudience, ...currentAudience]);
		const eventType = populatedBooking.status === 'cancelled' ? 'booking_cancelled' : 'booking_updated';
		notifyUsers(mergedAudience, {
			eventType,
			bookingId: normalizeId(populatedBooking._id),
			status: populatedBooking.status,
			timestamp: new Date().toISOString(),
			actorId: normalizeId(req.user.id),
		});

		res.json(populatedBooking);
	}),
);

app.put(
	'/api/bookings/:id/respond',
	verifyToken,
	asyncHandler(async (req, res) => {
		const action = String(req.body.action || '').toLowerCase();
		if (!['approve', 'decline'].includes(action)) {
			return res.status(400).json({ error: 'Action must be either approve or decline.' });
		}

		const booking = await Booking.findById(req.params.id);
		if (!booking) return res.status(404).json({ error: 'Booking not found.' });

		const attendeeIds = (booking.attendeeUsers || []).map(id => String(id));
		const isAttendee = attendeeIds.includes(String(req.user.id));
		if (req.user.role !== 'admin' && !isAttendee) {
			return res.status(403).json({ error: 'Only invited attendees can respond to this booking.' });
		}

		if (booking.status !== 'pending') {
			return res.status(400).json({ error: 'Only pending bookings can be responded to.' });
		}

		booking.status = action === 'approve' ? 'confirmed' : 'cancelled';
		await booking.save();

		const populatedBooking = await Booking.findById(booking._id)
			.populate('user', 'name email avatarUrl')
			.populate('attendeeUsers', 'name email avatarUrl')
			.populate('room', 'name wing roomNumber capacity');

		emitBookingEvent(populatedBooking, 'booking_responded', {
			action,
			actorId: normalizeId(req.user.id),
		});

		res.json(populatedBooking);
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
