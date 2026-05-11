import { Moon } from 'lucide-react';

export default function DashboardHeader({ title, subtitle, onToggleTheme }) {
	return (
		<header
			id='main-header'
			className='flex justify-between items-center p-4 lg:p-8 max-w-[1600px] mx-auto w-full transition-all'
		>
			<div>
				<h1 className='text-2xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-1'>{title}</h1>
				<p className='text-slate-500 text-xs lg:text-base font-medium'>{subtitle}</p>
			</div>
			<div className='flex items-center space-x-3'>
				<button
					type='button'
					onClick={onToggleTheme}
					className='p-3 rounded-full glass-panel border-none shadow-sm text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform'
				>
					<Moon className='w-5 h-5' />
				</button>
				<div className='hidden sm:flex items-center px-5 py-3 rounded-full glass-panel border-none shadow-md'>
					<span className='relative flex h-2.5 w-2.5 mr-2.5'>
						<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-siemens-petrol opacity-75'></span>
						<span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-siemens-petrol'></span>
					</span>
					<span className='text-brand-500 font-black text-[10px] uppercase tracking-widest'>AI Engine Online</span>
				</div>
			</div>
		</header>
	);
}
