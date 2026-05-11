import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import './App.css';

const queryClient = new QueryClient();

function AppContent(): JSX.Element {
	const { isAuthenticated, logout } = useAuth();

	return (
		<div className='app-shell'>
			<header className='app-header'>
				<NavLink to='/' className='brand-link'>
					SiemensBooking
				</NavLink>
				<nav className='header-nav'>
					{isAuthenticated ? (
						<button onClick={logout} className='nav-link'>
							Logout
						</button>
					) : (
						<>
							<NavLink to='/signin' className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
								Sign in
							</NavLink>
							<NavLink to='/signup' className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
								Sign up
							</NavLink>
						</>
					)}
				</nav>
			</header>

			<main className='app-main'>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/signin' element={<SignIn />} />
					<Route path='/signup' element={<SignUp />} />
					<Route
						path='/dashboard'
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</main>
		</div>
	);
}

function App(): JSX.Element {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<BrowserRouter>
					<AppContent />
				</BrowserRouter>
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default App;
