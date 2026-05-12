import { useRoutes } from 'react-router-dom';
import { useGenerateRoutes } from './useGenerateRoutes';

export default function MainRoutes() {
	const routes = useGenerateRoutes();
	return useRoutes(routes);
}
