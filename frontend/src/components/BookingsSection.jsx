import { Sparkles, Users, MapPin } from 'lucide-react';

function formatBooking(booking) {
	if (booking.time) return booking;

	const start = new Date(booking.startAt);
	const time = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	const [clock, period] = time.split(' ');
	const room = typeof booking.room === 'object' ? booking.room : null;
	const owner = typeof booking.user === 'object' ? booking.user : null;
	const attendeeUsers = Array.isArray(booking.attendeeUsers) ? booking.attendeeUsers : [];

	return {
		id: booking._id || booking.id,
		time: clock,
		period: period || '',
		title: booking.purpose || room?.name || 'Meeting',
		wing: room?.wing || booking.wing,
		attendees: booking.attendees || Math.max(attendeeUsers.length, 1),
		date: start.toLocaleDateString(),
		avatars: attendeeUsers.length > 0 ? attendeeUsers : owner ? [owner] : [],
	};
}

export default function BookingsSection({ bookings }) {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
			{bookings.map(item => {
				const booking = formatBooking(item);
				return (
					<div
						key={booking.id}
						className='bg-white/80 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] p-5 rounded-2xl flex items-center gap-5 shadow-sm hover:scale-[1.005] transition-transform'
					>
						{/* Time badge */}
						<div className='flex flex-col items-center justify-center bg-siemens-petrol text-white rounded-2xl w-14 h-14 shrink-0 shadow-md shadow-siemens-petrol/20'>
							<span className='text-xl font-black leading-none'>{booking.time}</span>
							<span className='text-[9px] font-bold uppercase'>{booking.period}</span>
						</div>

						{/* Info */}
						<div className='flex-1 min-w-0'>
							<p className='font-bold text-[15px] text-slate-900 dark:text-white truncate'>{booking.title}</p>
							<div className='flex items-center gap-3 mt-1'>
								<span className='flex items-center gap-1 text-[10px] text-slate-400 font-medium'>
									<MapPin className='w-3 h-3' />
									{booking.wing}
								</span>
								<span className='flex items-center gap-1 text-[10px] text-slate-400 font-medium'>
									<Users className='w-3 h-3' />
									{booking.attendees}
								</span>
							</div>
							{booking.avatars?.length > 0 && (
								<div className='mt-2 flex -space-x-2'>
									{booking.avatars.slice(0, 4).map((attendee, index) => (
										<img
											key={`${booking.id}-avatar-${index}`}
											src={
												attendee.avatarUrl ||
												`https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name || 'User')}&background=009999&color=fff`
											}
											alt={attendee.name || 'attendee'}
											title={attendee.name || attendee.email || 'attendee'}
											className='w-6 h-6 rounded-full border-2 border-white dark:border-slate-900'
										/>
									))}
								</div>
							)}
							<span className='mt-1.5 inline-block text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600'>
								{booking.date}
							</span>
						</div>

						{/* Action */}
						<button className='shrink-0 p-2.5 rounded-xl bg-siemens-petrol/[0.08] text-siemens-petrol hover:bg-siemens-petrol hover:text-white transition-all'>
							<Sparkles className='w-4 h-4' />
						</button>
					</div>
				);
			})}
		</div>
	);
}
