export default function FacilitySection({ rooms }) {
	return (
		<div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
			<div className='glass-panel p-6 rounded-3xl text-center'>
				<p className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>Occupancy</p>
				<p className='text-3xl font-black text-slate-900 dark:text-white'>72%</p>
			</div>
			<div className='glass-panel p-6 rounded-3xl text-center'>
				<p className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>Available</p>
				<p className='text-3xl font-black text-slate-900 dark:text-white'>
					{rooms.filter(room => room.status === 'available').length}
				</p>
			</div>
			<div className='glass-panel p-6 rounded-3xl text-center'>
				<p className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>Active Wings</p>
				<p className='text-3xl font-black text-slate-900 dark:text-white'>A, B, C</p>
			</div>
			<div className='glass-panel p-6 rounded-3xl text-center bg-siemens-petrol/10 border-siemens-petrol/20'>
				<p className='text-[10px] font-black text-siemens-petrol uppercase tracking-widest'>Energy Save</p>
				<p className='text-3xl font-black text-siemens-petrol'>12kW</p>
			</div>
		</div>
	);
}
