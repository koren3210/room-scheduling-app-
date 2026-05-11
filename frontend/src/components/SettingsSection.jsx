export default function SettingsSection() {
	return (
		<div className='glass p-10 rounded-[2.5rem] space-y-10'>
			<h3 className='text-2xl font-black text-slate-900 dark:text-white'>Integrations</h3>
			<div className='p-6 glass-panel rounded-3xl flex justify-between items-center border-none'>
				<div className='flex items-center'>
					<span className='inline-flex items-center justify-center w-8 h-8 rounded-2xl bg-blue-500 text-white mr-4'>@</span>
					<span className='font-bold text-slate-900 dark:text-white text-sm'>Outlook</span>
				</div>
				<span className='text-[10px] font-black text-siemens-petrol bg-siemens-petrol/10 px-2 py-1 rounded'>CONNECTED</span>
			</div>
			<div className='p-6 glass-panel rounded-3xl flex justify-between items-center border-dashed border-2 border-black/10 dark:border-white/10'>
				<div className='flex items-center'>
					<span className='inline-flex items-center justify-center w-8 h-8 rounded-2xl bg-indigo-500 text-white mr-4'>
						T
					</span>
					<span className='font-bold text-slate-900 dark:text-white text-sm'>Microsoft Teams</span>
				</div>
				<button className='text-xs font-black text-siemens-petrol uppercase tracking-tighter hover:underline'>
					Link Account
				</button>
			</div>
		</div>
	);
}
