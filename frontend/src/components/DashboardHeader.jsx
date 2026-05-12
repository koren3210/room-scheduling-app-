import { useState } from 'react';
import { Bell, Check, Moon, Sun, X } from 'lucide-react';

export default function DashboardHeader({
	title,
	subtitle,
	onToggleTheme,
	themeDark,
	notifications = [],
	onApproveInvite,
	onDeclineInvite,
	respondPending,
}) {
	const [modalOpen, setModalOpen] = useState(false);
	const notificationCount = notifications.length;

	const formatDateRange = booking => {
		const start = booking?.startAt ? new Date(booking.startAt) : null;
		const end = booking?.endAt ? new Date(booking.endAt) : null;
		if (!start || !end) return 'Date TBD';
		return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
	};

	return (
		<>
			<header className='flex justify-between items-center px-6 lg:px-10 py-5 lg:py-7 w-full'>
				<div>
					<h1 className='text-xl lg:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight'>{title}</h1>
					<p className='text-slate-400 dark:text-slate-500 text-xs lg:text-sm font-medium mt-0.5'>{subtitle}</p>
				</div>
				<div className='flex items-center gap-3'>
					<button
						type='button'
						onClick={() => setModalOpen(true)}
						className='relative w-9 h-9 rounded-xl bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
						title='Notifications'
					>
						<Bell className='w-4 h-4' />
						{notificationCount > 0 && (
							<span className='absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center'>
								{notificationCount > 99 ? '99+' : notificationCount}
							</span>
						)}
					</button>
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

			{modalOpen && (
				<div className='fixed inset-0 z-[100001] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4'>
					<div className='w-full max-w-2xl bg-white dark:bg-[#0f151a] rounded-2xl border border-black/10 dark:border-white/10 p-5'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-sm font-bold text-slate-900 dark:text-white'>Meeting Notifications</h3>
							<button
								type='button'
								onClick={() => setModalOpen(false)}
								className='text-slate-500 hover:text-slate-900 dark:hover:text-white'
							>
								Close
							</button>
						</div>

						{notificationCount === 0 ? (
							<div className='rounded-xl border border-black/10 dark:border-white/10 p-4 text-sm text-slate-500 dark:text-slate-400'>
								No pending meeting requests.
							</div>
						) : (
							<div className='space-y-3 max-h-[60vh] overflow-y-auto pr-1'>
								{notifications.map(booking => {
									const room = typeof booking.room === 'object' ? booking.room : null;
									const owner = typeof booking.user === 'object' ? booking.user : null;
									const approving =
										respondPending?.isPending &&
										respondPending?.id === (booking._id || booking.id) &&
										respondPending?.action === 'approve';
									const declining =
										respondPending?.isPending &&
										respondPending?.id === (booking._id || booking.id) &&
										respondPending?.action === 'decline';
									const disableActions = approving || declining;

									return (
										<div
											key={booking._id || booking.id}
											className='rounded-xl border border-black/10 dark:border-white/10 p-4'
										>
											<p className='text-sm font-bold text-slate-900 dark:text-white'>
												{booking.purpose || 'Meeting Request'}
											</p>
											<p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
												From: {owner?.name || owner?.email || 'Unknown'}
											</p>
											<p className='text-xs text-slate-500 dark:text-slate-400'>
												Room: {room?.name || 'TBD'} ({room?.wing || booking.wing || 'N/A'})
											</p>
											<p className='text-xs text-slate-500 dark:text-slate-400 mb-3'>{formatDateRange(booking)}</p>
											<div className='flex items-center gap-2'>
												<button
													type='button'
													disabled={disableActions}
													onClick={() => onApproveInvite?.(booking)}
													className='px-3 py-2 rounded-xl border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors inline-flex items-center gap-1'
												>
													<Check className='w-3.5 h-3.5' />
													{approving ? 'Approving' : 'Approve'}
												</button>
												<button
													type='button'
													disabled={disableActions}
													onClick={() => onDeclineInvite?.(booking)}
													className='px-3 py-2 rounded-xl border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 transition-colors inline-flex items-center gap-1'
												>
													<X className='w-3.5 h-3.5' />
													{declining ? 'Declining' : 'Decline'}
												</button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
