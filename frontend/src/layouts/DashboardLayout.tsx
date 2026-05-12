import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar.jsx';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardLayout() {
	const [collapsed, setCollapsed] = useState(false);
	const navigate = useNavigate();
	const { user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		navigate('/signin');
	};

	const profile = {
		name: user?.name || 'Workspace User',
		team: user?.role === 'admin' ? 'Admin' : 'APC Site',
		avatarUrl:
			user?.avatarUrl ||
			`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Workspace User')}&background=009999&color=fff`,
	};

	return (
		<div className='h-screen overflow-hidden flex flex-col lg:flex-row bg-slate-50 dark:bg-[#090d12] transition-colors duration-300'>
			{/* Ambient background glows */}
			<div className='fixed top-0 left-0 w-[600px] h-[600px] rounded-full bg-siemens-petrol/8 blur-[140px] pointer-events-none z-0' />
			<div className='fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-siemens-glow/5 blur-[120px] pointer-events-none z-0' />

			{/* Sidebar — fixed height on desktop, bottom bar on mobile */}
			<DashboardSidebar
				collapsed={collapsed}
				onToggleCollapse={() => setCollapsed(prev => !prev)}
				profile={profile}
				onLogout={handleLogout}
			/>

			{/* Main scrollable area */}
			<main className='flex-1 min-w-0 h-screen overflow-y-auto relative z-10 pb-24 lg:pb-0'>
				<Outlet />
			</main>
		</div>
	);
}
