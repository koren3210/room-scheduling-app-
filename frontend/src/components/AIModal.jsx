export default function AIModal({ open, title, content, onClose }) {
	if (!open) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm'>
			<div className='glass w-full max-w-lg rounded-[2rem] p-6 lg:p-8 flex flex-col shadow-2xl border-none scale-100 opacity-100 transition-all'>
				<div className='flex items-center justify-between mb-6'>
					<h3 className='text-lg font-black tracking-tight text-slate-900 dark:text-white'>{title}</h3>
					<button
						type='button'
						onClick={onClose}
						className='p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white'
					>
						Close
					</button>
				</div>
				<div
					className='text-sm leading-relaxed mb-6 overflow-y-auto max-h-[40vh] text-slate-700 dark:text-gray-300'
					dangerouslySetInnerHTML={{ __html: content }}
				/>
				<button
					type='button'
					onClick={onClose}
					className='w-full py-3 bg-siemens-petrol text-white font-bold text-sm rounded-xl active:scale-95 transition-all'
				>
					Close
				</button>
			</div>
		</div>
	);
}
