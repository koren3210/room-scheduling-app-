export default function BookingsSection({ bookings }) {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
			{bookings.map(booking => (
				<div
					key={booking.id}
					className='glass-panel p-6 rounded-3xl flex items-center justify-between border-none shadow-sm'
				>
					<div className='flex items-center space-x-6'>
						<div className='bg-siemens-petrol text-white p-4 rounded-2xl w-16 text-center font-black shadow-lg'>
							{booking.time}
						</div>
						<div>
							<p className='font-bold text-lg text-slate-900 dark:text-white'>{booking.title}</p>
							<p className='text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1'>{booking.wing}</p>
						</div>
					</div>
					<button className='p-3 bg-brand-500/10 text-brand-500 rounded-xl hover:bg-brand-500 hover:text-white transition-all'>
						Continue
					</button>
				</div>
			))}
		</div>
	);
}
