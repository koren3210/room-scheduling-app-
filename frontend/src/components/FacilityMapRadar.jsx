const mapByWing = {
	'Wing B': 'https://app.mappedin.com/map/6a0423d0b2b6a0000b7171c0?embedded=true',
	'Wing C': 'https://app.mappedin.com/map/6a042233b2b6a0000b7171bf?embedded=true',
	'Wing D': 'https://app.mappedin.com/map/6a041920520aaf000b2a31e4?embedded=true',
};
export default function FacilityMapRadar({ rooms = [], activeWing = 'Wing D', onWingChange }) {
	const activeMap = mapByWing[activeWing];
	const availableNow = rooms.filter(room => room.status === 'available').length;
	const occupiedNow = rooms.length - availableNow;

	return (
		<div className='mb-8 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] shadow-sm p-4 lg:p-6'>
			<div className='flex items-center justify-between gap-3 mb-4 flex-wrap'>
				<div>
					<h3 className='text-base font-bold text-slate-900 dark:text-white'>Wing Map Radar</h3>
					<p className='text-xs text-slate-500'>
						Live now: {availableNow} available, {occupiedNow} occupied.
					</p>
				</div>
				<div className='flex items-center gap-2'>
					{['Wing D', 'Wing C', 'Wing B'].map(wing => (
						<button
							key={wing}
							type='button'
							onClick={() => onWingChange?.(wing)}
							className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border transition-colors ${
								activeWing === wing
									? 'bg-siemens-petrol text-white border-siemens-petrol'
									: 'bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-slate-500 hover:text-siemens-petrol'
							}`}
						>
							{wing}
						</button>
					))}
				</div>
			</div>

			<div className='rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden min-h-[560px]'>
				{activeMap ? (
					<div className='facility-map-shell'>
						<iframe
							className='mappedin-embed-frame'
							href='https://www.mappedin.com/'
							title='Mappedin Map'
							name='Mappedin Map'
							allow="clipboard-write 'self' https://app.mappedin.com; web-share 'self' https://app.mappedin.com"
							scrolling='no'
							width='100%'
							height='650'
							frameBorder='0'
							style={{ border: 0, background: 'transparent' }}
							src={activeMap}
						/>
					</div>
				) : (
					<div className='p-4 text-sm text-slate-500'>No map file found for {activeWing}.</div>
				)}
			</div>
		</div>
	);
}
