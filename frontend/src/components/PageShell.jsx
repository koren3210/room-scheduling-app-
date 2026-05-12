import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import DashboardHeader from './DashboardHeader.jsx';
import { fetchBookings, respondToBooking, subscribeToBookingNotifications } from '../api/bookings';
import { useAuth } from '../contexts/AuthContext';

export default function PageShell({ title, subtitle, children }) {
	const [themeDark, setThemeDark] = useState(() => document.documentElement.classList.contains('dark'));
	const { user, isAuthenticated } = useAuth();
	const queryClient = useQueryClient();

	const bookingsQuery = useQuery({
		queryKey: ['bookings', 'header'],
		queryFn: () => fetchBookings({ mine: true }),
		enabled: isAuthenticated,
	});

	const pendingInviteNotifications = (bookingsQuery.data || []).filter(booking => {
		if (booking.status !== 'pending') return false;
		const ownerId = typeof booking.user === 'object' ? booking.user?._id || booking.user?.id : booking.user;
		if (String(ownerId || '') === String(user?.id || '')) return false;
		const attendeeUsers = Array.isArray(booking.attendeeUsers) ? booking.attendeeUsers : [];
		return attendeeUsers
			.map(attendee => attendee?._id || attendee?.id || attendee)
			.filter(Boolean)
			.map(id => String(id))
			.includes(String(user?.id || ''));
	});

	const respondMutation = useMutation({
		mutationFn: ({ bookingId, action }) => respondToBooking(bookingId, action),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['bookings'] });
			toast.success(variables.action === 'approve' ? 'Meeting approved.' : 'Meeting declined.');
		},
		onError: error => {
			const backendMsg = error?.response?.data?.error;
			toast.error(backendMsg || error?.message || 'Could not respond to meeting request.');
		},
	});

	useEffect(() => {
		if (!isAuthenticated || !user?.id) return undefined;

		const token = localStorage.getItem('token');
		if (!token) return undefined;

		const source = subscribeToBookingNotifications(token, event => {
			if (!event?.eventType || event.eventType === 'connected') return;
			queryClient.invalidateQueries({ queryKey: ['bookings'] });
		});

		return () => {
			source.close();
		};
	}, [isAuthenticated, queryClient, user?.id]);

	const handleApproveInvite = booking => {
		respondMutation.mutate({ bookingId: booking._id || booking.id, action: 'approve' });
	};

	const handleDeclineInvite = booking => {
		respondMutation.mutate({ bookingId: booking._id || booking.id, action: 'decline' });
	};

	useEffect(() => {
		document.documentElement.classList.toggle('dark', themeDark);
		document.body.classList.toggle('dark', themeDark);
	}, [themeDark]);

	return (
		<div className='min-h-full flex flex-col'>
			<DashboardHeader
				title={title}
				subtitle={subtitle}
				themeDark={themeDark}
				onToggleTheme={() => setThemeDark(v => !v)}
				notifications={pendingInviteNotifications}
				onApproveInvite={handleApproveInvite}
				onDeclineInvite={handleDeclineInvite}
				respondPending={
					respondMutation.isPending
						? {
								id: respondMutation.variables?.bookingId,
								action: respondMutation.variables?.action,
								isPending: true,
							}
						: null
				}
			/>
			<div className='flex-1 px-6 lg:px-10 pb-8'>{children}</div>
		</div>
	);
}
