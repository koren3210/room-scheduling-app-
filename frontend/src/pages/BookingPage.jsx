import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DatePicker from 'react-datepicker';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import PageShell from '../components/PageShell.jsx';
import AIChatPanel from '../components/AIChatPanel.jsx';
import RecommendationSection from '../components/RecommendationSection.jsx';
import { fetchRooms } from '../api/rooms';
import { createBooking } from '../api/bookings';
import { fetchUsers } from '../api/users';
import { useAuth } from '../contexts/AuthContext';

function nextHalfHourWindow() {
	const start = new Date();
	start.setSeconds(0, 0);
	const minutes = start.getMinutes();
	start.setMinutes(minutes < 30 ? 30 : 60, 0, 0);
	const end = new Date(start.getTime() + 60 * 60 * 1000);
	return { start, end };
}

export default function BookingPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const firstName = user?.name?.trim()?.split(/\s+/)?.[0] || 'there';
	const [messages, setMessages] = useState([
		{
			id: 'm1',
			role: 'assistant',
			text: `Hello ${firstName}. I'm connected to the APC site sensors. Wings A-D are active. Ask me to find a room, check amenities, or draft invites.`,
		},
	]);
	const [mobileChatOpen, setMobileChatOpen] = useState(false);
	const [bookingModalOpen, setBookingModalOpen] = useState(false);
	const initialWindow = useMemo(() => nextHalfHourWindow(), []);
	const [selectedAttendees, setSelectedAttendees] = useState([]);
	const [form, setForm] = useState({
		room: '',
		wing: 'Wing A',
		startAt: initialWindow.start,
		endAt: initialWindow.end,
		purpose: 'Team sync',
	});

	const roomsQuery = useQuery({
		queryKey: ['rooms'],
		queryFn: () => fetchRooms({ available: true }),
	});

	const usersQuery = useQuery({
		queryKey: ['users'],
		queryFn: () => fetchUsers(),
	});

	const bookingMutation = useMutation({
		mutationFn: createBooking,
		onSuccess: booking => {
			queryClient.invalidateQueries({ queryKey: ['bookings'] });
			toast.success(`Booking created for ${booking?.room?.name || 'room'}.`);
			setBookingModalOpen(false);
			setMessages(curr => [
				...curr,
				{
					id: `b-${Date.now()}`,
					role: 'assistant',
					text: `Booked ${booking?.room?.name || 'room'} successfully. You can review it in Schedule.`,
				},
			]);
		},
		onError: error => {
			// Prefer backend error message if available (e.g., 409 conflict)
			const backendMsg = error?.response?.data?.error;
			toast.error(backendMsg || error?.message || 'Booking failed. Please try again.');
		},
	});

	const pickSuggestedRoom = content => {
		const rooms = roomsQuery.data || [];
		if (rooms.length === 0) return null;

		const wingMatch = content.match(/wing\s*([abcd])/i);
		const capacityMatch = content.match(/(\d+)\s*(people|person|seats?)/i);
		const requestedWing = wingMatch ? `Wing ${wingMatch[1].toUpperCase()}` : null;
		const requestedCapacity = capacityMatch ? Number(capacityMatch[1]) : null;

		// Parse for amenities (simple: look for 'whiteboard', 'projector', etc)
		const amenityKeywords = ['whiteboard', 'projector', 'tv', 'screen', 'video', 'conference', 'phone', 'monitor'];
		const requestedAmenities = amenityKeywords.filter(a => content.toLowerCase().includes(a));

		let filtered = rooms;
		if (requestedWing) filtered = filtered.filter(room => room.wing === requestedWing);
		if (requestedCapacity) filtered = filtered.filter(room => room.capacity >= requestedCapacity);
		if (requestedAmenities.length > 0) {
			filtered = filtered.filter(room =>
				requestedAmenities.every(a => (room.amenities || []).map(x => x.toLowerCase()).includes(a)),
			);
		}

		return (filtered[0] || rooms[0]) ?? null;
	};

	// Helper to extract meeting name and attendees from input
	function parseMeetingDetails(content, users) {
		// Try to extract a quoted meeting name or after 'called|named|for|about'
		let purpose = '';
		const nameMatch = content.match(/(?:called|named|for|about)\s+['"]?([\w\s-]{3,})['"]?/i);
		if (nameMatch) {
			purpose = nameMatch[1].trim();
		} else {
			// fallback: look for quoted string
			const quoteMatch = content.match(/['"]([\w\s-]{3,})['"]/);
			if (quoteMatch) purpose = quoteMatch[1].trim();
		}

		// Try to extract attendees by name or email
		let attendees = [];
		if (users && users.length) {
			// Find all names/emails in the content
			users.forEach(u => {
				if (
					(u.name && new RegExp(u.name, 'i').test(content)) ||
					(u.email && content.toLowerCase().includes(u.email.toLowerCase()))
				) {
					attendees.push(u.id);
				}
			});
		}
		return { purpose, attendees };
	}

	const handleSendMessage = content => {
		const userMsg = { id: `u-${Date.now()}`, role: 'user', text: content };
		setMessages(curr => [...curr, userMsg]);
		setTimeout(() => {
			const suggestedRoom = pickSuggestedRoom(content);
			const users = usersQuery.data || [];
			const { purpose, attendees } = parseMeetingDetails(content, users);
			if (suggestedRoom) {
				const aiCard = {
					id: `a-${Date.now()}`,
					role: 'assistant',
					type: 'roomSuggestion',
					text: `I found a strong match for your request.`,
					room: {
						id: suggestedRoom._id || suggestedRoom.id,
						name: suggestedRoom.name,
						wing: suggestedRoom.wing,
						capacity: suggestedRoom.capacity,
						amenities: suggestedRoom.amenities || [],
						image:
							suggestedRoom.images?.[0] ||
							'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
					},
					aiPrefill: {
						purpose,
						attendees,
					},
				};
				setMessages(curr => [...curr, aiCard]);
				return;
			}

			const aiMsg = {
				id: `a-${Date.now()}`,
				role: 'assistant',
				text: content.toLowerCase().includes('booking')
					? 'I found the best available room and prepared a reservation suggestion. Want me to send the invite?'
					: 'I recommend the Beta Lab in Wing B — it matches your capacity and includes video conferencing.',
			};
			setMessages(curr => [...curr, aiMsg]);
		}, 700);
	};

	const recommendations = (roomsQuery.data || []).slice(0, 8).map(room => ({
		id: room._id || room.id,
		name: room.name,
		capacity: room.capacity,
		wing: room.wing,
		amenities: room.amenities || [],
		score: 92,
		image:
			room.images?.[0] || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
	}));

	const handleQuickBook = selectedRoom => {
		const { start, end } = nextHalfHourWindow();
		bookingMutation.mutate({
			room: selectedRoom.id || selectedRoom._id,
			wing: selectedRoom.wing,
			startAt: start.toISOString(),
			endAt: end.toISOString(),
			purpose: `Quick booking for ${selectedRoom.name}`,
			attendeeUsers: user?.id ? [user.id] : [],
		});
	};

	// Accepts optional aiPrefill for purpose and attendees
	const handleUseInForm = (selectedRoom, aiPrefill = {}) => {
		setForm(curr => ({
			...curr,
			room: selectedRoom.id || selectedRoom._id,
			wing: selectedRoom.wing,
			purpose: aiPrefill.purpose || `Meeting in ${selectedRoom.name}`,
		}));
		// Always include the current user in attendees
		let attendees = aiPrefill.attendees && aiPrefill.attendees.length ? [...aiPrefill.attendees] : [];
		if (user?.id && !attendees.includes(user.id)) {
			attendees.push(user.id);
		}
		setSelectedAttendees(attendees);
		setBookingModalOpen(true);
	};

	const handleOpenForm = () => {
		// Always include the current user when opening a blank form
		setSelectedAttendees(user?.id ? [user.id] : []);
		setBookingModalOpen(true);
	};

	const handleSubmitForm = event => {
		event.preventDefault();
		if (!form.room) {
			toast.warn('Please select a room before booking.');
			return;
		}
		if (form.endAt <= form.startAt) {
			toast.warn('End time must be after start time.');
			return;
		}
		bookingMutation.mutate({
			room: form.room,
			wing: form.wing,
			startAt: form.startAt.toISOString(),
			endAt: form.endAt.toISOString(),
			purpose: form.purpose,
			attendeeUsers: selectedAttendees,
		});
	};

	const toggleAttendee = id => {
		setSelectedAttendees(curr => (curr.includes(id) ? curr.filter(item => item !== id) : [...curr, id]));
	};

	return (
		<>
			{bookingModalOpen && (
				<div className='fixed inset-0 z-[100000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4'>
					<div className='w-full max-w-2xl bg-white dark:bg-[#0f151a] rounded-2xl border border-black/10 dark:border-white/10 p-5'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-sm font-bold text-slate-900 dark:text-white'>Create Booking</h3>
							<button
								type='button'
								onClick={() => setBookingModalOpen(false)}
								className='text-slate-500 hover:text-slate-900 dark:hover:text-white'
							>
								Close
							</button>
						</div>

						<form onSubmit={handleSubmitForm} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<select
								value={form.room}
								onChange={event => {
									const selectedRoom = (roomsQuery.data || []).find(room => (room._id || room.id) === event.target.value);
									setForm(curr => ({
										...curr,
										room: event.target.value,
										wing: selectedRoom?.wing || curr.wing,
									}));
								}}
								className='bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm'
								required
							>
								<option value=''>Select room</option>
								{(roomsQuery.data || []).map(room => (
									<option key={room._id || room.id} value={room._id || room.id}>
										{room.name} ({room.wing})
									</option>
								))}
							</select>

							<input
								type='text'
								value={form.purpose}
								onChange={event => setForm(curr => ({ ...curr, purpose: event.target.value }))}
								placeholder='Purpose'
								className='bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm'
							/>

							<div>
								<p className='text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1'>Start</p>
								<DatePicker
									selected={form.startAt}
									onChange={date => setForm(curr => ({ ...curr, startAt: date || curr.startAt }))}
									showTimeSelect
									timeIntervals={15}
									dateFormat='Pp'
									className='w-full bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm'
								/>
							</div>

							<div>
								<p className='text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1'>End</p>
								<DatePicker
									selected={form.endAt}
									onChange={date => setForm(curr => ({ ...curr, endAt: date || curr.endAt }))}
									showTimeSelect
									timeIntervals={15}
									dateFormat='Pp'
									minDate={form.startAt}
									className='w-full bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm'
								/>
							</div>

							<div className='md:col-span-2'>
								<p className='text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2'>Attendees</p>
								<div className='flex flex-wrap gap-2 max-h-28 overflow-y-auto'>
									{(usersQuery.data || []).map(option => (
										<button
											type='button'
											key={option.id}
											onClick={() => toggleAttendee(option.id)}
											className={`px-2 py-1 rounded-lg border text-xs ${
												selectedAttendees.includes(option.id)
													? 'bg-siemens-petrol text-white border-siemens-petrol'
													: 'bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-200'
											}`}
										>
											{option.name}
										</button>
									))}
								</div>
							</div>

							<div className='md:col-span-2 flex items-center justify-end gap-2'>
								<button
									type='button'
									onClick={() => setBookingModalOpen(false)}
									className='px-4 py-2 border border-black/10 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest'
								>
									Cancel
								</button>
								<button
									type='submit'
									disabled={bookingMutation.isPending}
									className='px-4 py-2 bg-siemens-petrol text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-60'
								>
									{bookingMutation.isPending ? 'Booking...' : 'Book Room'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
			<PageShell title={`Good afternoon, ${firstName}.`} subtitle='SiemensBooking is optimizing workspaces at the APC Site.'>
				<div className='flex items-center justify-end mb-4'>
					<button
						type='button'
						onClick={handleOpenForm}
						className='px-4 py-2 bg-siemens-petrol text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-siemens-glow transition-colors'
					>
						Create Booking
					</button>
				</div>

				<div className='flex flex-col gap-6 min-h-0'>
					<AIChatPanel
						messages={messages}
						onSendMessage={handleSendMessage}
						onOpenMobileChat={() => setMobileChatOpen(true)}
						mobileOpen={mobileChatOpen}
						onCloseMobileChat={() => setMobileChatOpen(false)}
						onBookRoom={handleQuickBook}
						onUseRoom={handleUseInForm}
						userAvatarUrl={user?.avatarUrl}
					/>
					<RecommendationSection
						recommendations={recommendations}
						onQuickBook={handleQuickBook}
						onSelectRoom={handleUseInForm}
						onSeeAll={() => navigate('/dashboard/rooms')}
					/>
				</div>
			</PageShell>
		</>
	);
}
