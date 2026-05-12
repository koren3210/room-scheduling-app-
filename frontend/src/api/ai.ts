import api from './client';

export async function parseBookingAI(message: string) {
	const response = await api.post('/api/ai/parse-booking', { message });
	return response.data;
}
