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
import { parseBookingAI } from '../api/ai';
import { useAuth } from '../contexts/AuthContext';

function nextHalfHourWindow() {
	const start = new Date();
	start.setSeconds(0, 0);
	const minutes = start.getMinutes();
	start.setMinutes(minutes < 30 ? 30 : 60, 0, 0);
	const end = new Date(start.getTime() + 60 * 60 * 1000);
	return { start, end };
}

function parseAIDate(value) {
	if (!value) return null;
	if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
	if (typeof value !== 'string') return null;

	// Handle local datetime string formats like "2026-05-13 11:00" reliably.
	const normalized = value.includes('T') ? value : value.replace(' ', 'T');
	const date = new Date(normalized);
	if (Number.isNaN(date.getTime())) return null;
	return date;
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
	const [aiPending, setAiPending] = useState(false);
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

	const handleSendMessage = async content => {
		if (aiPending) return;
		const userMsg = { id: `u-${Date.now()}`, role: 'user', text: content };
		setMessages(curr => [...curr, userMsg]);
		setAiPending(true);

		const streamAssistantMessage = payload =>
			new Promise(resolve => {
				const id = payload.id || `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
				const fullText = payload.text || '';
				setMessages(curr => [...curr, { ...payload, id, text: '', streaming: true }]);

				if (!fullText.length) {
					setMessages(curr => curr.map(msg => (msg.id === id ? { ...msg, streaming: false } : msg)));
					resolve();
					return;
				}

				let index = 0;
				const chunk = Math.max(1, Math.ceil(fullText.length / 42));
				const timer = setInterval(() => {
					index = Math.min(fullText.length, index + chunk);
					const done = index >= fullText.length;
					setMessages(curr =>
						curr.map(msg =>
							msg.id === id
								? {
										...msg,
										text: fullText.slice(0, index),
										streaming: !done,
									}
								: msg,
						),
					);
					if (done) {
						clearInterval(timer);
						resolve();
					}
				}, 28);
			});

		// Call backend AI endpoint
		try {
			const aiResult = await parseBookingAI(content);
			if (aiResult && aiResult.roomId) {
				// Find the room object
				const rooms = roomsQuery.data || [];
				const room = rooms.find(r => (r._id || r.id) === aiResult.roomId);
				const attendeeIds = Array.isArray(aiResult.attendees) ? aiResult.attendees : [];
				const aiCard = {
					role: 'assistant',
					type: 'roomSuggestion',
					text: aiResult.purpose
						? `I found a room and filled the form for: ${aiResult.purpose}`
						: 'I found a strong match for your request.',
					room: room
						? {
								id: room._id || room.id,
								name: room.name,
								wing: room.wing,
								capacity: room.capacity,
								amenities: room.amenities || [],
								image:
									room.images?.[0] ||
									'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
							}
						: null,
					aiPrefill: {
						purpose: aiResult.purpose,
						attendees: attendeeIds,
						amenities: aiResult.amenities,
						startAt: aiResult.startAt,
						endAt: aiResult.endAt,
					},
				};
				await streamAssistantMessage(aiCard);
			} else {
				await streamAssistantMessage({
					role: 'assistant',
					text: aiResult?.error || 'Sorry, I could not find a suitable room.',
				});
			}
		} catch (err) {
			await streamAssistantMessage({
				role: 'assistant',
				text: 'AI error: ' + (err?.message || 'Unknown error'),
			});
		} finally {
			setAiPending(false);
		}
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
		const fallbackWindow = nextHalfHourWindow();
		const aiStartAt = parseAIDate(aiPrefill.startAt);
		const aiEndAt = parseAIDate(aiPrefill.endAt);
		const startAt = aiStartAt || fallbackWindow.start;
		const endAt = aiEndAt && aiEndAt > startAt ? aiEndAt : new Date(startAt.getTime() + 60 * 60 * 1000);

		setForm(curr => ({
			...curr,
			room: selectedRoom.id || selectedRoom._id,
			wing: selectedRoom.wing,
			startAt,
			endAt,
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
						isThinking={aiPending}
						onSendMessage={handleSendMessage}
						onOpenMobileChat={() => setMobileChatOpen(true)}
						mobileOpen={mobileChatOpen}
						onCloseMobileChat={() => setMobileChatOpen(false)}
						onBookRoom={handleUseInForm}
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
