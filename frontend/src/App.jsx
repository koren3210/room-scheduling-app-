import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext.tsx';
import MainRoutes from './routes/MainRoutes';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<BrowserRouter>
					<MainRoutes />
				</BrowserRouter>
				<ToastContainer position='top-right' autoClose={2800} newestOnTop closeOnClick pauseOnHover />
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default App;
