export default function AdminSection({ adminRooms, onAddRoom }) {
	return (
		<div className='flex flex-col gap-10'>
			<div className='glass p-8 rounded-[2rem]'>
				<h3 className='text-xl font-bold mb-6 text-slate-900 dark:text-white'>Register Workspace</h3>
				<form onSubmit={onAddRoom} className='space-y-4'>
					<input
						type='text'
						name='name'
						required
						className='w-full bg-white dark:bg-gray-900 border border-black/10 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white'
						placeholder='Room Name'
					/>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<input
							type='number'
							name='capacity'
							required
							className='w-full bg-white dark:bg-gray-900 border border-black/10 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white'
							placeholder='Seats'
						/>
						<select
							name='wing'
							className='w-full bg-white dark:bg-gray-900 border border-black/10 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white appearance-none'
						>
							<option>Wing A</option>
							<option>Wing B</option>
							<option>Wing C</option>
							<option>Wing D</option>
						</select>
					</div>
					<div className='pt-2'>
						<label className='block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3'>
							Workspace Capabilities
						</label>
						<div className='flex flex-wrap gap-2 text-xs' id='admin-amenities'>
							{['Whiteboard', 'Smart Board', 'Quiet Zone', 'Telepresence', 'Dual Screens'].map(amenity => (
								<label
									key={amenity}
									className='flex items-center space-x-2 bg-white dark:bg-gray-900 border border-black/5 dark:border-white/5 px-3 py-2 rounded-xl cursor-pointer hover:bg-black/5 transition-colors text-slate-700 dark:text-gray-300'
								>
									<input type='checkbox' value={amenity} className='w-4 h-4 text-siemens-petrol rounded' />
									<span>{amenity}</span>
								</label>
							))}
						</div>
					</div>
					<button
						type='submit'
						className='w-full mt-6 py-4 bg-siemens-petrol text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-siemens-petrol/20 active:scale-95 transition-all'
					>
						Add to Registry
					</button>
				</form>
			</div>
			<div className='glass p-8 rounded-[2rem] flex-1 flex flex-col min-h-[400px]'>
				<h3 className='text-xl font-bold mb-6 text-slate-400'>Database</h3>
				<div className='flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar'>
					{adminRooms.map(room => (
						<div
							key={room.id}
							className='p-4 glass-panel rounded-2xl flex justify-between items-center border-none shadow-sm mb-3'
						>
							<div>
								<p className='text-sm font-bold text-slate-900 dark:text-white'>
									{room.name}
									<span className='text-[10px] text-gray-400 ml-2 uppercase tracking-widest'>{room.wing}</span>
								</p>
								<div className='mt-1'>
									{room.amenities.map(tag => (
										<span
											key={tag}
											className='text-[9px] bg-black/5 dark:bg-white/5 text-slate-500 dark:text-gray-400 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/5 mr-1 uppercase tracking-widest'
										>
											{tag}
										</span>
									))}
								</div>
							</div>
							<button className='text-rose-500 hover:text-rose-600 transition-colors'>
								<span className='sr-only'>Delete {room.name}</span>✕
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
