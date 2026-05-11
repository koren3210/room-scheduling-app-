export default function RecommendationSection({ recommendations }) {
	return (
		<section className='lg:col-span-5 xl:col-span-4 flex flex-col h-full'>
			<div className='flex items-center justify-between mb-4 lg:mb-5 mt-6 lg:mt-0'>
				<h2 className='text-lg font-bold flex items-center text-slate-900 dark:text-white'>
					<span className='inline-flex items-center mr-2 text-amber-500'>
						<svg viewBox='0 0 24 24' className='w-4 h-4' fill='currentColor'>
							<path d='M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.3L12 14.77l-4.78 2.51.91-5.3L4.26 7.62l5.34-.78L12 2z'></path>
						</svg>
					</span>
					Recommendations
				</h2>
			</div>
			<div className='flex lg:flex-col space-x-4 lg:space-x-0 lg:space-y-4 overflow-x-auto lg:overflow-y-auto pb-4 custom-scrollbar lg:pr-2 snap-x snap-mandatory'>
				{recommendations.map(item => (
					<article
						key={item.id}
						className='glass-panel p-2 rounded-3xl min-w-[280px] lg:w-full snap-center border-none shadow-sm shrink-0 transition-transform hover:scale-[1.01]'
					>
						<div className='relative h-32 lg:h-36 w-full overflow-hidden rounded-[1.5rem] mb-4 shrink-0'>
							<img src={item.image} alt={item.name} className='w-full h-full object-cover' />
							<div className='absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center shadow-lg'>
								<span className='text-[10px] font-black text-slate-900 dark:text-white'>{item.score}% Match</span>
							</div>
						</div>
						<div className='px-3 pb-3 flex-1 flex flex-col'>
							<div className='flex justify-between items-start mb-2'>
								<h3 className='font-bold text-base text-slate-900 dark:text-white'>{item.name}</h3>
								<span className='text-[10px] font-black bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 px-2 py-1 rounded-lg shrink-0'>
									{item.capacity}
								</span>
							</div>
							<p className='text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3'>{item.wing}</p>
							<div className='flex flex-wrap gap-1.5 mb-4 mt-auto'>
								{item.amenities.map(amenity => (
									<span
										key={amenity}
										className='text-[9px] font-bold bg-black/5 dark:bg-white/5 text-slate-600 dark:text-gray-400 px-2 py-1 rounded border border-black/5 dark:border-white/5 uppercase tracking-wider'
									>
										{amenity}
									</span>
								))}
							</div>
							<button className='w-full py-3 bg-siemens-petrol text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-siemens-glow transition-all active:scale-95'>
								Quick Book
							</button>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
