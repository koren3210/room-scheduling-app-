import axios from 'axios';

const api = axios.create({
	baseURL: 'http://localhost:5005',
	withCredentials: true, // Matches the backend config
	headers: {
		'Content-Type': 'application/json',
	},
});

export async function loginUser(credentials: { email: string; password: string }) {
	try {
		const response = await api.post('/api/auth/login', credentials);
		return response.data;
	} catch (error: any) {
		// Axios puts the server error inside error.response.data
		throw new Error(error.response?.data?.error || 'Login failed');
	}
}

export async function signUp(payload: any) {
	try {
		const response = await api.post('/api/auth/register', payload);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response?.data?.error || 'Registration failed');
	}
}
