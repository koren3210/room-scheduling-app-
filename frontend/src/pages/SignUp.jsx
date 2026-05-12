import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

function fileToDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ''));
		reader.onerror = () => reject(new Error('Failed to read image file.'));
		reader.readAsDataURL(file);
	});
}

export default function SignUp() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [form, setForm] = useState({ name: '', email: '', password: '' });
	const [avatarUrl, setAvatarUrl] = useState('');
	const [avatarError, setAvatarError] = useState('');
	const mutation = useMutation({
		mutationFn: signUp,
		onSuccess: data => {
			login(data.token, data.user);
			navigate('/dashboard');
		},
	});

	const handleChange = event => {
		setForm({ ...form, [event.target.name]: event.target.value });
	};

	const handleAvatarChange = async event => {
		const file = event.target.files?.[0];
		if (!file) {
			setAvatarUrl('');
			setAvatarError('');
			return;
		}

		if (!file.type.startsWith('image/')) {
			setAvatarError('Please choose an image file.');
			setAvatarUrl('');
			return;
		}

		setAvatarError('');
		try {
			const dataUrl = await fileToDataUrl(file);
			setAvatarUrl(dataUrl);
		} catch (error) {
			setAvatarError(error?.message || 'Unable to process selected image.');
			setAvatarUrl('');
		}
	};

	const handleSubmit = async event => {
		event.preventDefault();
		mutation.mutate({
			name: form.name,
			email: form.email,
			password: form.password,
			avatarUrl: avatarUrl || undefined,
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
						<span>Profile image (optional)</span>
						<input type='file' accept='image/*' onChange={handleAvatarChange} className='input-field' />
					</label>
					{avatarUrl && (
						<div className='flex items-center gap-3'>
							<img
								src={avatarUrl}
								alt='Avatar preview'
								className='w-14 h-14 rounded-full object-cover border border-slate-200'
							/>
							<p className='text-xs text-slate-500'>Preview</p>
						</div>
					)}
					{avatarError && <div className='form-error'>{avatarError}</div>}
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
					<button type='submit' className='button primary' disabled={mutation.isPending}>
						{mutation.isPending ? 'Creating account…' : 'Sign up'}
					</button>
				</form>
				<p className='form-caption'>
					Already registered? <Link to='/signin'>Sign in instead</Link>
				</p>
			</div>
		</section>
	);
}
