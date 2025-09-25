import '../css/navigationBar.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import PlaceHolder from '../../public/picture/placeHolder.png';

import NavigationBar from '../components/navigationBar.jsx';

export default function MenuPage() {
	const [openMenu, setOpenMenu] = useState(true);
	const handleOpenMenu = () => {
		setOpenMenu(!openMenu);
	};

	return (
		<div>
			<NavigationBar openMenu={openMenu} handleOpenMenu={handleOpenMenu} />
		</div>
	);
}
