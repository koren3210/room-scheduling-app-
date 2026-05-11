import { Cpu, Sparkles, Calendar, Radar, ShieldCheck, Settings } from 'lucide-react';

const navItems = [
	{ id: 'booking', label: 'Booking', icon: Sparkles },
	{ id: 'my-bookings', label: 'Schedule', icon: Calendar },
	{ id: 'facility', label: 'Facility', icon: Radar },
	{ id: 'admin', label: 'Admin', icon: ShieldCheck },
	{ id: 'settings', label: 'Settings', icon: Settings, mobileOnly: true },
];

export default function DashboardSidebar({ active, onChange, collapsed, onToggleCollapse, profile }) {
	return (
		<aside
			id='main-sidebar'
			className={`fixed bottom-0 left-0 w-full lg:static lg:w-64 lg:h-screen glass border-t lg:border-t-0 lg:border-r border-black/5 dark:border-white/5 flex flex-row lg:flex-col justify-around lg:justify-between items-center lg:items-stretch z-50 shadow-2xl lg:shadow-none shrink-0 pb-6 lg:pb-0 transition-all ${
				collapsed ? 'lg:w-20' : ''
			}`}
		>
			<div className='hidden lg:block'>
				<div
					id='sidebar-logo-container'
					onClick={onToggleCollapse}
					className='h-24 flex items-center px-6 border-b border-black/5 dark:border-white/5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-300'
				>
					<div className='w-10 h-10 rounded-xl bg-siemens-petrol flex items-center justify-center shadow-lg'>
						<Cpu className='text-white w-5 h-5' />
					</div>
					<span
						className={`sidebar-text ml-4 font-bold text-xl text-slate-900 dark:text-white whitespace-nowrap transition-all duration-300 ${
							collapsed ? 'hidden' : 'block'
						}`}
					>
						Siemens<span className='text-siemens-glow'>Booking</span>
					</span>
				</div>
			</div>

			<nav className='flex flex-row lg:flex-col w-full lg:w-auto justify-around lg:justify-start px-2 lg:px-4 lg:mt-6 space-x-1 lg:space-x-0 lg:space-y-1'>
				{navItems.map(item => {
					if (item.mobileOnly) {
						return (
							<button
								key={item.id}
								onClick={() => onChange(item.id)}
								className={`nav-item ${active === item.id ? 'is-active' : ''} flex flex-col lg:flex-row items-center lg:justify-start px-4 py-2 lg:py-3.5 rounded-2xl w-full`}
							>
								<item.icon className='w-5 h-5 lg:mr-3 shrink-0' />
								<span className='sidebar-text hidden sm:block text-[10px] lg:text-sm font-semibold whitespace-nowrap'>
									{item.label}
								</span>
							</button>
						);
					}

					return (
						<button
							key={item.id}
							onClick={() => onChange(item.id)}
							className={`nav-item ${active === item.id ? 'is-active' : ''} flex flex-col lg:flex-row items-center lg:justify-start px-4 py-2 lg:py-3.5 rounded-2xl w-full`}
						>
							<item.icon className='w-5 h-5 lg:mr-3 shrink-0' />
							<span className='sidebar-text hidden sm:block text-[10px] lg:text-sm font-semibold whitespace-nowrap'>
								{item.label}
							</span>
						</button>
					);
				})}
			</nav>

			<div className='hidden lg:block p-6 border-t border-black/5 dark:border-white/5'>
				<button
					onClick={() => onChange('settings')}
					className='nav-item flex items-center px-4 py-3.5 rounded-xl mb-4 w-full text-left'
				>
					<Settings className='w-5 h-5 lg:mr-3 shrink-0' />
					<span className='sidebar-text font-medium text-sm whitespace-nowrap'>Settings</span>
				</button>
				<div id='profile-container' className='flex items-center px-2 transition-all duration-300'>
					<img
						src={profile.avatarUrl}
						alt={profile.name}
						className='w-10 h-10 rounded-full border border-black/10 shadow-sm shrink-0'
					/>
					<div className='profile-details ml-3 transition-all duration-300 overflow-hidden'>
						<p className='text-sm font-bold truncate text-slate-900 dark:text-white'>{profile.name}</p>
						<p className='text-[10px] text-slate-500 font-bold tracking-widest uppercase'>{profile.team}</p>
					</div>
				</div>
			</div>
		</aside>
	);
}
