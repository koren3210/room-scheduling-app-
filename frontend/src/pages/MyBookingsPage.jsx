import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import PageShell from '../components/PageShell.jsx';
import BookingsSection from '../components/BookingsSection.jsx';
import { cancelBooking, fetchBookings, respondToBooking, subscribeToBookingNotifications } from '../api/bookings';
import { useAuth } from '../contexts/AuthContext';

export default function MyBookingsPage() {
	const { user, isAuthenticated } = useAuth();
	const queryClient = useQueryClient();
	const [draftModal, setDraftModal] = useState(null);
	const bookingsQuery = useQuery({
		queryKey: ['bookings', user?.id || 'me'],
		queryFn: () => fetchBookings({ mine: true }),
		enabled: isAuthenticated,
	});

	useEffect(() => {
		if (!isAuthenticated || !user?.id) return undefined;

		const token = localStorage.getItem('token');
		if (!token) return undefined;

		const source = subscribeToBookingNotifications(
			token,
			event => {
				if (!event?.eventType || event.eventType === 'connected') return;
				queryClient.invalidateQueries({ queryKey: ['bookings'] });

				if (event.actorId && String(event.actorId) === String(user.id)) return;

				if (event.eventType === 'booking_created') {
					toast.info('You have a new meeting request.');
				}
				if (event.eventType === 'booking_responded') {
					toast.success(event.action === 'approve' ? 'A meeting was approved.' : 'A meeting was declined.');
				}
				if (event.eventType === 'booking_cancelled') {
					toast.info('Meeting was cancelled by the organizer.');
				}
				if (event.eventType === 'booking_updated') {
					toast.info('A meeting booking was updated.');
				}
			},
			() => {
				// Keep silent; EventSource retries automatically.
			},
		);

		return () => {
			source.close();
		};
	}, [isAuthenticated, queryClient, user?.id]);

	const cancelMutation = useMutation({
		mutationFn: cancelBooking,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['bookings'] });
			toast.success('Meeting cancelled successfully.');
		},
		onError: error => {
			const backendMsg = error?.response?.data?.error;
			toast.error(backendMsg || error?.message || 'Could not cancel meeting.');
		},
	});

	const handleCancelBooking = bookingId => {
		cancelMutation.mutate(bookingId);
	};

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

	const handleRespondToBooking = (bookingId, action) => {
		respondMutation.mutate({ bookingId, action });
	};

	const buildOutlookDraft = booking => {
		const room = typeof booking.room === 'object' ? booking.room : null;
		const organizer = typeof booking.user === 'object' ? booking.user : null;
		const attendees = Array.isArray(booking.attendeeUsers) ? booking.attendeeUsers : [];
		const start = booking.startAt ? new Date(booking.startAt) : null;
		const end = booking.endAt ? new Date(booking.endAt) : null;

		const subject = `Meeting Update: ${booking.purpose || room?.name || 'Room Booking'}`;
		const lines = [
			`Hello team,`,
			``,
			`This is an automated update from SiemensBooking via Outlook.`,
			``,
			`Purpose: ${booking.purpose || 'N/A'}`,
			`Room: ${room?.name || 'N/A'} (${room?.wing || booking.wing || 'N/A'})`,
			`Start: ${start ? start.toLocaleString() : 'N/A'}`,
			`End: ${end ? end.toLocaleString() : 'N/A'}`,
			`Attendees: ${
				attendees
					.map(a => a.email || a.name)
					.filter(Boolean)
					.join(', ') || 'N/A'
			}`,
			``,
			`Organizer: ${organizer?.name || user?.name || 'N/A'}`,
			`Status: Sent`,
		];

		return {
			subject,
			body: lines.join('\n'),
			to: attendees.map(a => a.email).filter(Boolean),
		};
	};

	const handleAIDraft = booking => {
		const draft = buildOutlookDraft(booking);
		setDraftModal({
			bookingId: booking._id || booking.id,
			...draft,
			sentAt: new Date().toLocaleString(),
		});
	};

	const draftRecipients = useMemo(() => {
		if (!draftModal?.to?.length) return 'Undisclosed recipients';
		return draftModal.to.join('; ');
	}, [draftModal]);

	return (
		<>
			{draftModal && (
				<div className='fixed inset-0 z-[100000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4'>
					<div className='w-full max-w-2xl bg-white dark:bg-[#0f151a] rounded-2xl border border-black/10 dark:border-white/10 p-5'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-sm font-bold text-slate-900 dark:text-white'>Outlook Message Preview</h3>
							<button
								type='button'
								onClick={() => setDraftModal(null)}
								className='text-slate-500 hover:text-slate-900 dark:hover:text-white'
							>
								Close
							</button>
						</div>
						<div className='space-y-3 text-xs'>
							<p className='text-slate-500'>Sent via Outlook at {draftModal.sentAt}</p>
							<div className='rounded-xl border border-black/10 dark:border-white/10 p-3 bg-white/70 dark:bg-black/20'>
								<p>
									<span className='font-bold'>To:</span> {draftRecipients}
								</p>
								<p>
									<span className='font-bold'>Subject:</span> {draftModal.subject}
								</p>
							</div>
							<pre className='rounded-xl border border-black/10 dark:border-white/10 p-3 bg-white/70 dark:bg-black/20 whitespace-pre-wrap text-[11px] text-slate-700 dark:text-slate-200'>
								{draftModal.body}
							</pre>
						</div>
					</div>
				</div>
			)}
			<PageShell title='Your Schedule' subtitle='Manage upcoming reservations and invites'>
				{bookingsQuery.isLoading ? (
					<p className='text-sm text-slate-500'>Loading bookings...</p>
				) : (
					<BookingsSection
						bookings={bookingsQuery.data || []}
						onCancelBooking={handleCancelBooking}
						onRespondToBooking={handleRespondToBooking}
						onAIDraft={handleAIDraft}
						cancelPendingId={cancelMutation.isPending ? cancelMutation.variables : null}
						respondPending={
							respondMutation.isPending
								? {
										id: respondMutation.variables?.bookingId,
										action: respondMutation.variables?.action,
										isPending: true,
									}
								: null
						}
						currentUserId={user?.id}
						currentUserRole={user?.role}
					/>
				)}
			</PageShell>
		</>
	);
}
