import { useState, ChangeEvent, FormEvent, type JSX } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../api/auth';

interface FormData {
	email: string;
	password: string;
}

interface AuthData {
	token: string;
	user: any;
}

export default function SignIn(): JSX.Element {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [form, setForm] = useState<FormData>({ email: '', password: '' });
	const mutation = useMutation({
		mutationFn: loginUser,
		onSuccess: (data: AuthData) => {
			login(data.token, data.user);
			navigate('/dashboard');
		},
	});

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [event.target.name]: event.target.value });
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		mutation.mutate({ email: form.email, password: form.password });
	};

	return (
		<section className='page-panel page-center'>
			<div className='auth-card'>
				<div>
					<span className='eyebrow'>Welcome back</span>
					<h1>Sign in to SiemensBooking</h1>
					<p className='copy-light'>Access your bookings, room details, and team scheduling tools.</p>
				</div>
				<form onSubmit={handleSubmit} className='form-stack'>
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
							placeholder='Enter your password'
							required
							className='input-field'
						/>
					</label>
					{mutation.isError && <div className='form-error'>{(mutation.error as Error).message}</div>}
					<button type='submit' className='button primary' disabled={mutation.isPending}>
						{mutation.isPending ? 'Signing in…' : 'Sign in'}
					</button>
				</form>
				<p className='form-caption'>
					New to SiemensBooking? <Link to='/signup'>Create an account</Link>
				</p>
			</div>
		</section>
	);
}
