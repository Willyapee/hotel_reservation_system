import '../css/homePage.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import NavigationBar from '../components/navigationBar.jsx';
import CardSliderHorizontal from '../components/cardSliderHorizontal.jsx';

import PlaceHolder from '../../public/picture/placeHolder.png';

export default function HomePage() {
	const [openMenu, setOpenMenu] = useState(false);
	const handleOpenMenu = () => {
		setOpenMenu(!openMenu);
	};

	return (
		<div className='w-full h-full'>
			<div className='fixed z-1 bg-blend-inherit '>
				<NavigationBar openMenu={openMenu} handleOpenMenu={handleOpenMenu} />
			</div>

			<div className='w-full h-screen relative overflow-hidden -z-1'>
				<video
					src='https://lvmh-chevalblanc.cdn.prismic.io/lvmh-chevalblanc/aCcrMCdWJ-7kSN-l_PaysageCBO.mp4'
					class='h-full w-full object-cover'
					autoPlay
					loop
					muted
					playsInline></video>

				<div className='w-full h-full z-1'>
					<div className='w-full h-4/20 flex justify-center'>
						<p className='flex items-end gap-x-1'>
							Sapphire
							<img className='h-15' src={PlaceHolder} />
							Grandeur
						</p>
					</div>

					<div className='w-full h-15/20 flex justify-center items-end'>
						<div>
							<p>Lorem Ipsum</p>
							<p>Lorem Ipsum</p>

							<div className='flex gap-x-10 justify-center'>
								<button>Book</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className='w-full h-full my-20 px-20 flex flex-col gap-y-10 justify-center text-center'>
				<p className='text-3xl'>Lorem Ipsum</p>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu sapien nec dolor iaculis
					ornare. Nullam tristique at libero eget accumsan. Suspendisse potenti. Phasellus ut ex ac
					orci egestas imperdiet non a felis. Nullam a urna at nunc blandit ornare. Curabitur
					vehicula leo a arcu lacinia, eu porttitor felis porttitor.
				</p>
			</div>

			<CardSliderHorizontal/>
		</div>
	);
}
