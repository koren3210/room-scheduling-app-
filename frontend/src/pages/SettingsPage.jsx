import PageShell from '../components/PageShell.jsx';
import SettingsSection from '../components/SettingsSection.jsx';

export default function SettingsPage() {
	return (
		<PageShell title='Settings' subtitle='App preferences and integrations'>
			<div className='max-w-xl'>
				<SettingsSection />
			</div>
		</PageShell>
	);
}
