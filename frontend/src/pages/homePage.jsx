import '../css/homePage.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import NavigationBar from '../components/navigationBar.jsx';
import RoomDisplay from '../components/roomDisplay.jsx';
import Carousel from '../components/carousel.jsx';
import Footer from '../components/footer.jsx';

import PlaceHolder from '../../public/picture/placeHolder.png';

export default function HomePage() {
	const [openMenu, setOpenMenu] = useState(false);
	const handleOpenMenu = () => {
		setOpenMenu(!openMenu);
	};

	return (
		<div className='w-[100%] h-[100%] overflow-x-hidden'>
				<NavigationBar openMenu={openMenu} handleOpenMenu={handleOpenMenu} />


			<div className='w-full h-screen relative overflow-hidden -z-1'>
				<video
					src='https://lvmh-chevalblanc.cdn.prismic.io/lvmh-chevalblanc/aCcrMCdWJ-7kSN-l_PaysageCBO.mp4'
					className='h-full w-full object-cover'
					autoPlay
					loop
					muted
					playsInline></video>
			</div>

			<section id="rooms" className="bg-[#fbfaf9] font-serif px-0 py-[72px]">
				<div>
					<h2 className="text-center text-[32px] mb-[10px] text-[#333]">Rooms & Suites</h2>
					<h3 className="text-center text-[18px] mb-[40px] text-[#666]">
						A range of accommodations from intimate suites to private penthouses. Each room carefully
            			designed for comfort and alpine views.
					</h3>
					<BoxDisplay />
				</div>
			</section>

			<RoomDisplay/>

			<div id='dine' className='px-8 py-16 h-96 p-20'>
				<div className='text-center mb-10'>
					<h2 className='text-3xl font-bold text-gray-600 mb-4'>Dine With Us</h2>
					<h3 className='text-lg text-gray-400 mb-10'>
						Experience culinary excellence at our on-site restaurants and bars, offering a variety
						of gourmet dishes and drinks.
					</h3>
				</div>
				<Carousel />
			</div>

			<Footer />
		</div>
	);
}
