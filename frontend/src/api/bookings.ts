import api from './client';

export interface BookingPayload {
	room: string;
	wing: 'Wing A' | 'Wing B' | 'Wing C' | 'Wing D';
	startAt: string;
	endAt: string;
	attendees?: number;
	attendeeUsers?: string[];
	purpose?: string;
	notes?: string;
}

export interface BookingUser {
	_id?: string;
	id?: string;
	name: string;
	email: string;
	avatarUrl?: string;
}

export interface BookingRoom {
	_id?: string;
	id?: string;
	name: string;
	wing: string;
	roomNumber?: string;
	capacity?: number;
}

export interface Booking {
	_id?: string;
	id?: string;
	user: string | BookingUser;
	room: string | BookingRoom;
	wing: string;
	startAt: string;
	endAt: string;
	status?: string;
	purpose?: string;
	attendees?: number;
	attendeeUsers?: BookingUser[];
	notes?: string;
}

export async function fetchBookings(filter?: { userId?: string; roomId?: string; status?: string }) {
	const params: Record<string, string> = {};

	if (filter?.userId) params.userId = filter.userId;
	if (filter?.roomId) params.roomId = filter.roomId;
	if (filter?.status) params.status = filter.status;

	const response = await api.get<Booking[]>('/api/bookings', { params });
	return response.data;
}

export async function createBooking(payload: BookingPayload) {
	const response = await api.post<Booking>('/api/bookings', payload);
	return response.data;
}

export async function updateBooking(id: string, payload: Partial<BookingPayload>) {
	const response = await api.put<Booking>(`/api/bookings/${id}`, payload);
	return response.data;
}
