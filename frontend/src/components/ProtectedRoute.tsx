import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ReactNode, type JSX } from 'react';

interface ProtectedRouteProps {
	children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to='/signin' replace />;
	}

	return <>{children}</>;
}
