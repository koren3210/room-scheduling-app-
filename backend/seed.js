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

const DEMO_USER_PASSWORD = 'Demo123!';
const TARGET_BOOKINGS = 40;

const DEMO_USERS = [
	'Alex Morgan',
	'Sara Ibrahim',
	'Noah Bennett',
	'Priya Nair',
	'Omar Khaled',
	'Liam Carter',
	'Hana Yusuf',
	'Mina George',
	'Rania Adel',
	'Daniel Schmidt',
	'Farah Mostafa',
	'Youssef Ali',
	'Laila Hassan',
	'Karim Saad',
	'Jana Soliman',
	'Adam Wagner',
	'Nora Salem',
	'Yara Fawzy',
	'Tariq Helmy',
	'Mariem Fahmy',
];

const ROOM_TEMPLATES = {
	'Wing A': [
		{ roomNumber: 'A101', name: 'Strategy Room', capacity: 8, amenities: ['Projector', 'Whiteboard', 'Video Conferencing'] },
		{ roomNumber: 'A102', name: 'Summit Hub', capacity: 10, amenities: ['Whiteboard', 'HD Display'] },
		{ roomNumber: 'A103', name: 'Atlas Boardroom', capacity: 14, amenities: ['Video Conferencing', 'Conference Phone'] },
		{ roomNumber: 'A104', name: 'Focus Cabin 1', capacity: 4, amenities: ['Monitor', 'Whiteboard'] },
		{ roomNumber: 'A105', name: 'Focus Cabin 2', capacity: 4, amenities: ['Monitor', 'Whiteboard'] },
		{ roomNumber: 'A106', name: 'Client Lounge', capacity: 12, amenities: ['Projector', 'Coffee Station'] },
	],
	'Wing B': [
		{ roomNumber: 'B201', name: 'Beta Lab', capacity: 10, amenities: ['Video Conferencing', 'Smart Display'] },
		{ roomNumber: 'B202', name: 'Collaboration Suite', capacity: 12, amenities: ['Whiteboard', 'Conference Phone'] },
		{ roomNumber: 'B203', name: 'Neon Studio', capacity: 6, amenities: ['LED Wall', 'Monitor'] },
		{ roomNumber: 'B204', name: 'Sprint Room', capacity: 8, amenities: ['Kanban Wall', 'Whiteboard'] },
		{ roomNumber: 'B205', name: 'Pairing Pod', capacity: 4, amenities: ['Dual Monitor', 'Whiteboard'] },
		{
			roomNumber: 'B206',
			name: 'Ops Command',
			capacity: 16,
			amenities: ['Video Conferencing', 'Smart Display', 'Conference Phone'],
		},
	],
	'Wing C': [
		{ roomNumber: 'C301', name: 'Training Lab', capacity: 20, amenities: ['Training Pods', 'Smart Display'] },
		{ roomNumber: 'C302', name: 'Mentor Hall', capacity: 18, amenities: ['Projector', 'Whiteboard'] },
		{ roomNumber: 'C303', name: 'Workshop Arena', capacity: 24, amenities: ['Projector', 'Audio System'] },
		{ roomNumber: 'C304', name: 'Learning Nook', capacity: 8, amenities: ['Whiteboard', 'Monitor'] },
		{ roomNumber: 'C305', name: 'Innovation Pit', capacity: 10, amenities: ['Video Conferencing', 'Whiteboard'] },
		{ roomNumber: 'C306', name: 'Design Review', capacity: 12, amenities: ['Smart Display', 'Conference Phone'] },
	],
	'Wing D': [
		{ roomNumber: 'D401', name: 'Executive Boardroom', capacity: 14, amenities: ['Video Conferencing', 'Premium Seating'] },
		{ roomNumber: 'D402', name: 'Orion Suite', capacity: 10, amenities: ['Projector', 'Conference Phone'] },
		{ roomNumber: 'D403', name: 'Vision Room', capacity: 8, amenities: ['Smart Display', 'Whiteboard'] },
		{ roomNumber: 'D404', name: 'Investor Lounge', capacity: 12, amenities: ['Video Conferencing', 'Coffee Station'] },
		{ roomNumber: 'D405', name: 'Private Cabin 1', capacity: 4, amenities: ['Monitor', 'Whiteboard'] },
		{ roomNumber: 'D406', name: 'Private Cabin 2', capacity: 4, amenities: ['Monitor', 'Whiteboard'] },
	],
};

const ADMIN_EMAIL = 'admin@siemensbooking.local';
const ADMIN_PASSWORD = 'Admin123!';

const ROOM_IMAGES_BY_WING = {
	'Wing A': [
		'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
		'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80',
	],
	'Wing B': [
		'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
		'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80',
	],
	'Wing C': [
		'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
		'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1200&q=80',
	],
	'Wing D': [
		'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
		'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80',
	],
};

function roomImageForWing(wing, index) {
	const options = ROOM_IMAGES_BY_WING[wing] || ROOM_IMAGES_BY_WING['Wing A'];
	return options[index % options.length];
}

function slugify(text) {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '.');
}

function avatarFor(name, index) {
	const palette = ['009999', '0f766e', '2563eb', '9333ea', 'd97706', 'be123c'];
	const background = palette[index % palette.length];
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=fff`;
}

function dayStart(daysFromToday) {
	const now = new Date();
	const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysFromToday, 8, 0, 0, 0);
	return start;
}

async function seed() {
	await mongoose.connect(process.env.MONGODB_URI);

	console.log('Connected to MongoDB for seeding.');
	const summary = {
		wingsUpserted: 0,
		roomsUpserted: 0,
		usersCreated: 0,
		usersReused: 0,
		bookingsCreated: 0,
		bookingsReused: 0,
	};

	for (const wing of DEFAULT_WINGS) {
		await Wing.updateOne({ key: wing.key }, { $set: wing }, { upsert: true });
		summary.wingsUpserted += 1;
	}

	for (const [wing, templates] of Object.entries(ROOM_TEMPLATES)) {
		for (const [index, room] of templates.entries()) {
			await Room.updateOne(
				{ wing, roomNumber: room.roomNumber },
				{
					$set: {
						...room,
						wing,
						images: room.images && room.images.length ? room.images : [roomImageForWing(wing, index)],
						features: room.capacity >= 12 ? ['Hybrid setup'] : ['Focus setup'],
						tags: room.capacity >= 12 ? ['team', 'presentation'] : ['focus', 'sync'],
						isAvailable: true,
					},
				},
				{ upsert: true },
			);
			summary.roomsUpserted += 1;
		}
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
		summary.usersCreated += 1;
	} else {
		console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
		summary.usersReused += 1;
	}

	for (let index = 0; index < DEMO_USERS.length; index += 1) {
		const name = DEMO_USERS[index];
		const email = `${slugify(name)}@demo.siemensbooking.local`;
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			summary.usersReused += 1;
			continue;
		}

		const user = new User({
			name,
			email,
			role: 'user',
			avatarUrl: avatarFor(name, index),
			preferences: {
				defaultWing: DEFAULT_WINGS[index % DEFAULT_WINGS.length].key,
				preferredAmenities: ['Whiteboard', 'Video Conferencing'],
				defaultCapacity: 4 + (index % 5) * 2,
			},
		});
		user.setPassword(DEMO_USER_PASSWORD);
		await user.save();
		summary.usersCreated += 1;
	}

	const allRooms = await Room.find({}).sort({ wing: 1, roomNumber: 1 });
	const allUsers = await User.find({}).sort({ email: 1 });
	if (allRooms.length === 0 || allUsers.length < 2) {
		throw new Error('Insufficient rooms or users to generate bookings.');
	}

	const base = dayStart(1);
	const durations = [30, 45, 60, 90];
	const meetingTopics = [
		'Sprint Planning',
		'Weekly Sync',
		'Client Demo Review',
		'Architecture Discussion',
		'Product Roadmap',
		'Operations Checkpoint',
		'Release Readiness',
		'Design Critique',
	];

	for (let index = 0; index < TARGET_BOOKINGS; index += 1) {
		const room = allRooms[index % allRooms.length];
		const owner = allUsers[(index * 3) % allUsers.length];
		const attendeeCount = 2 + (index % Math.min(6, Math.max(2, room.capacity - 1)));
		const attendeeUsers = [owner._id];
		for (let offset = 1; attendeeUsers.length < attendeeCount; offset += 1) {
			const nextUser = allUsers[(index + offset * 2) % allUsers.length];
			if (!attendeeUsers.find(id => id.toString() === nextUser._id.toString())) {
				attendeeUsers.push(nextUser._id);
			}
		}

		const dayOffset = Math.floor(index / 6);
		const slot = index % 6;
		const startHour = 9 + slot;
		const minute = slot % 2 === 0 ? 0 : 30;
		const duration = durations[index % durations.length];
		const startAt = new Date(base);
		startAt.setDate(base.getDate() + dayOffset);
		startAt.setHours(startHour, minute, 0, 0);
		const endAt = new Date(startAt.getTime() + duration * 60 * 1000);

		const bookingKey = `${room._id.toString()}-${startAt.toISOString()}`;
		const existingBooking = await Booking.findOne({ room: room._id, startAt, notes: bookingKey });
		if (existingBooking) {
			summary.bookingsReused += 1;
			continue;
		}

		await Booking.create({
			user: owner._id,
			room: room._id,
			wing: room.wing,
			startAt,
			endAt,
			status: 'confirmed',
			purpose: `${meetingTopics[index % meetingTopics.length]} - ${room.name}`,
			attendees: attendeeUsers.length,
			attendeeUsers,
			amenitiesRequested: room.amenities.slice(0, 2),
			notes: bookingKey,
			createdBy: owner._id,
		});
		summary.bookingsCreated += 1;
	}

	console.log('Seed summary:', summary);
	console.log(`Demo login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
	console.log(`Demo user password: ${DEMO_USER_PASSWORD}`);
	console.log('Backend seed complete.');
	process.exit(0);
}

seed().catch(err => {
	console.error('Seed failed:', err);
	process.exit(1);
});
