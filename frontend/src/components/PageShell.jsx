import { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader.jsx';

export default function PageShell({ title, subtitle, children }) {
	const [themeDark, setThemeDark] = useState(() => document.documentElement.classList.contains('dark'));

	useEffect(() => {
		document.documentElement.classList.toggle('dark', themeDark);
		document.body.classList.toggle('dark', themeDark);
	}, [themeDark]);

	return (
		<div className='min-h-full flex flex-col'>
			<DashboardHeader
				title={title}
				subtitle={subtitle}
				themeDark={themeDark}
				onToggleTheme={() => setThemeDark(v => !v)}
			/>
			<div className='flex-1 px-6 lg:px-10 pb-8'>
				{children}
			</div>
		</div>
	);
}
