const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
		wing: { type: String, required: true, enum: ['Wing A', 'Wing B', 'Wing C', 'Wing D'], index: true },
		startAt: { type: Date, required: true, index: true },
		endAt: { type: Date, required: true, index: true },
		status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
		purpose: { type: String, trim: true },
		attendees: { type: Number, default: 1, min: 1 },
		amenitiesRequested: [{ type: String, trim: true }],
		notes: { type: String, trim: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	},
	{
		timestamps: true,
	},
);

BookingSchema.index({ room: 1, startAt: 1, endAt: 1 });
BookingSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
