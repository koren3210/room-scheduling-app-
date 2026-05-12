import { Moon, Sun } from 'lucide-react';

export default function DashboardHeader({ title, subtitle, onToggleTheme, themeDark }) {
	return (
		<header className='flex justify-between items-center px-6 lg:px-10 py-5 lg:py-7 w-full'>
			<div>
				<h1 className='text-xl lg:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight'>{title}</h1>
				<p className='text-slate-400 dark:text-slate-500 text-xs lg:text-sm font-medium mt-0.5'>{subtitle}</p>
			</div>
			<div className='flex items-center gap-3'>
				<button
					type='button'
					onClick={onToggleTheme}
					className='w-9 h-9 rounded-xl bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
				>
					{themeDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
				</button>
				<div className='hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] shadow-sm'>
					<span className='relative flex h-2 w-2'>
						<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-siemens-petrol opacity-75' />
						<span className='relative inline-flex rounded-full h-2 w-2 bg-siemens-petrol' />
					</span>
					<span className='text-siemens-petrol font-black text-[9px] uppercase tracking-widest'>AI Online</span>
				</div>
			</div>
		</header>
	);
}
