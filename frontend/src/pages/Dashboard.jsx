import { useEffect, useMemo, useState } from 'react';
import DashboardSidebar from '../components/DashboardSidebar.jsx';
import DashboardHeader from '../components/DashboardHeader.jsx';
import AIChatPanel from '../components/AIChatPanel.jsx';
import RecommendationSection from '../components/RecommendationSection.jsx';
import FacilitySection from '../components/FacilitySection.jsx';
import BookingsSection from '../components/BookingsSection.jsx';
import AdminSection from '../components/AdminSection.jsx';
import SettingsSection from '../components/SettingsSection.jsx';
import AIModal from '../components/AIModal.jsx';
import { mockAdminRooms, mockBookings, mockRecommendations, mockRooms } from '../lib/dashboardData.js';

const screenMeta = {
	booking: {
		title: 'Good afternoon, Alex.',
		subtitle: 'SiemensBooking is optimizing workspaces at the APC Site.',
	},
	'my-bookings': {
		title: 'Your Schedule',
		subtitle: 'Manage upcoming reservations and invites',
	},
	facility: {
		title: 'Facility Radar',
		subtitle: 'Live occupancy metrics for APC site',
	},
	admin: {
		title: 'Admin Module',
		subtitle: 'Space registry management',
	},
	settings: {
		title: 'Settings',
		subtitle: 'App preferences and integrations',
	},
};

const initialMessages = [
	{
		id: 'm1',
		role: 'assistant',
		text: "Hello Alex. I'm connected to the APC site sensors. Wings A-D are active. You can ask me to find a specific room, check amenities, or draft invites.",
	},
];

export default function Dashboard() {
	const [activeScreen, setActiveScreen] = useState('booking');
	const [mobileChatOpen, setMobileChatOpen] = useState(false);
	const [themeDark, setThemeDark] = useState(() => document.body.classList.contains('dark'));
	const [messages, setMessages] = useState(initialMessages);
	const [adminRooms, setAdminRooms] = useState(mockAdminRooms);
	const [bookings, setBookings] = useState(mockBookings);
	const [modalState, setModalState] = useState({ open: false, title: '', content: '' });

	useEffect(() => {
		document.body.classList.toggle('dark', themeDark);
	}, [themeDark]);

	const screen = useMemo(() => screenMeta[activeScreen] || screenMeta.booking, [activeScreen]);

	const handleSendMessage = content => {
		const userMessage = { id: `u-${Date.now()}`, role: 'user', text: content };
		setMessages(current => [...current, userMessage]);
		setTimeout(() => {
			const aiMessage = {
				id: `a-${Date.now()}`,
				role: 'assistant',
				text: content.toLowerCase().includes('booking')
					? 'I found the best available room and prepared a reservation suggestion for your team. Want me to send the invite?'
					: 'I recommend the Beta Lab in Wing B. It matches your capacity and includes video conferencing.',
			};
			setMessages(current => [...current, aiMessage]);
		}, 700);
	};

	const handleDraftInvite = () => {
		setModalState({
			open: true,
			title: 'AI Assist',
			content:
				'<p>Hi Team,</p><br/><p>Please join us for the project sync in the Beta Lab, Wing B.</p><br/><p><strong>Details:</strong><br/>9:30 AM - 10:30 AM<br/>Capacity: 12<br/>Amenities: Video Conferencing, Smart Board</p><br/><p>Best regards,</p>',
		});
	};

	const handleAddRoom = event => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const name = formData.get('name');
		const wing = formData.get('wing');
		const capacity = formData.get('capacity');
		const amenities = Array.from(event.currentTarget.querySelectorAll('input[type=checkbox]:checked')).map(
			input => input.value,
		);

		if (!name || !wing || !capacity) return;
		setAdminRooms(current => [
			...current,
			{
				id: `a-${Date.now()}`,
				name,
				wing,
				amenities,
			},
		]);
		event.currentTarget.reset();
	};

	return (
		<div className='min-h-screen bg-radial-glow pt-0 lg:pt-8 transition-colors duration-500'>
			<div className='lg:flex lg:items-start lg:justify-start'>
				<DashboardSidebar
					active={activeScreen}
					onChange={setActiveScreen}
					collapsed={false}
					onToggleCollapse={() => {}}
					profile={{
						name: 'Alex M.',
						team: 'APC Site',
						avatarUrl: 'https://ui-avatars.com/api/?name=Alex+M&background=009999&color=fff',
					}}
				/>
				<main className='flex-1 lg:ml-64 pt-4 lg:pt-0'>
					<DashboardHeader
						title={screen.title}
						subtitle={screen.subtitle}
						onToggleTheme={() => setThemeDark(prev => !prev)}
					/>
					<div className='p-4 lg:p-8 max-w-[1600px] mx-auto w-full'>
						{activeScreen === 'booking' && (
							<div className='lg:grid lg:grid-cols-12 lg:gap-10 flex flex-col h-full'>
								<AIChatPanel
									messages={messages}
									onSendMessage={handleSendMessage}
									onOpenMobileChat={() => setMobileChatOpen(true)}
									mobileOpen={mobileChatOpen}
									onCloseMobileChat={() => setMobileChatOpen(false)}
								/>
								<RecommendationSection recommendations={mockRecommendations} />
							</div>
						)}

						{activeScreen === 'facility' && (
							<div className='app-screen block p-4 lg:p-8 max-w-[1400px] mx-auto w-full animate-fade-in'>
								<FacilitySection rooms={mockRooms} />
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
									{mockRooms.map(room => (
										<div
											key={room.id}
											className='glass-panel p-6 rounded-[2rem] border-none shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform'
										>
											<div className='flex justify-between items-start mb-4'>
												<p className='font-bold text-lg text-slate-900 dark:text-white'>{room.name}</p>
												<span
													className={`text-[10px] font-black uppercase px-2 py-1 rounded ${room.status === 'available' ? 'bg-brand-500/10 text-brand-500' : 'bg-rose-500/10 text-rose-500'}`}
												>
													{room.status}
												</span>
											</div>
											<p className='text-[10px] text-gray-500 font-medium uppercase mb-4 tracking-widest'>
												{room.wing} • {room.capacity} Seats
											</p>
											{room.until ? (
												<div className='flex items-center text-[10px] text-gray-400 font-medium'>
													<span className='w-3 h-3 bg-brand-500 rounded-full mr-1 inline-block' />
													Occupied until {room.until}
												</div>
											) : (
												<div className='flex items-center text-[10px] font-bold text-brand-500'>
													<span className='w-3 h-3 bg-brand-500 rounded-full mr-1 inline-block' /> Ready for use
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}

						{activeScreen === 'my-bookings' && (
							<div className='app-screen block p-4 lg:p-8 max-w-[1400px] mx-auto w-full animate-fade-in'>
								<BookingsSection bookings={bookings} />
							</div>
						)}

						{activeScreen === 'admin' && (
							<div className='app-screen block p-4 lg:p-8 max-w-[1200px] mx-auto w-full animate-fade-in'>
								<AdminSection adminRooms={adminRooms} onAddRoom={handleAddRoom} />
							</div>
						)}

						{activeScreen === 'settings' && (
							<div className='app-screen block p-4 lg:p-8 max-w-2xl mx-auto w-full animate-fade-in'>
								<SettingsSection />
							</div>
						)}
					</div>
				</main>
			</div>
			<AIModal
				open={modalState.open}
				title={modalState.title}
				content={modalState.content}
				onClose={() => setModalState(current => ({ ...current, open: false }))}
			/>
		</div>
	);
}
