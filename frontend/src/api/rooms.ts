import api from './client';

export interface RoomPayload {
	name: string;
	wing: 'Wing A' | 'Wing B' | 'Wing C' | 'Wing D';
	capacity: number;
	amenities: string[];
	roomNumber?: string;
	images?: string[];
}

export interface Room {
	_id?: string;
	id?: string;
	name: string;
	wing: 'Wing A' | 'Wing B' | 'Wing C' | 'Wing D';
	capacity: number;
	amenities: string[];
	roomNumber?: string;
	images?: string[];
	isAvailable?: boolean;
	nextBookingAt?: string | null;
}

export async function fetchRooms(filter?: {
	wing?: string;
	capacity?: number;
	amenities?: string[];
	available?: boolean;
	sortBy?: 'wing' | 'name' | 'capacity' | 'nextBookingDate';
	sortOrder?: 'asc' | 'desc';
}) {
	const params: Record<string, string | number | boolean> = {};

	if (filter?.wing) params.wing = filter.wing;
	if (filter?.capacity) params.capacity = filter.capacity;
	if (filter?.amenities) params.amenities = filter.amenities.join(',');
	if (filter?.available !== undefined) params.available = filter.available;
	if (filter?.sortBy) params.sortBy = filter.sortBy;
	if (filter?.sortOrder) params.sortOrder = filter.sortOrder;

	const response = await api.get<Room[]>('/api/rooms', { params });
	return response.data;
}

export async function createRoom(roomPayload: RoomPayload) {
	const response = await api.post<Room>('/api/rooms', roomPayload);
	return response.data;
}
