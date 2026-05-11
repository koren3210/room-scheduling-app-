import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../api/auth.js';

export default function SignUp() {
	const navigate = useNavigate();
	const [form, setForm] = useState({ name: '', email: '', password: '' });
	const mutation = useMutation(signUp, {
		onSuccess: () => navigate('/dashboard'),
	});

	const handleChange = event => {
		setForm({ ...form, [event.target.name]: event.target.value });
	};

	const handleSubmit = async event => {
		event.preventDefault();
		mutation.mutate({
			name: form.name,
			email: form.email,
			password: form.password,
		});
	};

	return (
		<section className='page-panel page-center'>
			<div className='auth-card'>
				<div>
					<span className='eyebrow'>Create account</span>
					<h1>Start reserving meeting spaces</h1>
					<p className='copy-light'>
						Register and manage bookings for your Siemens workspace with an optimized mobile-friendly interface.
					</p>
				</div>
				<form onSubmit={handleSubmit} className='form-stack'>
					<label className='form-field'>
						<span>Your name</span>
						<input
							type='text'
							name='name'
							value={form.name}
							onChange={handleChange}
							placeholder='Mira Johannsen'
							required
							className='input-field'
						/>
					</label>
					<label className='form-field'>
						<span>Email address</span>
						<input
							type='email'
							name='email'
							value={form.email}
							onChange={handleChange}
							placeholder='you@example.com'
							required
							className='input-field'
						/>
					</label>
					<label className='form-field'>
						<span>Password</span>
						<input
							type='password'
							name='password'
							value={form.password}
							onChange={handleChange}
							placeholder='Create a password'
							required
							className='input-field'
						/>
					</label>
					{mutation.isError && <div className='form-error'>{mutation.error.message}</div>}
					<button type='submit' className='button primary' disabled={mutation.isLoading}>
						{mutation.isLoading ? 'Creating account…' : 'Sign up'}
					</button>
				</form>
				<p className='form-caption'>
					Already registered? <Link to='/signin'>Sign in instead</Link>
				</p>
			</div>
		</section>
	);
}
