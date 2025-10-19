import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function PrivateRoute({ children, role }) {
	const token = localStorage.getItem('token');

	// Jika belum login → redirect ke login
	if (!token) return <Navigate to='/login' replace />;

	try {
		const decoded = jwtDecode(token);

		// Jika role admin diharuskan dan user bukan admin → tolak
		if (role && decoded.role !== role) {
			return <Navigate to='/' replace />;
		}

		return children; // akses diizinkan
	} catch {
		// Token rusak / expired → paksa login ulang
		localStorage.removeItem('token');
		localStorage.removeItem('role');
		return <Navigate to='/login' replace />;
	}
}
