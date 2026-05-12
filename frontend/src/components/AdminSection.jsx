import { Trash2 } from 'lucide-react';

const AMENITIES = ['Whiteboard', 'Smart Board', 'Quiet Zone', 'Telepresence', 'Dual Screens'];

export default function AdminSection({ adminRooms, onAddRoom }) {
	return (
		<div className='flex flex-col gap-6'>
			{/* Registration form */}
			<div className='bg-white/80 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] p-8 rounded-2xl shadow-sm'>
				<h3 className='text-base font-bold mb-6 text-slate-900 dark:text-white'>Register Workspace</h3>
				<form onSubmit={onAddRoom} className='space-y-4'>
					<input
						type='text'
						name='name'
						required
						className='w-full bg-slate-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-siemens-petrol focus:ring-1 focus:ring-siemens-petrol transition-all'
						placeholder='Room Name'
					/>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<input
							type='number'
							name='capacity'
							required
							className='w-full bg-slate-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-siemens-petrol focus:ring-1 focus:ring-siemens-petrol transition-all'
							placeholder='Seats'
						/>
						<select
							name='wing'
							className='w-full bg-slate-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-siemens-petrol transition-all appearance-none'
						>
							<option>Wing A</option>
							<option>Wing B</option>
							<option>Wing C</option>
							<option>Wing D</option>
						</select>
					</div>

					<div>
						<label className='block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2'>
							Room image (optional)
						</label>
						<input
							type='file'
							name='image'
							accept='image/*'
							className='w-full bg-slate-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.06] rounded-xl px-4 py-3 text-xs text-slate-600 dark:text-slate-300'
						/>
					</div>

					<div className='pt-1'>
						<label className='block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3'>
							Workspace Capabilities
						</label>
						<div className='flex flex-wrap gap-2'>
							{AMENITIES.map(amenity => (
								<label
									key={amenity}
									className='flex items-center gap-2 bg-slate-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] px-3 py-2 rounded-xl cursor-pointer hover:border-siemens-petrol/40 hover:text-siemens-petrol transition-colors text-xs font-medium text-slate-600 dark:text-slate-300'
								>
									<input type='checkbox' value={amenity} className='w-3.5 h-3.5 accent-siemens-petrol rounded' />
									<span>{amenity}</span>
								</label>
							))}
						</div>
					</div>

					<button
						type='submit'
						className='w-full mt-2 py-3 bg-siemens-petrol text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-md shadow-siemens-petrol/20 hover:bg-siemens-glow active:scale-[0.98] transition-all'
					>
						Add to Registry
					</button>
				</form>
			</div>

			{/* Database list */}
			<div className='bg-white/80 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] p-8 rounded-2xl shadow-sm flex flex-col min-h-[300px]'>
				<h3 className='text-base font-bold mb-5 text-slate-400 dark:text-slate-500'>Database</h3>
				<div className='flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar'>
					{adminRooms.map(room => (
						<div
							key={room.id}
							className='p-4 bg-slate-50 dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.04] rounded-xl flex justify-between items-center'
						>
							<div>
								<p className='text-sm font-bold text-slate-900 dark:text-white'>
									{room.name}
									<span className='text-[9px] text-slate-400 ml-2 uppercase tracking-widest font-black'>{room.wing}</span>
								</p>
								<div className='mt-1.5 flex flex-wrap gap-1'>
									{room.amenities.map(tag => (
										<span
											key={tag}
											className='text-[9px] bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04] uppercase tracking-wider font-bold'
										>
											{tag}
										</span>
									))}
								</div>
							</div>
							<button className='text-rose-400 hover:text-rose-600 hover:scale-110 transition-all p-1 ml-4 shrink-0'>
								<Trash2 className='w-4 h-4' />
								<span className='sr-only'>Delete {room.name}</span>
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
