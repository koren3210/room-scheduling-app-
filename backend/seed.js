require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Wing = require('./models/Wing');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

const DEFAULT_WINGS = [
	{ key: 'Wing A', name: 'Wing A', description: 'Corporate offices and strategy rooms', sortOrder: 1 },
	{ key: 'Wing B', name: 'Wing B', description: 'Technology and collaboration spaces', sortOrder: 2 },
	{ key: 'Wing C', name: 'Wing C', description: 'Training and event facilities', sortOrder: 3 },
	{ key: 'Wing D', name: 'Wing D', description: 'Executive suites and private offices', sortOrder: 4 },
];

const DEFAULT_ROOMS = [
	{
		wing: 'Wing A',
		roomNumber: 'A101',
		name: 'Strategy Room',
		capacity: 8,
		amenities: ['Projector', 'Whiteboard', 'Video Conferencing'],
		features: ['Quiet zone'],
		tags: ['strategy', 'focus'],
		isAvailable: true,
	},
	{
		wing: 'Wing B',
		roomNumber: 'B204',
		name: 'Collaboration Suite',
		capacity: 12,
		amenities: ['Whiteboard', 'HD display', 'Conference phone'],
		features: ['Open layout'],
		tags: ['collaboration', 'team'],
		isAvailable: true,
	},
	{
		wing: 'Wing C',
		roomNumber: 'C310',
		name: 'Training Lab',
		capacity: 20,
		amenities: ['Training pods', 'Smart display', 'Air conditioning'],
		features: ['Modular setup'],
		tags: ['training', 'classroom'],
		isAvailable: true,
	},
	{
		wing: 'Wing D',
		roomNumber: 'D401',
		name: 'Executive Boardroom',
		capacity: 14,
		amenities: ['Video Conferencing', 'Premium seating', 'Private service'],
		features: ['Executive privacy'],
		tags: ['executive', 'board'],
		isAvailable: true,
	},
];

const ADMIN_EMAIL = 'admin@siemensbooking.local';
const ADMIN_PASSWORD = 'Admin123!';

async function seed() {
	await mongoose.connect(process.env.MONGODB_URI);

	console.log('Connected to MongoDB for seeding.');

	for (const wing of DEFAULT_WINGS) {
		await Wing.updateOne({ key: wing.key }, { $set: wing }, { upsert: true });
	}

	for (const room of DEFAULT_ROOMS) {
		await Room.updateOne({ wing: room.wing, roomNumber: room.roomNumber }, { $set: room }, { upsert: true });
	}

	const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
	if (!existingAdmin) {
		const admin = new User({
			name: 'Siemens Admin',
			email: ADMIN_EMAIL,
			role: 'admin',
			avatarUrl: 'https://ui-avatars.com/api/?name=Siemens+Admin&background=009999&color=fff',
			preferences: {
				defaultWing: 'Wing A',
				preferredAmenities: ['Projector', 'Whiteboard'],
				defaultCapacity: 8,
			},
		});
		admin.setPassword(ADMIN_PASSWORD);
		await admin.save();
		console.log(`Created admin user: ${ADMIN_EMAIL}`);
	} else {
		console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
	}

	const bookingCount = await Booking.countDocuments();
	if (bookingCount === 0) {
		const room = await Room.findOne({ wing: 'Wing A', roomNumber: 'A101' });
		const user = await User.findOne({ email: ADMIN_EMAIL });

		if (room && user) {
			await Booking.create({
				user: user._id,
				room: room._id,
				wing: room.wing,
				startAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
				endAt: new Date(Date.now() + 26 * 60 * 60 * 1000),
				status: 'confirmed',
				purpose: 'Platform planning and review',
				attendees: 6,
				amenitiesRequested: ['Projector', 'Video Conferencing'],
				notes: 'Initial seeded booking for demo purposes.',
				createdBy: user._id,
			});
			console.log('Created sample booking.');
		}
	}

	console.log('Backend seed complete.');
	process.exit(0);
}

seed().catch(err => {
	console.error('Seed failed:', err);
	process.exit(1);
});
