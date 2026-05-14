const express = require('express');
const axios = require('axios');
const router = express.Router();

// Utility to fetch all rooms and users for context
const Room = require('../models/Room');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Returns a local ISO string "YYYY-MM-DDTHH:MM:SS" (no Z) from a Date using its
// numeric components so the frontend parses it as the user's local time.
function toLocalISOString(date) {
	const pad = n => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

// clientNow is a local ISO string like "2026-05-13T15:30:00" sent from the browser.
// We use it to derive the correct base date so server timezone never matters.
function parseDateTimeFallback(rawMessage, clientNow) {
	const message = String(rawMessage || '').toLowerCase();

	// Parse base date components from the client's local time string.
	let baseYear, baseMonth, baseDay;
	if (clientNow) {
		const m = String(clientNow).match(/^(\d{4})-(\d{2})-(\d{2})/);
		if (m) {
			baseYear = parseInt(m[1], 10);
			baseMonth = parseInt(m[2], 10) - 1; // 0-indexed
			baseDay = parseInt(m[3], 10);
		}
	}
	if (!baseYear) {
		// Fallback: use server date (best effort)
		const now = new Date();
		baseYear = now.getFullYear();
		baseMonth = now.getMonth();
		baseDay = now.getDate();
	}

	// Handle common natural-language day hints.
	if (/(tomorrow|tommorow|tommorrow)/i.test(message)) {
		const tmp = new Date(baseYear, baseMonth, baseDay + 1);
		baseYear = tmp.getFullYear();
		baseMonth = tmp.getMonth();
		baseDay = tmp.getDate();
	}

	// Require either HH:MM or "H am/pm" so bare numbers like "3 people" are never matched.
	const hourMatch = message.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?\b|\b(\d{1,2})\s+(am|pm)\b/i);
	if (!hourMatch) return null;

	let hours, minutes, period;
	if (hourMatch[1] !== undefined) {
		// Matched HH:MM[:SS] [am/pm]
		hours = Number(hourMatch[1]);
		minutes = Number(hourMatch[2]);
		period = hourMatch[3] ? hourMatch[3].toLowerCase() : null;
	} else {
		// Matched H am/pm
		hours = Number(hourMatch[4]);
		minutes = 0;
		period = hourMatch[5] ? hourMatch[5].toLowerCase() : null;
	}

	if (period === 'pm' && hours < 12) hours += 12;
	if (period === 'am' && hours === 12) hours = 0;

	// Build Date objects using LOCAL component constructors so JS handles overflow.
	const startAt = new Date(baseYear, baseMonth, baseDay, hours, minutes, 0, 0);
	const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

	// Return as local ISO strings (no Z) — frontend will parse as local time.
	return {
		startAt: toLocalISOString(startAt),
		endAt: toLocalISOString(endAt),
	};
}

// POST /api/ai/parse-booking
router.post('/parse-booking', async (req, res) => {
	try {
		const { message, clientNow } = req.body;
		if (!message) return res.status(400).json({ error: 'Missing message' });

		console.log('📨 AI request received:', message);
		console.log('🔑 process.env.GOOGLE_AI_API_KEY exists?', !!process.env.GOOGLE_AI_API_KEY);
		console.log('🔑 process.env.GOOGLE_AI_API_KEY value:', process.env.GOOGLE_AI_API_KEY?.substring(0, 10) + '...');

		// Fetch context for grounding — only rooms marked available
		const rooms = await Room.find({ isAvailable: true });
		const users = await User.find({});

		console.log(`📦 Context: ${rooms.length} available rooms, ${users.length} users`);

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

		// Exclude rooms that have a confirmed/pending booking overlapping the requested window.
		// Derive the requested window from clientNow + message so we can query before the AI responds.
		const requestedWindow = parseDateTimeFallback(message, clientNow);
		if (requestedWindow) {
			const winStart = new Date(requestedWindow.startAt);
			const winEnd = new Date(requestedWindow.endAt);
			const busyBookings = await Booking.find({
				status: { $in: ['pending', 'confirmed'] },
				startAt: { $lt: winEnd },
				endAt: { $gt: winStart },
			})
				.select('room')
				.lean();
			const busyRoomIds = new Set(busyBookings.map(b => String(b.room)));
			const before = roomCandidates.length;
			const blockedRooms = roomCandidates.filter(r => busyRoomIds.has(String(r._id)));
			roomCandidates = roomCandidates.filter(r => !busyRoomIds.has(String(r._id)));
			console.log(
				`🚫 Excluded ${before - roomCandidates.length} booked rooms for window ${requestedWindow.startAt} – ${requestedWindow.endAt}`,
			);

			// If every matching room is occupied for that window, return a clear message immediately.
			if (roomCandidates.length === 0 && before > 0) {
				const blockedNames = blockedRooms.map(r => `${r.name} (${r.wing})`).join(', ');
				const timeStr = `${requestedWindow.startAt.slice(11, 16)} – ${requestedWindow.endAt.slice(11, 16)}`;
				console.log(`⛔ All matching rooms are booked at ${timeStr}: ${blockedNames}`);
				return res.json({
					error: `All rooms matching your request are already booked at ${timeStr}. Rooms unavailable: ${blockedNames}. Please try a different time or different criteria.`,
				});
			}
		}

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

USER'S CURRENT LOCAL TIME: ${clientNow || new Date().toISOString().slice(0, 19)}

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
- If time not clear, keep startAt/endAt as null.
- startAt and endAt MUST be in LOCAL time format "YYYY-MM-DDTHH:MM:SS" (no Z, no UTC offset). Base all date/time calculations on the USER'S CURRENT LOCAL TIME above.`;

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
			const fallbackDateTime = parseDateTimeFallback(message, clientNow);
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
