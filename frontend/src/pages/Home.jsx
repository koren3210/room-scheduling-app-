import { Link } from 'react-router-dom';

export default function Home() {
	return (
		<section className='page-panel'>
			<div className='hero-card'>
				<div>
					<span className='eyebrow'>Workspace Scheduler</span>
					<h1>Plan meetings, reserve rooms, and manage bookings with ease.</h1>
					<p className='copy-light'>
						A mobile-first operations dashboard built for modern workplace planning. Sign in or register to get started with
						SiemensBooking.
					</p>
					<div className='hero-actions'>
						<Link className='button primary' to='/signup'>
							Create an account
						</Link>
						<Link className='button secondary' to='/signin'>
							Sign in
						</Link>
					</div>
				</div>
				<div className='hero-preview'>
					<div className='metrics-card'>
						<span className='metric-label'>Next available room</span>
						<strong>Executive Boardroom</strong>
						<p>Wing D · 14 seats · Video Conferencing</p>
					</div>
					<div className='feature-pill-grid'>
						<span className='pill'>AI suggestions</span>
						<span className='pill'>Room matching</span>
						<span className='pill'>Calendar sync</span>
						<span className='pill'>Mobile-ready</span>
					</div>
				</div>
			</div>

			<div className='section-grid'>
				<article className='feature-card'>
					<h2>Fast booking workflows</h2>
					<p>Search by wing, capacity, amenities and get the best available room for your team.</p>
				</article>
				<article className='feature-card'>
					<h2>User profiles with avatars</h2>
					<p>Every account supports a profile avatar and preferences for faster bookings.</p>
				</article>
				<article className='feature-card'>
					<h2>Secure auth routes</h2>
					<p>Sign in securely and keep booking details private with server-driven auth endpoints.</p>
				</article>
			</div>
		</section>
	);
}
