const express = require('express');
const axios = require('axios');
const router = express.Router();

// Utility to fetch all rooms and users for context
const Room = require('../models/Room');
const User = require('../models/User');

function parseDateTimeFallback(rawMessage) {
	const message = String(rawMessage || '').toLowerCase();
	const now = new Date();
	let baseDate = new Date(now);

	// Handle common natural-language day hints (including common typos).
	if (/(tomorrow|tommorow|tommorrow)/i.test(message)) {
		baseDate.setDate(baseDate.getDate() + 1);
	}

	const hourMatch = message.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
	if (!hourMatch) return null;

	let hours = Number(hourMatch[1]);
	const minutes = hourMatch[2] ? Number(hourMatch[2]) : 0;
	const period = hourMatch[3] ? hourMatch[3].toLowerCase() : null;

	if (period === 'pm' && hours < 12) hours += 12;
	if (period === 'am' && hours === 12) hours = 0;

	const startAt = new Date(baseDate);
	startAt.setSeconds(0, 0);
	startAt.setHours(hours, minutes, 0, 0);

	// If no day keyword was supplied and time is already passed today, roll to tomorrow.
	if (!/(tomorrow|tommorow|tommorrow)/i.test(message) && startAt <= now) {
		startAt.setDate(startAt.getDate() + 1);
	}

	const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
	return {
		startAt: startAt.toISOString(),
		endAt: endAt.toISOString(),
	};
}

// POST /api/ai/parse-booking
router.post('/parse-booking', async (req, res) => {
	try {
		const { message } = req.body;
		if (!message) return res.status(400).json({ error: 'Missing message' });

		console.log('📨 AI request received:', message);
		console.log('🔑 process.env.GOOGLE_AI_API_KEY exists?', !!process.env.GOOGLE_AI_API_KEY);
		console.log('🔑 process.env.GOOGLE_AI_API_KEY value:', process.env.GOOGLE_AI_API_KEY?.substring(0, 10) + '...');

		// Fetch context for grounding
		const rooms = await Room.find({});
		const users = await User.find({});

		console.log(`📦 Context: ${rooms.length} rooms, ${users.length} users`);

		// Build compact, relevant context to prevent token truncation
		const lowerMessage = message.toLowerCase();
		const wingMatch = lowerMessage.match(/wing\s*([abcd])/i);
		const requestedWing = wingMatch ? `Wing ${wingMatch[1].toUpperCase()}` : null;
		const capacityMatch = lowerMessage.match(/(\d+)\s*(people|person|seats?)/i);
		const requestedCapacity = capacityMatch ? Number(capacityMatch[1]) : null;
		const amenityKeywords = ['whiteboard', 'projector', 'tv', 'screen', 'video', 'conference', 'phone', 'monitor'];
		const requestedAmenities = amenityKeywords.filter(keyword => lowerMessage.includes(keyword));

		let roomCandidates = [...rooms];
		if (requestedWing) roomCandidates = roomCandidates.filter(room => room.wing === requestedWing);
		if (requestedCapacity) roomCandidates = roomCandidates.filter(room => Number(room.capacity || 0) >= requestedCapacity);
		if (requestedAmenities.length) {
			roomCandidates = roomCandidates.filter(room => {
				const roomAmenities = (room.amenities || []).map(item => String(item).toLowerCase());
				return requestedAmenities.every(required => roomAmenities.some(item => item.includes(required)));
			});
		}
		if (!roomCandidates.length) roomCandidates = [...rooms];
		roomCandidates = roomCandidates.slice(0, 10);

		const searchableWords = lowerMessage
			.replace(/[^a-z0-9@._\s-]/g, ' ')
			.split(/\s+/)
			.filter(
				word => word.length >= 3 && !['wing', 'room', 'with', 'for', 'and', 'tomorrow', 'meeting', 'book'].includes(word),
			);

		let userCandidates = users.filter(user => {
			const name = String(user.name || '').toLowerCase();
			const email = String(user.email || '').toLowerCase();
			return searchableWords.some(word => name.includes(word) || email.includes(word));
		});
		if (!userCandidates.length) userCandidates = users.slice(0, 15);
		userCandidates = userCandidates.slice(0, 15);

		console.log(`📦 Filtered Context: ${roomCandidates.length} candidate rooms, ${userCandidates.length} candidate users`);

		const roomList = roomCandidates
			.map(r => `${r.name}|${r.wing}|${r.capacity}|${r.amenities?.join(',') || 'none'}|${r._id}`)
			.join('\n');
		const userList = userCandidates.map(u => `${u.name}|${u.email}|${u._id}`).join('\n');

		const prompt = `You are a meeting room assistant.

REQUEST: ${message}

ROOMS (name|wing|capacity|amenities|id):
${roomList}

USERS (name|email|id):
${userList}

Return ONLY a valid JSON object. No markdown, no commentary, no code fences.
Schema:
{"roomId":"...","purpose":"...","attendees":["..."],"amenities":["..."],"startAt":null,"endAt":null}

Rules:
- roomId must be an id from ROOMS.
- attendees must be user ids from USERS.
- purpose should be short text.
- If time not clear, keep startAt/endAt as null.`;

		console.log('🧠 Prompt token estimate: ~', prompt.length / 4, 'tokens');

		// Call Gemini API
		const apiKey = process.env.GOOGLE_AI_API_KEY;
		if (!apiKey) {
			console.error('❌ GOOGLE_AI_API_KEY not configured in process.env');
			return res.status(500).json({ error: 'GOOGLE_AI_API_KEY not configured' });
		}

		console.log('✅ API Key loaded');
		const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' + apiKey;
		const geminiReq = {
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
			generationConfig: {
				temperature: 0.1,
				maxOutputTokens: 4096,
			},
		};

		console.log('🚀 Calling Gemini API with gemini-2.5-flash model');
		const aiRes = await axios.post(url, geminiReq, { timeout: 30000 });
		console.log('✅ Gemini response received');

		// Parse Gemini response
		console.log('📊 Full Gemini response:', JSON.stringify(aiRes.data, null, 2));
		let text = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
		console.log('📝 Raw extracted text (length:', text.length, ')');
		console.log('📝 Text content:', text);

		// Strip markdown code block if present
		if (text.includes('```')) {
			text = text
				.replace(/```json\n?/g, '')
				.replace(/```\n?/g, '')
				.trim();
			console.log('📝 After stripping markdown (length:', text.length, ')');
			console.log('📝 Stripped text:', text);
		}

		let parsed;
		try {
			parsed = JSON.parse(text);
			console.log('✅ Parsed JSON successfully:', JSON.stringify(parsed, null, 2));
		} catch (parseErr) {
			console.error('❌ JSON parse error:', parseErr.message);
			console.error('❌ Full raw text:', text);
			// Try to fix common issues
			if (!text.endsWith('}')) {
				console.log('⚠️  Text does not end with }, trying to close it');
				text = text + '}';
				try {
					parsed = JSON.parse(text);
					console.log('✅ Fixed JSON by adding closing brace');
				} catch (err2) {
					return res.status(200).json({ error: 'AI response malformed', raw: text });
				}
			} else {
				return res.status(200).json({ error: 'AI could not parse response', raw: text });
			}
		}

		// Deterministic fallback for time/date when AI returns null.
		if (!parsed.startAt || !parsed.endAt) {
			const fallbackDateTime = parseDateTimeFallback(message);
			if (fallbackDateTime) {
				parsed.startAt = parsed.startAt || fallbackDateTime.startAt;
				parsed.endAt = parsed.endAt || fallbackDateTime.endAt;
				console.log('⏱️ Applied fallback datetime:', fallbackDateTime);
			}
		}

		res.json(parsed);
	} catch (err) {
		console.error('❌ AI endpoint error:', err.message);
		if (err.response?.data) {
			console.error('📋 API Response:', JSON.stringify(err.response.data, null, 2));
		}
		if (err.response?.status) {
			console.error('📊 Status:', err.response.status);
		}
		console.error('Stack:', err.stack);
		res.status(500).json({ error: err.message, details: err.toString() });
	}
});

module.exports = router;
