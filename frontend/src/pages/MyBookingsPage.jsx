import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell.jsx';
import BookingsSection from '../components/BookingsSection.jsx';
import { fetchBookings } from '../api/bookings';
import { useAuth } from '../contexts/AuthContext';

export default function MyBookingsPage() {
	const { user, isAuthenticated } = useAuth();
	const bookingsQuery = useQuery({
		queryKey: ['bookings', user?.id || 'me'],
		queryFn: () => fetchBookings(user?.id ? { userId: user.id } : undefined),
		enabled: isAuthenticated,
	});

	return (
		<PageShell title='Your Schedule' subtitle='Manage upcoming reservations and invites'>
			{bookingsQuery.isLoading ? (
				<p className='text-sm text-slate-500'>Loading bookings...</p>
			) : (
				<BookingsSection bookings={bookingsQuery.data || []} />
			)}
		</PageShell>
	);
}
