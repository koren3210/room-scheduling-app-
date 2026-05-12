import { Sparkles, Users } from 'lucide-react';

export default function RecommendationSection({ recommendations, onQuickBook, onSelectRoom, onSeeAll }) {
	return (
		<section className='flex flex-col min-h-0'>
			<div className='flex items-center justify-between gap-2 mb-4 shrink-0'>
				<div className='flex items-center gap-2'>
					<Sparkles className='w-4 h-4 text-amber-500' />
					<h2 className='text-base font-bold text-slate-900 dark:text-white'>Recommendations</h2>
				</div>
				<button
					type='button'
					onClick={onSeeAll}
					className='px-3 py-1.5 rounded-lg border border-siemens-petrol/30 text-siemens-petrol text-[10px] font-black uppercase tracking-widest hover:bg-siemens-petrol/10 transition-colors'
				>
					See All
				</button>
			</div>

			<div className='flex gap-4 overflow-x-auto pb-2 snap-x flex-1 min-h-0'>
				{recommendations.map(r => (
					<div
						key={r.id || r._id}
						className='flex-shrink-0 w-[280px] lg:w-[320px] snap-center bg-white/80 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform shadow-sm'
					>
						<div className='relative h-28 overflow-hidden'>
							<img
								src={
									r.image || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80'
								}
								alt={r.name}
								className='w-full h-full object-cover'
							/>
							<div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
							<div className='absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 dark:bg-black/80 backdrop-blur px-2 py-1 rounded-full'>
								<Sparkles className='w-2.5 h-2.5 text-siemens-petrol' />
								<span className='text-[10px] font-black text-slate-900 dark:text-white'>{r.score}%</span>
							</div>
						</div>
						<div className='p-4'>
							<div className='flex items-center justify-between mb-1'>
								<h4 className='font-bold text-[15px] text-slate-900 dark:text-white'>{r.name}</h4>
								<span className='flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-white/[0.07] px-2 py-0.5 rounded-lg'>
									<Users className='w-3 h-3' />
									{r.capacity}
								</span>
							</div>
							<p className='text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3'>{r.wing}</p>
							<div className='flex flex-wrap gap-1 mb-3'>
								{r.amenities.map(a => (
									<span
										key={a}
										className='text-[9px] font-bold bg-black/[0.04] dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04] uppercase tracking-wider'
									>
										{a}
									</span>
								))}
							</div>
							<button
								onClick={() => onQuickBook?.(r)}
								className='w-full py-2 bg-siemens-petrol text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-siemens-glow active:scale-95 transition-all shadow-sm shadow-siemens-petrol/20'
							>
								Quick Book
							</button>
							<button
								onClick={() => onSelectRoom?.(r)}
								className='w-full mt-2 py-2 border border-siemens-petrol/30 text-siemens-petrol rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-siemens-petrol/10 transition-all'
							>
								Use In Form
							</button>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
