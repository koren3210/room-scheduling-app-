export default function SettingsSection() {
	return (
		<div className='bg-white/80 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] p-8 rounded-2xl shadow-sm space-y-6'>
			<h3 className='text-base font-bold text-slate-900 dark:text-white'>Integrations</h3>

			{/* Outlook — connected */}
			<div className='p-5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl flex justify-between items-center'>
				<div className='flex items-center gap-3'>
					<span className='inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500 text-white text-sm font-bold shadow-sm'>
						@
					</span>
					<span className='font-bold text-sm text-slate-900 dark:text-white'>Outlook</span>
				</div>
				<span className='text-[9px] font-black text-siemens-petrol bg-siemens-petrol/10 px-2.5 py-1 rounded-lg uppercase tracking-widest'>
					Connected
				</span>
			</div>

			{/* Teams — not connected */}
			<div className='p-5 border border-dashed border-black/10 dark:border-white/10 rounded-xl flex justify-between items-center'>
				<div className='flex items-center gap-3'>
					<span className='inline-flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500 text-white text-sm font-bold shadow-sm'>
						T
					</span>
					<span className='font-bold text-sm text-slate-900 dark:text-white'>Microsoft Teams</span>
				</div>
				<button className='text-xs font-black text-siemens-petrol uppercase tracking-tight hover:underline transition-colors'>
					Link Account
				</button>
			</div>
		</div>
	);
}
