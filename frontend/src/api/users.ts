import api from './client';

export interface UserOption {
	id: string;
	name: string;
	email: string;
	avatarUrl?: string;
}

export async function fetchUsers(query?: string) {
	const params: Record<string, string> = {};
	if (query?.trim()) params.q = query.trim();
	const response = await api.get<UserOption[]>('/api/users', { params });
	return response.data;
}
