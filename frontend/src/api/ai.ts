import api from './client';

export async function parseBookingAI(message: string) {
	// Send the client's local datetime so the backend can anchor "today/tomorrow/9 AM"
	// to the user's actual local time, not the server's timezone.
	const clientNow = new Date().toLocaleString('sv-SE', { hour12: false }).replace(' ', 'T'); // e.g. "2026-05-13T15:30:00"
	const response = await api.post('/api/ai/parse-booking', { message, clientNow });
	return response.data;
}
