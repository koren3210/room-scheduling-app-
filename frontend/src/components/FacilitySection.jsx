import { CheckCircle, Clock } from 'lucide-react';

export default function FacilitySection({ rooms }) {
	const availableCount = rooms.filter(r => r.status === 'available').length;

	return (
		<div>
			{/* Stats row */}
			<div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
				{[
					{ label: 'Occupancy', value: '72%', accent: false },
					{ label: 'Available', value: availableCount, accent: false },
					{ label: 'Active Wings', value: 'A, B, C', accent: false },
					{ label: 'Energy Save', value: '12kW', accent: true },
				].map(stat => (
					<div
						key={stat.label}
						className={`p-5 rounded-2xl border text-center ${
							stat.accent
								? 'bg-siemens-petrol/[0.08] border-siemens-petrol/20 dark:bg-siemens-petrol/[0.1]'
								: 'bg-white/80 dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06]'
						}`}
					>
						<p
							className={`text-[9px] font-black uppercase tracking-widest mb-2 ${stat.accent ? 'text-siemens-petrol' : 'text-slate-400'}`}
						>
							{stat.label}
						</p>
						<p className={`text-2xl font-black ${stat.accent ? 'text-siemens-petrol' : 'text-slate-900 dark:text-white'}`}>
							{stat.value}
						</p>
					</div>
				))}
			</div>

			{/* Room grid */}
			<h2 className='text-base font-bold text-slate-900 dark:text-white mb-4'>Live APC Space Radar</h2>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{rooms.map(room => (
					<div
						key={room.id}
						className='bg-white/80 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] p-5 rounded-2xl hover:scale-[1.01] transition-transform shadow-sm'
					>
						<div className='flex justify-between items-start mb-3'>
							<p className='font-bold text-[15px] text-slate-900 dark:text-white'>{room.name}</p>
							<span
								className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${room.status === 'available' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500'}`}
							>
								{room.status}
							</span>
						</div>
						<p className='text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-3'>
							{room.wing} · {room.capacity} Seats
						</p>
						{room.until ? (
							<div className='flex items-center gap-1.5 text-[11px] text-slate-400 font-medium'>
								<Clock className='w-3 h-3' />
								{room.status === 'available' ? `Next booking at ${room.until}` : `Occupied until ${room.until}`}
							</div>
						) : (
							<div className='flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400'>
								<CheckCircle className='w-3 h-3' />
								Ready for use
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
