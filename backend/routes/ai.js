const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Utility to fetch all rooms and users for context
const Room = require('../models/Room');
const User = require('../models/User');

// Load API key from .env explicitly
function getApiKey() {
	let apiKey = process.env.GOOGLE_AI_API_KEY;
	if (!apiKey) {
		try {
			const envPath = path.join(__dirname, '../.env');
			const envContent = fs.readFileSync(envPath, 'utf8');
			const match = envContent.match(/GOOGLE_AI_API_KEY=(.+)/);
			if (match) {
				apiKey = match[1].trim();
			}
		} catch (e) {
			console.error('Could not read .env file:', e.message);
		}
	}
	return apiKey;
}

// POST /api/ai/parse-booking
router.post('/parse-booking', async (req, res) => {
	try {
		const { message } = req.body;
		if (!message) return res.status(400).json({ error: 'Missing message' });

		console.log('📨 AI request received:', message);

		// Fetch context for grounding
		const rooms = await Room.find({});
		const users = await User.find({});

		console.log(`📦 Context: ${rooms.length} rooms, ${users.length} users`);

		// Compose prompt for Gemini
		const prompt = `You are a smart meeting room assistant.\n\nAvailable rooms (with amenities):\n${rooms
			.map(r => `- ${r.name} (${r.wing}), capacity ${r.capacity}, amenities: ${r.amenities?.join(', ') || 'none'}`)
			.join('\n')}\n\nUsers:\n${users
			.map(u => `- ${u.name} (${u.email}) [id: ${u._id}]`)
			.join(
				'\n',
			)}\n\nGiven the following user request, extract:\n- best room id (by _id)\n- meeting purpose\n- attendee user ids (by _id)\n- required amenities\n- start and end time if mentioned\n\nUser request: "${message}"\n\nRespond as JSON: {roomId, purpose, attendees, amenities, startAt, endAt}`;

		// Call Gemini API
		const apiKey = getApiKey();
		if (!apiKey) {
			console.error('❌ GOOGLE_AI_API_KEY not found in process.env or .env file');
			return res.status(500).json({ error: 'GOOGLE_AI_API_KEY not configured' });
		}

		console.log('🔑 Using API key:', apiKey.substring(0, 10) + '...');
		const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey;
		const geminiReq = {
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
			generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
		};

		console.log('🚀 Calling Gemini API...');
		const aiRes = await axios.post(url, geminiReq, { timeout: 30000 });
		console.log('✅ Gemini response received');

		// Parse Gemini response
		const text = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
		console.log('📝 AI response text:', text);

		let parsed;
		try {
			parsed = JSON.parse(text);
			console.log('✅ Parsed JSON:', parsed);
		} catch (parseErr) {
			console.error('❌ JSON parse error:', parseErr.message);
			return res.status(200).json({ error: 'AI could not parse response', raw: text });
		}
		res.json(parsed);
	} catch (err) {
		console.error('❌ AI endpoint error:', err.message);
		console.error('Stack:', err.stack);
		res.status(500).json({ error: err.message, details: err.toString() });
	}
});

module.exports = router;
