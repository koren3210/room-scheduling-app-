import { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';

export default function AIChatPanel({ messages, onSendMessage, onOpenMobileChat, mobileOpen, onCloseMobileChat }) {
	const [input, setInput] = useState('');

	const handleSubmit = event => {
		event.preventDefault();
		if (!input.trim()) return;
		onSendMessage(input.trim());
		setInput('');
	};

	return (
		<>
			<div
				className='lg:hidden w-full glass rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-xl active:scale-[0.98] transition-all mb-8 border-none cursor-pointer'
				onClick={onOpenMobileChat}
			>
				<div className='w-16 h-16 rounded-2xl bg-siemens-petrol flex items-center justify-center mb-5 shadow-lg'>
					<Bot className='text-white w-8 h-8' />
				</div>
				<h3 className='text-2xl font-black mb-2 text-slate-900 dark:text-white'>Workspace AI</h3>
				<p className='text-slate-500 text-sm mb-6'>Ask to find rooms or draft invites.</p>
				<span className='px-8 py-3 bg-siemens-petrol text-white rounded-full text-xs font-bold uppercase tracking-widest'>
					Launch Console
				</span>
			</div>

			<section className='hidden lg:flex flex-col lg:col-span-7 xl:col-span-8 group glass lg:rounded-[2rem] overflow-hidden lg:shadow-xl lg:h-[600px] border border-black/5 dark:border-white/5 shrink-0 bg-white/40 dark:bg-gray-900/40'>
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

				<div className='chat-history flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar scroll-smooth'>
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
								className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-sm bg-siemens-petrol text-white' : 'rounded-bl-sm bg-white dark:bg-[#1A2227] border border-black/5 dark:border-white/5 text-slate-800 dark:text-gray-200 shadow-sm'}`}
							>
								{message.text}
							</div>
							{message.role === 'user' && (
								<div className='w-8 h-8 rounded-full bg-brand-500/10 shrink-0 shadow-sm ml-3 border border-white/20 flex items-center justify-center overflow-hidden'>
									<Bot className='w-4 h-4 text-brand-500' />
								</div>
							)}
						</div>
					))}
				</div>

				<div className='p-5 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shrink-0'>
					<div className='flex space-x-2 overflow-x-auto custom-scrollbar pb-3 mb-2 w-full snap-x'>
						{['Find a room in Wing B for 4', 'Need a room with a Whiteboard', 'Create a booking for 10 people'].map(
							prompt => (
								<button
									key={prompt}
									type='button'
									onClick={() => onSendMessage(prompt)}
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
							type='text'
							className='chat-input w-full bg-white dark:bg-[#0f151a] border border-black/5 dark:border-white/5 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-siemens-petrol focus:ring-1 focus:ring-siemens-petrol shadow-sm text-sm text-slate-900 dark:text-white transition-all'
							placeholder='Ask for a room...'
						/>
						<button
							type='submit'
							className='absolute right-1.5 top-1.5 w-9 h-9 bg-siemens-petrol text-white rounded-lg flex items-center justify-center transition-all hover:bg-siemens-glow active:scale-95'
						>
							<Send className='w-4 h-4' />
						</button>
					</form>
				</div>
			</section>

			{mobileOpen && (
				<div className='fixed inset-0 z-40 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'>
					<div className='p-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/90 dark:bg-[#0B1114]/90 backdrop-blur-xl'>
						<div className='flex items-center space-x-3'>
							<div className='w-8 h-8 rounded-lg bg-siemens-petrol flex items-center justify-center shadow-sm'>
								<Bot className='w-4 h-4 text-white' />
							</div>
							<div>
								<h2 className='font-bold text-base text-slate-900 dark:text-white leading-none'>SmartSpace AI</h2>
								<p className='text-[9px] font-bold text-siemens-petrol uppercase tracking-widest mt-1'>Active Sensor Link</p>
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

					<div className='flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth custom-scrollbar'>
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
									{message.text}
								</div>
							</div>
						))}
					</div>

					<div className='p-3 border-t border-black/5 dark:border-white/5 bg-white/90 dark:bg-[#0B1114]/90 backdrop-blur-xl'>
						<form onSubmit={handleSubmit} className='relative'>
							<input
								value={input}
								onChange={event => setInput(event.target.value)}
								type='text'
								className='w-full bg-white dark:bg-[#0f151a] border border-black/5 dark:border-white/5 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-siemens-petrol focus:ring-1 focus:ring-siemens-petrol text-sm text-slate-900 dark:text-white'
								placeholder='Ask for a room...'
							/>
							<button
								type='submit'
								className='absolute right-1.5 top-1.5 w-9 h-9 bg-siemens-petrol text-white rounded-lg flex items-center justify-center active:scale-95'
							>
								<Send className='w-4 h-4' />
							</button>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
