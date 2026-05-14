import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarDays, Clock3, X } from 'lucide-react';
import { fetchBookings } from '../api/bookings';

function startOfLocalDay(date) {
	const copy = new Date(date);
	copy.setHours(0, 0, 0, 0);
	return copy;
}

function plusDays(date, days) {
	const copy = new Date(date);
	copy.setDate(copy.getDate() + days);
	return copy;
}

export default function RoomAvailabilityModal({ open, room, onClose, onSelectSlot }) {
	const roomId = room?.id || room?._id || '';
	const [visibleRange, setVisibleRange] = useState(() => {
		const start = startOfLocalDay(new Date());
		const end = plusDays(start, 7);
		return { start, end };
	});

	const bookingsQuery = useQuery({
		queryKey: ['room-availability', roomId, visibleRange.start.toISOString(), visibleRange.end.toISOString()],
		enabled: Boolean(open && roomId),
		queryFn: () =>
			fetchBookings({
				roomId,
				status: 'pending,confirmed',
				start: visibleRange.start.toISOString(),
				end: visibleRange.end.toISOString(),
			}),
	});

	const normalizedBookings = useMemo(() => {
		return (bookingsQuery.data || []).map(booking => {
			const seen = new Set();
			const owner = typeof booking.user === 'object' && booking.user ? booking.user : null;
			const attendees = Array.isArray(booking.attendeeUsers) ? booking.attendeeUsers : [];
			const people = [];

			for (const person of [owner, ...attendees]) {
				if (!person || typeof person !== 'object') continue;
				const id = person._id || person.id || person.email || person.name;
				if (!id || seen.has(String(id))) continue;
				seen.add(String(id));
				people.push({
					id: String(id),
					name: person.name || person.email || 'User',
					avatarUrl:
						person.avatarUrl ||
						`https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'User')}&background=009999&color=fff`,
				});
			}

			return {
				booking,
				people,
			};
		});
	}, [bookingsQuery.data]);

	const events = useMemo(
		() =>
			normalizedBookings.map(item => ({
				id: item.booking._id || item.booking.id,
				title: item.booking.purpose || 'Busy',
				start: item.booking.startAt,
				end: item.booking.endAt,
				className: 'room-busy-event',
				extendedProps: {
					avatars: item.people,
					participantNames: item.people.map(person => person.name),
				},
			})),
		[normalizedBookings],
	);

	const bookedPeople = useMemo(() => {
		const seen = new Set();
		const people = [];

		for (const entry of normalizedBookings) {
			for (const person of entry.people) {
				if (seen.has(person.id)) continue;
				seen.add(person.id);
				people.push(person);
			}
		}

		return people;
	}, [normalizedBookings]);

	if (!open || typeof document === 'undefined') return null;

	return createPortal(
		<div className='fixed inset-0 z-[100002] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4'>
			<div className='w-full max-w-6xl bg-white dark:bg-[#0f151a] rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl'>
				<div className='px-5 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3'>
					<div className='min-w-0'>
						<p className='text-[10px] font-black uppercase tracking-widest text-slate-500'>Room Availability</p>
						<h3 className='text-sm font-bold text-slate-900 dark:text-white truncate'>
							{room ? `${room.name} (${room.wing})` : 'Select a room'}
						</h3>
					</div>
					<div className='flex items-center gap-3'>
						<div className='hidden sm:flex items-center gap-3 text-[10px] text-slate-500'>
							<span className='inline-flex items-center gap-1'>
								<CalendarDays className='w-3.5 h-3.5' />
								Day/Week views
							</span>
							<span className='inline-flex items-center gap-1'>
								<Clock3 className='w-3.5 h-3.5' />
								Click and drag to pick free slot
							</span>
						</div>
						<button
							type='button'
							onClick={onClose}
							className='p-2 rounded-lg border border-black/10 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors'
						>
							<X className='w-4 h-4' />
						</button>
					</div>
				</div>

				<div className='px-5 py-3 flex items-center gap-4 border-b border-black/10 dark:border-white/10 text-[11px] font-bold'>
					<span className='inline-flex items-center gap-2 text-slate-500'>
						<span className='inline-block w-3 h-3 rounded-sm bg-rose-500/80' />
						Busy
					</span>
					<span className='inline-flex items-center gap-2 text-slate-500'>
						<span className='inline-block w-3 h-3 rounded-sm bg-siemens-petrol/80' />
						Selected slot
					</span>
					{bookingsQuery.isLoading && <span className='text-slate-400'>Loading bookings...</span>}
				</div>

				<div className='px-5 py-3 border-b border-black/10 dark:border-white/10'>
					<p className='text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2'>Who's Booked This Room</p>
					{bookedPeople.length === 0 ? (
						<p className='text-xs text-slate-400'>No bookings in this visible range.</p>
					) : (
						<div className='flex items-center -space-x-2 overflow-x-auto pb-1'>
							{bookedPeople.slice(0, 12).map(person => (
								<img
									key={person.id}
									src={person.avatarUrl}
									alt={person.name}
									title={person.name}
									className='w-7 h-7 rounded-full object-cover border-2 border-white dark:border-[#0f151a] shrink-0'
								/>
							))}
							{bookedPeople.length > 12 && (
								<span className='ml-2 text-[11px] font-bold text-slate-500'>+{bookedPeople.length - 12}</span>
							)}
						</div>
					)}
				</div>

				<div className='room-availability-calendar p-2 sm:p-3'>
					<FullCalendar
						plugins={[timeGridPlugin, interactionPlugin]}
						initialView='timeGridDay'
						headerToolbar={{
							left: 'prev,next today',
							center: 'title',
							right: 'timeGridDay,timeGridWeek',
						}}
						allDaySlot={false}
						nowIndicator
						height='70vh'
						events={events}
						selectable={Boolean(roomId)}
						selectMirror
						selectOverlap={false}
						slotDuration='00:30:00'
						slotLabelInterval='01:00:00'
						datesSet={arg => {
							setVisibleRange({ start: arg.start, end: arg.end });
						}}
						select={selection => {
							onSelectSlot?.({ start: selection.start, end: selection.end, room });
						}}
						eventContent={arg => {
							const avatars = Array.isArray(arg.event.extendedProps?.avatars) ? arg.event.extendedProps.avatars : [];
							const participantNames = Array.isArray(arg.event.extendedProps?.participantNames)
								? arg.event.extendedProps.participantNames
								: [];
							const namesLabel =
								participantNames.length <= 2
									? participantNames.join(', ')
									: `${participantNames.slice(0, 2).join(', ')} +${participantNames.length - 2}`;
							return (
								<div className='fc-room-event-content'>
									<div className='fc-room-event-title'>{arg.event.title}</div>
									{avatars.length > 0 && (
										<div className='fc-room-event-avatars'>
											{avatars.slice(0, 3).map(person => (
												<img
													key={person.id}
													src={person.avatarUrl}
													alt={person.name}
													title={person.name}
													className='fc-room-event-avatar'
												/>
											))}
											{avatars.length > 3 && <span className='fc-room-event-more'>+{avatars.length - 3}</span>}
										</div>
									)}
									{namesLabel ? <div className='fc-room-event-names'>{namesLabel}</div> : null}
								</div>
							);
						}}
						editable={false}
					/>
				</div>
			</div>
		</div>,
		document.body,
	);
}
