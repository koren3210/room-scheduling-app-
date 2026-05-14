import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Send, X } from 'lucide-react';

function AssistantRoomCard({ message, onBookRoom }) {
	const room = message.room;
	const aiPrefill = message.aiPrefill || {};
	if (!room) return null;

	return (
		<div className='mt-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 overflow-hidden'>
			{room.image && <img src={room.image} alt={room.name} className='w-full h-24 object-cover' />}
			<div className='p-3'>
				<p className='font-bold text-slate-900 dark:text-white text-sm'>{room.name}</p>
				<p className='text-[10px] font-black tracking-widest uppercase text-slate-400 mt-1'>
					{room.wing} • {room.capacity} Seats
				</p>
				<div className='flex flex-wrap gap-1 mt-2'>
					{(room.amenities || []).slice(0, 3).map(amenity => (
						<span
							key={amenity}
							className='text-[9px] font-bold bg-black/[0.04] dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04] uppercase tracking-wider'
						>
							{amenity}
						</span>
					))}
				</div>
				<div className='flex items-center gap-2 mt-3'>
					<button
						type='button'
						onClick={() => onBookRoom?.(room, aiPrefill)}
						className='px-3 py-1.5 bg-siemens-petrol text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-siemens-glow transition-colors'
					>
						Book Now
					</button>
				</div>
			</div>
		</div>
	);
}

function MessageBubble({ message, onBookRoom }) {
	if (message.type === 'roomSuggestion' && message.role === 'assistant') {
		return (
			<>
				<p>
					{message.text}
					{message.streaming && (
						<span className='inline-block w-2 h-4 ml-1 align-middle bg-siemens-petrol/70 animate-pulse' />
					)}
				</p>
				{!message.streaming && <AssistantRoomCard message={message} onBookRoom={onBookRoom} />}
			</>
		);
	}

	return (
		<p>
			{message.text}
			{message.streaming && <span className='inline-block w-2 h-4 ml-1 align-middle bg-siemens-petrol/70 animate-pulse' />}
		</p>
	);
}

function ThinkingDots() {
	return (
		<div className='flex items-center gap-1.5'>
			<span className='h-2 w-2 rounded-full bg-siemens-petrol/80 animate-bounce [animation-delay:-0.2s]' />
			<span className='h-2 w-2 rounded-full bg-siemens-petrol/80 animate-bounce [animation-delay:-0.1s]' />
			<span className='h-2 w-2 rounded-full bg-siemens-petrol/80 animate-bounce' />
			<span className='text-[11px] font-semibold text-slate-500 dark:text-slate-300 ml-1'>AI is thinking</span>
		</div>
	);
}

export default function AIChatPanel({
	messages,
	isThinking,
	onSendMessage,
	onOpenMobileChat,
	mobileOpen,
	onCloseMobileChat,
	onBookRoom,
	userAvatarUrl,
}) {
	const [input, setInput] = useState('');

	const handleSubmit = event => {
		event.preventDefault();
		if (!input.trim() || isThinking) return;
		onSendMessage(input.trim());
		setInput('');
	};

	return (
		<>
			{/* MOBILE LAUNCH CARD - Wrapped in a container to prevent overflow */}
			<div className='lg:hidden w-full px-4 mb-8'>
				<div
					className='w-full box-border glass rounded-2xl sm:rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-center shadow-md active:scale-[0.98] transition-all border-none cursor-pointer overflow-hidden'
					onClick={onOpenMobileChat}
				>
					<div className='w-16 h-16 rounded-2xl bg-siemens-petrol flex items-center justify-center mb-5 shadow-lg'>
						<Bot className='text-white w-8 h-8' />
					</div>
					<h3 className='text-2xl font-black mb-2 text-slate-900 dark:text-white'>SmartSpace AI</h3>
					<p className='text-slate-500 text-sm mb-6'>Ask to find rooms or draft invites.</p>
					<span className='px-8 py-3 bg-siemens-petrol text-white rounded-full text-xs font-bold uppercase tracking-widest'>
						Launch Console
					</span>
				</div>
			</div>

			{/* DESKTOP PANEL */}
			<section className='hidden lg:flex flex-col group glass lg:rounded-[2rem] overflow-hidden lg:shadow-xl lg:h-[min(68vh,720px)] lg:min-h-[520px] border border-black/5 dark:border-white/5 shrink-0 bg-white/40 dark:bg-gray-900/40 min-w-0'>
				<div className='p-5 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shrink-0'>
					<div className='flex items-center space-x-3'>
						<div className='w-10 h-10 rounded-xl bg-siemens-petrol flex items-center justify-center shadow-sm'>
							<Bot className='w-5 h-5 text-white' />
						</div>
						<div>
							<h2 className='font-bold text-lg text-slate-900 dark:text-white leading-none'>SmartSpace AI</h2>
							<p className='text-[9px] font-bold text-siemens-petrol uppercase tracking-widest mt-1'>Active Sensor Link</p>
						</div>
					</div>
				</div>

				<div
					className='chat-history flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar scroll-smooth'
					style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
				>
					{messages.map(message => (
						<div
							key={message.id}
							className={`flex items-end max-w-[85%] animate-fade-in ${message.role === 'user' ? 'ml-auto justify-end' : 'justify-start'}`}
						>
							{message.role === 'assistant' && (
								<div className='w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm mr-3 border border-black/5 dark:border-white/5'>
									<Bot className='w-4 h-4 text-siemens-petrol' />
								</div>
							)}
							<div
								className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-sm bg-siemens-petrol text-white' : 'rounded-bl-sm bg-white dark:bg-slate-900 border border-black/5 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'}`}
							>
								<MessageBubble message={message} onBookRoom={onBookRoom} />
							</div>
							{message.role === 'user' && (
								<div className='w-8 h-8 rounded-full bg-brand-500/10 shrink-0 shadow-sm ml-3 border border-white/20 flex items-center justify-center overflow-hidden'>
									{userAvatarUrl ? (
										<img src={userAvatarUrl} alt='Me' className='w-8 h-8 object-cover rounded-full' />
									) : (
										<Bot className='w-4 h-4 text-brand-500' />
									)}
								</div>
							)}
						</div>
					))}
					{isThinking && (
						<div className='flex items-end max-w-[85%] justify-start animate-fade-in'>
							<div className='w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm mr-3 border border-black/5 dark:border-white/5'>
								<Bot className='w-4 h-4 text-siemens-petrol' />
							</div>
							<div className='px-4 py-3 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-900 border border-black/5 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'>
								<ThinkingDots />
							</div>
						</div>
					)}
				</div>

				<div className='p-5 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shrink-0'>
					<div className='flex space-x-2 overflow-x-auto custom-scrollbar pb-3 mb-2 w-full snap-x'>
						{['Find a room in Wing B for 4', 'Need a room with a Whiteboard', 'Create a booking for 10 people'].map(
							prompt => (
								<button
									key={prompt}
									type='button'
									onClick={() => onSendMessage(prompt)}
									disabled={isThinking}
									className='shrink-0 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-black/5 dark:border-white/5 text-[11px] font-medium shadow-sm active:scale-95 whitespace-nowrap text-slate-600 dark:text-gray-300 hover:text-siemens-petrol transition-colors'
								>
									{prompt}
								</button>
							),
						)}
					</div>
					<form onSubmit={handleSubmit} className='relative'>
						<input
							value={input}
							onChange={event => setInput(event.target.value)}
							disabled={isThinking}
							type='text'
							className='chat-input w-full bg-white dark:bg-[#0f151a] border border-black/5 dark:border-white/5 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-siemens-petrol focus:ring-1 focus:ring-siemens-petrol shadow-sm text-slate-900 dark:text-white transition-all'
							style={{ fontSize: '16px' }}
							placeholder='Ask for a room...'
						/>
						<button
							type='submit'
							disabled={isThinking}
							className='absolute right-1.5 top-1.5 w-9 h-9 bg-siemens-petrol text-white rounded-lg flex items-center justify-center transition-all hover:bg-siemens-glow active:scale-95'
						>
							<Send className='w-4 h-4' />
						</button>
					</form>
				</div>
			</section>

			{mobileOpen &&
				typeof document !== 'undefined' &&
				createPortal(
					<div className='fixed inset-0 z-[99999] flex flex-col bg-slate-50 dark:bg-[#090d12] touch-pan-y'>
						<div className='flex items-center justify-between px-4 py-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-xl shrink-0'>
							<div className='flex items-center gap-3'>
								<div className='w-8 h-8 rounded-xl bg-siemens-petrol flex items-center justify-center'>
									<Bot className='w-4 h-4 text-white' />
								</div>
								<div>
									<h2 className='font-bold text-[15px] text-slate-900 dark:text-white leading-none'>SmartSpace AI</h2>
									<p className='text-[9px] font-bold text-siemens-petrol uppercase tracking-widest mt-0.5'>
										Active Sensor Link
									</p>
								</div>
							</div>
							<button
								type='button'
								onClick={onCloseMobileChat}
								className='p-2 rounded-lg bg-black/5 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors'
							>
								<X className='w-5 h-5' />
							</button>
						</div>

						<div
							className='flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth custom-scrollbar bg-slate-50 dark:bg-slate-950'
							style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
						>
							{messages.map(message => (
								<div
									key={`mobile-${message.id}`}
									className={`flex items-end max-w-[90%] animate-fade-in ${message.role === 'user' ? 'ml-auto justify-end' : 'justify-start'}`}
								>
									{message.role === 'assistant' && (
										<div className='w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm mr-3 border border-black/5 dark:border-white/5'>
											<Bot className='w-4 h-4 text-siemens-petrol' />
										</div>
									)}
									<div
										className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-sm bg-siemens-petrol text-white' : 'rounded-bl-sm bg-white dark:bg-[#1A2227] border border-black/5 dark:border-white/5 text-slate-800 dark:text-gray-200 shadow-sm'}`}
									>
										<MessageBubble message={message} onBookRoom={onBookRoom} />
									</div>
									{message.role === 'user' && (
										<div className='w-8 h-8 rounded-full bg-brand-500/10 shrink-0 shadow-sm ml-3 border border-white/20 flex items-center justify-center overflow-hidden'>
											{userAvatarUrl ? (
												<img src={userAvatarUrl} alt='Me' className='w-8 h-8 object-cover rounded-full' />
											) : (
												<Bot className='w-4 h-4 text-brand-500' />
											)}
										</div>
									)}
								</div>
							))}
							{isThinking && (
								<div className='flex items-end max-w-[90%] justify-start animate-fade-in'>
									<div className='w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm mr-3 border border-black/5 dark:border-white/5'>
										<Bot className='w-4 h-4 text-siemens-petrol' />
									</div>
									<div className='px-4 py-3 rounded-2xl rounded-bl-sm bg-white dark:bg-[#1A2227] border border-black/5 dark:border-white/5 text-slate-800 dark:text-gray-200 shadow-sm'>
										<ThinkingDots />
									</div>
								</div>
							)}
						</div>

						<div className='p-3 border-t border-black/5 dark:border-white/5 bg-white/90 dark:bg-[#0B1114]/90 backdrop-blur-xl'>
							<form onSubmit={handleSubmit} className='relative'>
								<input
									value={input}
									onChange={event => setInput(event.target.value)}
									disabled={isThinking}
									type='text'
									className='w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-siemens-petrol focus:ring-1 focus:ring-siemens-petrol text-slate-900 dark:text-white'
									style={{ fontSize: '16px' }}
									placeholder='Ask for a room...'
								/>
								<button
									type='submit'
									disabled={isThinking}
									className='absolute right-1.5 top-1.5 w-9 h-9 bg-siemens-petrol text-white rounded-lg flex items-center justify-center active:scale-95'
								>
									<Send className='w-4 h-4' />
								</button>
							</form>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
