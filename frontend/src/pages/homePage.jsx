import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import NavigationBar from '../components/navigationBar.jsx';
import Introduction from '../components/introduction.jsx';
import RoomDisplay from '../components/roomDisplay.jsx';
import Carousel from '../components/carousel.jsx';
import Facility from '../components/facility.jsx';
import InfiniteScrollText from '../components/infiniteScrollText.jsx';
import Parallax from '../components/parralax.jsx';
import Footer from '../components/footer.jsx';
import MenuOverlay from '../components/menuOverlay.jsx';

export default function HomePage() {
	const [openMenu, setOpenMenu] = useState(false);
	const [showFloating, setShowFloating] = useState(true);
	const navigate = useNavigate(); 

	const handleOpenMenu = () => setOpenMenu(!openMenu);
	const handleCloseMenu = () => setOpenMenu(false);

	const handleNavigateToSection = (sectionId) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	};

	useEffect(() => {
		document.documentElement.style.overflow = 'hidden';
		document.body.style.overflow = 'hidden';

		const handleScroll = () => {
			const footer = document.querySelector("footer");
			if (footer) {
			const footerTop = footer.getBoundingClientRect().top;
			const windowHeight = window.innerHeight;
			setShowFloating(footerTop > windowHeight);
			}
		};

		window.addEventListener("scroll", handleScroll);
		
		const handleUserLogin = () => {
			console.log('User logged in event received');
		};
		
		window.addEventListener('userLoggedIn', handleUserLogin);
		
		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener('userLoggedIn', handleUserLogin);
			document.documentElement.style.overflow = 'auto';
			document.body.style.overflow = 'auto';
		};
		}, []);

	const handleBookNow = async () => {
		try {
			console.log('🔐 Checking authentication for booking...');
			
			// const response = await fetch('http://localhost:3000/auth/check', {
			const response = await fetch('http://148.230.99.149/auth/check', {
			method: 'GET',
			credentials: 'include', 
			headers: {
				'Content-Type': 'application/json'
			}
			});

			console.log('Auth check response status:', response.status);
			
			const data = await response.json();
			console.log('Auth check response:', data);

			if (response.ok && data.authenticated) {
			navigate('/booking');
			} else {
			navigate('/login', {
				state: {
				redirectTo: '/booking',
				message: 'Please login to book rooms'
				}
			});
			}
		} catch (error) {
			console.error('Auth check error:', error);
			navigate('/login', {
			state: {
				redirectTo: '/booking',
				message: 'Authentication error. Please try again.'
			}
			});
		}
	};

	useEffect(() => {
		document.documentElement.style.overflow = 'hidden';
		document.body.style.overflow = 'hidden';

		const handleScroll = () => {
			const footer = document.querySelector("footer");
			if (footer) {
				const footerTop = footer.getBoundingClientRect().top;
				const windowHeight = window.innerHeight;
				setShowFloating(footerTop > windowHeight);
			}
		};

		window.addEventListener("scroll", handleScroll);
		
		return () => {
			window.removeEventListener("scroll", handleScroll);
			document.documentElement.style.overflow = 'auto';
			document.body.style.overflow = 'auto';
		};
	}, []);

	return (
		<div className="w-full h-screen overflow-hidden">
			<NavigationBar openMenu={openMenu} handleOpenMenu={handleOpenMenu} />
			
			{/* Menu Overlay */}
			<MenuOverlay 
				isOpen={openMenu} 
				onClose={handleCloseMenu}
				onNavigate={handleNavigateToSection}
			/>

			{/* Scrollable content container */}
			<div className="h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
				<section id="introduction">
					<Introduction />
				</section>
				
				<section className="w-full bg-[#fbfaf9] py-16">
					<div className="w-[90%] h-[35rem] relative overflow-hidden justify-center items-center mx-auto rounded-xl shadow-lg">
						<video
							src="/video/ChevalBlanc.mp4"
							className="h-full w-full object-cover"
							autoPlay
							loop
							muted
							playsInline
						></video>
					</div>
				</section>

				<section id="facilities">
					<Facility />
				</section>

				<InfiniteScrollText />
				
				<section id="rooms" className="bg-[#fbfaf9] px-0 py-20">
					<h2 className="text-center text-4xl font-bold text-[#333] mb-4">
						Rooms & Suites
					</h2>
					<h3 className="text-center text-xl text-[#666] mb-10">
						A range of accommodations from intimate suites to private penthouses.
						Each room carefully designed for comfort and alpine views.
					</h3>
					<RoomDisplay />
				</section>

				<div id="dine" className="px-8 py-20 bg-[#fbfaf9]">
					<div className="text-center mb-8">
						<h2 className="text-4xl font-bold text-[#333] mb-4">Dine With Us</h2>
						<h3 className="text-xl text-[#666]">
							Experience culinary excellence at our on-site restaurants and bars,
							offering a variety of gourmet dishes and drinks.
						</h3>
					</div>
					<Carousel />
				</div>

				<Parallax />

				<Footer />
			</div>

			{showFloating && (
				<div className="fixed bottom-6 right-6 z-30">
					{/*handleBookNow */}
					<button
						onClick={handleBookNow}
						className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-full shadow-lg transition-colors duration-300 flex items-center gap-2"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						Book Now
					</button>
					
				</div>
			)}
		</div>
	);
}