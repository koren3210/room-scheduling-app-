import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Cpu, Sparkles, Calendar, Radar, ShieldCheck, Settings, ChevronLeft, LogOut } from 'lucide-react';

const navItems = [
	{ id: 'booking', label: 'Booking', icon: Sparkles, path: '/dashboard/booking' },
	{ id: 'my-bookings', label: 'Schedule', icon: Calendar, path: '/dashboard/my-bookings' },
	{ id: 'facility', label: 'Facility', icon: Radar, path: '/dashboard/facility' },
	{ id: 'admin', label: 'Admin', icon: ShieldCheck, path: '/dashboard/admin' },
];

const mobileNavItems = [...navItems, { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' }];

export default function DashboardSidebar({ collapsed, onToggleCollapse, profile, onLogout }) {
	const [accountOpen, setAccountOpen] = useState(false);
	const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
	const accountRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = event => {
			if (accountRef.current && !accountRef.current.contains(event.target)) {
				setAccountOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleMobileLogout = () => {
		setMobileAccountOpen(false);
		onLogout?.();
	};

	const handleLogout = () => {
		setAccountOpen(false);
		onLogout?.();
	};

	return (
		<>
			{/* ── DESKTOP SIDEBAR ── */}
			<aside
				className={`
					hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0
					bg-white/80 dark:bg-[#0d1117]/90 backdrop-blur-2xl
					border-r border-black/[0.06] dark:border-white/[0.06]
					transition-all duration-300 ease-in-out z-40
					${collapsed ? 'w-[72px]' : 'w-[280px]'}
				`}
			>
				{/* Logo */}
				<div
					onClick={onToggleCollapse}
					className='h-[72px] flex items-center justify-between px-4 border-b border-black/[0.06] dark:border-white/[0.06] cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors duration-200 shrink-0'
				>
					<div className='flex items-center gap-3 min-w-0'>
						<div className='w-9 h-9 rounded-xl bg-gradient-to-br from-siemens-petrol to-siemens-dark flex items-center justify-center shadow-md shadow-siemens-petrol/20 shrink-0'>
							<Cpu className='text-white w-4 h-4' />
						</div>
						{!collapsed && (
							<span className='font-bold text-[15px] text-slate-900 dark:text-white whitespace-nowrap truncate'>
								Siemens<span className='text-siemens-petrol'>Booking</span>
							</span>
						)}
					</div>
					{!collapsed && <ChevronLeft className='w-4 h-4 text-slate-400 shrink-0' />}
				</div>

				{/* Nav */}
				<nav className='flex-1 px-3 py-4 space-y-0.5 overflow-y-auto'>
					{!collapsed && (
						<p className='text-[9px] font-black uppercase tracking-widest text-slate-400/70 dark:text-slate-600 px-2 mb-3'>
							Navigation
						</p>
					)}
					{navItems.map(item => (
						<NavLink
							key={item.id}
							to={item.path}
							title={collapsed ? item.label : undefined}
							className={({ isActive }) =>
								`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
									isActive
										? 'bg-siemens-petrol/10 dark:bg-siemens-petrol/15 text-siemens-petrol'
										: 'text-slate-500 dark:text-slate-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
								} ${collapsed ? 'justify-center' : ''}`
							}
						>
							{({ isActive }) => (
								<>
									{isActive && (
										<span className='absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-siemens-petrol rounded-r-full' />
									)}
									<item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-siemens-petrol' : ''}`} />
									{!collapsed && <span className='text-sm font-semibold'>{item.label}</span>}
								</>
							)}
						</NavLink>
					))}
				</nav>

				{/* Footer */}
				<div className='p-3 border-t border-black/[0.06] dark:border-white/[0.06] space-y-1 shrink-0'>
					<NavLink
						to='/dashboard/settings'
						title={collapsed ? 'Settings' : undefined}
						className={({ isActive }) =>
							`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
								isActive
									? 'bg-siemens-petrol/10 text-siemens-petrol'
									: 'text-slate-500 dark:text-slate-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
							} ${collapsed ? 'justify-center' : ''}`
						}
					>
						<Settings className='w-4 h-4 shrink-0' />
						{!collapsed && <span className='text-sm font-semibold'>Settings</span>}
					</NavLink>

					<div className='relative' ref={accountRef}>
						{!collapsed && (
							<button
								type='button'
								onClick={() => setAccountOpen(prev => !prev)}
								className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors'
							>
								<img
									src={profile.avatarUrl}
									alt={profile.name}
									className='w-8 h-8 rounded-full border-2 border-siemens-petrol/20 shrink-0'
								/>
								<div className='min-w-0 text-left'>
									<p className='text-[13px] font-bold text-slate-900 dark:text-white truncate leading-tight'>
										{profile.name}
									</p>
									<p className='text-[9px] text-slate-400 font-bold tracking-widest uppercase'>{profile.team}</p>
								</div>
							</button>
						)}

						{collapsed && (
							<button
								type='button'
								onClick={() => setAccountOpen(prev => !prev)}
								className='w-full flex justify-center px-3 py-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors'
							>
								<img
									src={profile.avatarUrl}
									alt={profile.name}
									className='w-8 h-8 rounded-full border-2 border-siemens-petrol/20'
								/>
							</button>
						)}

						{accountOpen && (
							<div
								className={`absolute ${collapsed ? 'left-full ml-2 bottom-0' : 'left-0 right-0 bottom-full mb-2'} bg-white dark:bg-[#0f151a] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-1.5 shadow-xl z-50`}
							>
								<button
									type='button'
									onClick={handleLogout}
									className='w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-colors'
								>
									<LogOut className='w-3.5 h-3.5' />
									Logout
								</button>
							</div>
						)}
					</div>
				</div>
			</aside>

			{/* ── MOBILE BOTTOM BAR ── */}
			<nav className='lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0d1117]/95 backdrop-blur-xl border-t border-black/[0.06] dark:border-white/[0.06] flex justify-around items-center px-2 py-2 safe-area-bottom'>
				{mobileNavItems.map(item => (
					<NavLink
						key={item.id}
						to={item.path}
						className={({ isActive }) =>
							`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
								isActive ? 'text-siemens-petrol' : 'text-slate-400 dark:text-slate-500'
							}`
						}
					>
						{({ isActive }) => (
							<>
								<div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-siemens-petrol/10' : ''}`}>
									<item.icon className='w-5 h-5' />
								</div>
								<span className='text-[9px] font-bold tracking-wide'>{item.label}</span>
							</>
						)}
					</NavLink>
				))}

				{/* User avatar + logout */}
				<div className='relative'>
					<button
						type='button'
						onClick={() => setMobileAccountOpen(prev => !prev)}
						className='flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 text-slate-400 dark:text-slate-500'
					>
						<img
							src={profile?.avatarUrl}
							alt={profile?.name}
							className='w-7 h-7 rounded-full border-2 border-siemens-petrol/30'
						/>
						<span className='text-[9px] font-bold tracking-wide'>Me</span>
					</button>

					{mobileAccountOpen && (
						<>
							<div className='fixed inset-0 z-40' onClick={() => setMobileAccountOpen(false)} />
							<div className='absolute bottom-full right-0 mb-2 z-50 bg-white dark:bg-[#0f151a] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl shadow-xl p-3 min-w-[180px]'>
								<div className='flex items-center gap-2 pb-2 mb-2 border-b border-black/[0.06] dark:border-white/[0.06]'>
									<img
										src={profile?.avatarUrl}
										alt={profile?.name}
										className='w-8 h-8 rounded-full border-2 border-siemens-petrol/20 shrink-0'
									/>
									<div className='min-w-0'>
										<p className='text-[13px] font-bold text-slate-900 dark:text-white truncate leading-tight'>
											{profile?.name}
										</p>
										<p className='text-[9px] text-slate-400 font-bold tracking-widest uppercase'>
											{profile?.team || 'Member'}
										</p>
									</div>
								</div>
								<button
									type='button'
									onClick={handleMobileLogout}
									className='w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-colors'
								>
									<LogOut className='w-3.5 h-3.5' />
									Logout
								</button>
							</div>
						</>
					)}
				</div>
			</nav>
		</>
	);
}
