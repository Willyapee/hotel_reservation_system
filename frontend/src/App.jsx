import './App.css';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';


import HomePage from './pages/homePage.jsx';
import MenuPage from './pages/menuPage.jsx';
import Register from './pages/register.jsx';
import Login from './pages/Login.jsx';
import NavigationBar from './components/navigationBar.jsx';


function App() {

	return (
		<>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/menu' element={<MenuPage />} />
				<Route path='/register' element={<Register />} />
				<Route path='/login' element={<Login />} />
			
			</Routes>
		</>
	);
}

export default App;
