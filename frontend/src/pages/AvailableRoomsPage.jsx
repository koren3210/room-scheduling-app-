import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import RoomAvailabilityModal from '../components/RoomAvailabilityModal.jsx';
import { fetchRooms } from '../api/rooms';

function toLocalIso(date) {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
	const pad = value => String(value).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
		date.getMinutes(),
	)}:00`;
}

export default function AvailableRoomsPage() {
	const navigate = useNavigate();
	const [wingFilter, setWingFilter] = useState('all');
	const [sortBy, setSortBy] = useState('name');
	const [availabilityOpen, setAvailabilityOpen] = useState(false);
	const [selectedRoom, setSelectedRoom] = useState(null);

	const roomsQuery = useQuery({
		queryKey: ['available-rooms', wingFilter],
		queryFn: () =>
			fetchRooms({
				available: true,
				wing: wingFilter === 'all' ? undefined : wingFilter,
			}),
	});

	const rooms = useMemo(() => {
		const source = [...(roomsQuery.data || [])];
		if (sortBy === 'capacity-asc') source.sort((a, b) => a.capacity - b.capacity);
		if (sortBy === 'capacity-desc') source.sort((a, b) => b.capacity - a.capacity);
		if (sortBy === 'name') source.sort((a, b) => a.name.localeCompare(b.name));
		if (sortBy === 'wing') source.sort((a, b) => a.wing.localeCompare(b.wing));
		return source;
	}, [roomsQuery.data, sortBy]);

	return (
		<PageShell title='Available Rooms' subtitle='Browse all available spaces and sort quickly'>
			<RoomAvailabilityModal
				open={availabilityOpen}
				room={selectedRoom}
				onClose={() => setAvailabilityOpen(false)}
				onSelectSlot={({ start, end, room }) => {
					setAvailabilityOpen(false);
					navigate('/dashboard/booking', {
						state: {
							roomToBook: room,
							slotStart: toLocalIso(start),
							slotEnd: toLocalIso(end),
						},
					});
				}}
			/>

			<div className='mb-4 flex flex-wrap gap-2'>
				<select
					value={wingFilter}
					onChange={event => setWingFilter(event.target.value)}
					className='bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs'
				>
					<option value='all'>All Wings</option>
					<option value='Wing A'>Wing A</option>
					<option value='Wing B'>Wing B</option>
					<option value='Wing C'>Wing C</option>
					<option value='Wing D'>Wing D</option>
				</select>

				<select
					value={sortBy}
					onChange={event => setSortBy(event.target.value)}
					className='bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs'
				>
					<option value='name'>Sort by Name</option>
					<option value='wing'>Sort by Wing</option>
					<option value='capacity-asc'>Capacity Low to High</option>
					<option value='capacity-desc'>Capacity High to Low</option>
				</select>
			</div>

			{roomsQuery.isLoading && <p className='text-sm text-slate-500'>Loading available rooms...</p>}
			{!roomsQuery.isLoading && rooms.length === 0 && <p className='text-sm text-slate-500'>No available rooms found.</p>}

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{rooms.map(room => (
					<div
						key={room._id || room.id}
						className='bg-white/80 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm'
					>
						<img
							src={
								room.images?.[0] ||
								'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80'
							}
							alt={room.name}
							className='h-28 w-full object-cover'
						/>
						<div className='p-4'>
							<p className='font-bold text-[15px] text-slate-900 dark:text-white'>{room.name}</p>
							<p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1'>
								{room.wing} • {room.capacity} Seats
							</p>
							<div className='flex flex-wrap gap-1 mt-3'>
								{(room.amenities || []).map(item => (
									<span
										key={`${room._id || room.id}-${item}`}
										className='text-[9px] font-bold bg-black/[0.04] dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04] uppercase tracking-wider'
									>
										{item}
									</span>
								))}
							</div>
							<button
								type='button'
								onClick={() => {
									setSelectedRoom({
										id: room._id || room.id,
										name: room.name,
										wing: room.wing,
									});
									setAvailabilityOpen(true);
								}}
								className='w-full mt-4 py-2 border border-siemens-petrol/30 text-siemens-petrol rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-siemens-petrol/10 transition-colors'
							>
								View Availability
							</button>
							<button
								type='button'
								onClick={() =>
									navigate('/dashboard/booking', {
										state: {
											roomToBook: {
												id: room._id || room.id,
												name: room.name,
												wing: room.wing,
											},
										},
									})
								}
								className='w-full mt-2 py-2 bg-siemens-petrol text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-siemens-glow transition-colors'
							>
								Book
							</button>
						</div>
					</div>
				))}
			</div>
		</PageShell>
	);
}
