import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageShell from '../components/PageShell.jsx';
import FacilitySection from '../components/FacilitySection.jsx';
import FacilityMapRadar from '../components/FacilityMapRadar.jsx';
import { fetchRooms } from '../api/rooms';
import { subscribeToBookingNotifications } from '../api/bookings';
import { useAuth } from '../contexts/AuthContext';

export default function FacilityPage() {
	const [wingFilter, setWingFilter] = useState('Wing D');
	const [sortBy, setSortBy] = useState('wing');
	const queryClient = useQueryClient();
	const { isAuthenticated, user } = useAuth();

	const roomsQuery = useQuery({
		queryKey: ['facility-rooms', wingFilter, sortBy],
		queryFn: () =>
			fetchRooms({
				wing: wingFilter,
				sortBy: sortBy === 'date' ? 'nextBookingDate' : 'wing',
				sortOrder: 'asc',
			}),
		refetchInterval: 45000,
		refetchOnWindowFocus: true,
	});

	useEffect(() => {
		if (!isAuthenticated || !user?.id) return undefined;

		const token = localStorage.getItem('token');
		if (!token) return undefined;

		const source = subscribeToBookingNotifications(token, event => {
			if (!event?.eventType || event.eventType === 'connected') return;
			queryClient.invalidateQueries({ queryKey: ['facility-rooms'] });
		});

		return () => {
			source.close();
		};
	}, [isAuthenticated, queryClient, user?.id]);

	const rooms = (roomsQuery.data || []).map(room => ({
		id: room._id || room.id,
		name: room.name,
		roomNumber: room.roomNumber || '',
		wing: room.wing,
		capacity: room.capacity,
		status: room.isAvailableNow === false ? 'occupied' : 'available',
		until:
			room.isAvailableNow === false
				? room.occupiedUntil
					? new Date(room.occupiedUntil).toLocaleString()
					: ''
				: room.nextBookingAt
					? new Date(room.nextBookingAt).toLocaleString()
					: '',
	}));

	return (
		<PageShell title='Facility Radar' subtitle='Live occupancy metrics for APC site'>
			<div className='mb-4 flex flex-wrap gap-2'>
				<select
					value={wingFilter}
					onChange={event => setWingFilter(event.target.value)}
					className='bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs'
				>
					<option value='Wing D'>Wing D</option>
					<option value='Wing B'>Wing B</option>
					<option value='Wing C'>Wing C</option>
				</select>

				<select
					value={sortBy}
					onChange={event => setSortBy(event.target.value)}
					className='bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs'
				>
					<option value='wing'>Sort by Wing</option>
					<option value='date'>Sort by Next Booking Date</option>
				</select>
			</div>
			{roomsQuery.isLoading ? (
				<p className='text-sm text-slate-500'>Loading rooms...</p>
			) : (
				<>
					<FacilityMapRadar rooms={rooms} activeWing={wingFilter} onWingChange={setWingFilter} />
					<FacilitySection rooms={rooms} />
				</>
			)}
		</PageShell>
	);
}
