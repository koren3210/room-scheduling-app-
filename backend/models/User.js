const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
		passwordHash: { type: String, required: true },
		passwordSalt: { type: String, required: true },
		avatarUrl: { type: String, trim: true },
		role: { type: String, enum: ['user', 'admin'], default: 'user' },
		preferences: {
			defaultWing: { type: String, enum: ['Wing A', 'Wing B', 'Wing C', 'Wing D'], default: 'Wing A' },
			preferredAmenities: [{ type: String, trim: true }],
			defaultCapacity: { type: Number, default: 4 },
			timezone: { type: String, default: 'UTC' },
		},
		customTags: [{ type: String, trim: true }],
	},
	{
		timestamps: true,
	},
);

UserSchema.methods.setPassword = function (password) {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
	this.passwordSalt = salt;
	this.passwordHash = hash;
};

UserSchema.methods.validatePassword = function (password) {
	const hash = crypto.pbkdf2Sync(password, this.passwordSalt, 100000, 64, 'sha512').toString('hex');
	return this.passwordHash === hash;
};

UserSchema.methods.getAvatar = function () {
	if (this.avatarUrl) return this.avatarUrl;
	const name = this.name ? encodeURIComponent(this.name) : 'User';
	return `https://ui-avatars.com/api/?name=${name}&background=009999&color=fff`;
};

module.exports = mongoose.model('User', UserSchema);
