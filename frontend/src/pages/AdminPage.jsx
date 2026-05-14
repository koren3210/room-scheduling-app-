import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import PageShell from '../components/PageShell.jsx';
import AdminSection from '../components/AdminSection.jsx';
import { createRoom, fetchRooms, deleteRoom } from '../api/rooms';

function fileToDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ''));
		reader.onerror = () => reject(new Error('Failed to read image file.'));
		reader.readAsDataURL(file);
	});
}

export default function AdminPage() {
	const queryClient = useQueryClient();
	const roomsQuery = useQuery({
		queryKey: ['admin-rooms'],
		queryFn: () => fetchRooms(),
	});
	const [adminRooms, setAdminRooms] = useState([]);

	const mergedRooms = (roomsQuery.data || []).map(room => ({
		id: room._id || room.id,
		name: room.name,
		wing: room.wing,
		capacity: room.capacity,
		amenities: room.amenities || [],
		images: room.images || [],
	}));
	const displayRooms = adminRooms.length > 0 ? [...mergedRooms, ...adminRooms] : mergedRooms;

	const handleAddRoom = async event => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const name = formData.get('name');
		const wing = formData.get('wing');
		const capacity = formData.get('capacity');
		const imageFile = formData.get('image');
		let amenities;
		try {
			const amenitiesJson = formData.get('amenitiesJson');
			const parsedAmenities = typeof amenitiesJson === 'string' && amenitiesJson.length > 0 ? JSON.parse(amenitiesJson) : [];
			amenities = Array.isArray(parsedAmenities) ? parsedAmenities : [];
		} catch {
			amenities = [];
		}

		if (!name || !wing || !capacity) return;

		let imageDataUrl = '';
		if (imageFile instanceof File && imageFile.size > 0) {
			if (!imageFile.type.startsWith('image/')) {
				toast.warn('Please select a valid image file.');
				return;
			}

			try {
				imageDataUrl = await fileToDataUrl(imageFile);
			} catch (error) {
				toast.error(error?.message || 'Unable to process room image.');
				return;
			}
		}

		const roomPayload = {
			name: String(name),
			wing: String(wing),
			capacity: Number(capacity),
			amenities,
			roomNumber: String(name).trim().replace(/\s+/g, '-').toLowerCase(),
			images: imageDataUrl ? [imageDataUrl] : [],
		};

		try {
			const savedRoom = await createRoom(roomPayload);
			queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
			toast.success(`Room ${savedRoom.name} added to registry.`);
			setAdminRooms(curr => [
				...curr,
				{
					id: savedRoom._id ?? savedRoom.id ?? `a-${Date.now()}`,
					name: savedRoom.name,
					wing: savedRoom.wing,
					capacity: savedRoom.capacity,
					amenities: savedRoom.amenities || [],
					images: savedRoom.images || [],
				},
			]);
			event.currentTarget?.reset?.();
		} catch (error) {
			toast.error(error?.message || 'Unable to create room.');
			console.error('Unable to create room', error);
		}
	};

	const handleDeleteRoom = async roomId => {
		try {
			await deleteRoom(roomId);
			queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
			setAdminRooms(curr => curr.filter(r => r.id !== roomId));
			toast.success('Room deleted successfully.');
		} catch (error) {
			toast.error('Failed to delete room.');
			console.error('Error deleting room:', error);
		}
	};

	return (
		<PageShell title='Admin Module' subtitle='Space registry management'>
			{roomsQuery.isLoading ? (
				<p className='text-sm text-slate-500'>Loading registry...</p>
			) : (
				<AdminSection adminRooms={displayRooms} onAddRoom={handleAddRoom} onDeleteRoom={handleDeleteRoom} />
			)}
		</PageShell>
	);
}
