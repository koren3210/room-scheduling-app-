import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Home from '../pages/Home.jsx';
import SignIn from '../pages/SignIn.tsx';
import SignUp from '../pages/SignUp.jsx';
import DashboardLayout from '../layouts/DashboardLayout.tsx';
import BookingPage from '../pages/BookingPage.jsx';
import AvailableRoomsPage from '../pages/AvailableRoomsPage.jsx';
import FacilityPage from '../pages/FacilityPage.jsx';
import MyBookingsPage from '../pages/MyBookingsPage.jsx';
import AdminPage from '../pages/AdminPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';

export function useGenerateRoutes() {
	return useMemo(
		() => [
			{ path: '/', element: <Home /> },
			{ path: '/signin', element: <SignIn /> },
			{ path: '/signup', element: <SignUp /> },
			{
				path: '/dashboard',
				element: (
					<ProtectedRoute>
						<DashboardLayout />
					</ProtectedRoute>
				),
				children: [
					{ index: true, element: <Navigate to='booking' replace /> },
					{ path: 'booking', element: <BookingPage /> },
					{ path: 'rooms', element: <AvailableRoomsPage /> },
					{ path: 'facility', element: <FacilityPage /> },
					{ path: 'my-bookings', element: <MyBookingsPage /> },
					{ path: 'admin', element: <AdminPage /> },
					{ path: 'settings', element: <SettingsPage /> },
				],
			},
			{ path: '*', element: <Navigate to='/' replace /> },
		],
		[],
	);
}
