import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import HomePage from './pages/homePage.jsx';
import MenuPage from './pages/menuPage.jsx';
import NavigationBar from './components/navigationBar.jsx';


function App() {
	

	return (
		<>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/menu' element={<MenuPage />} />
			</Routes>
		</>
	);
}

export default App;
