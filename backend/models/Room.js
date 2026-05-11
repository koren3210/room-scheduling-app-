const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
	{
		wing: { type: String, required: true, enum: ['Wing A', 'Wing B', 'Wing C', 'Wing D'], index: true },
		roomNumber: { type: String, required: true, trim: true },
		name: { type: String, trim: true },
		floor: { type: String, trim: true },
		capacity: { type: Number, required: true, min: 1 },
		amenities: [{ type: String, trim: true }],
		features: [{ type: String, trim: true }],
		tags: [{ type: String, trim: true }],
		isAvailable: { type: Boolean, default: true },
		location: { type: String, trim: true },
		images: [{ type: String, trim: true }],
		notes: { type: String, trim: true },
	},
	{
		timestamps: true,
	},
);

RoomSchema.index({ wing: 1, roomNumber: 1 }, { unique: true });
RoomSchema.index({ capacity: 1 });
RoomSchema.index({ amenities: 1 });

module.exports = mongoose.model('Room', RoomSchema);
