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
		<div className='w-full h-full'>
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

			<div className='w-full h-fit my-20 px-20 flex flex-col gap-y-10 justify-center text-center'>
				<p className='text-3xl'>Lorem Ipsum</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu sapien nec dolor iaculis
					ornare. Nullam tristique at libero eget accumsan. Suspendisse potenti. Phasellus ut ex ac
					orci egestas imperdiet non a felis. Nullam a urna at nunc blandit ornare. Curabitur
					vehicula leo a arcu lacinia, eu porttitor felis porttitor.
				</p>
			</div>

			<RoomDisplay />

			<Carousel />

			<Footer />
		</div>
	);
}
