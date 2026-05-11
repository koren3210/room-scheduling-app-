const mongoose = require('mongoose');

const WingSchema = new mongoose.Schema(
	{
		key: { type: String, required: true, unique: true, enum: ['Wing A', 'Wing B', 'Wing C', 'Wing D'], index: true },
		name: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		sortOrder: { type: Number, default: 0 },
		active: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model('Wing', WingSchema);
