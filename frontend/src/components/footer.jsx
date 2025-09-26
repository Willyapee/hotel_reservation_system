import React from 'react';
import { Link } from 'react-router-dom';

import '../css/footer.css';

export default function Footer() {
	return (
		<div className='w-full h-fit flex flex-col gap-y-4 p-4 bg-[#102E50]'>
			<div className='w-full flex gap-x-3 text-2xl '>
				<Link>
					<i className='fa-brands fa-instagram' id='instagram'></i>
				</Link>
				<Link>
					<i className='fa-brands fa-facebook ' id='facebook'></i>
				</Link>
				<Link>
					<i className='fa-brands fa-twitter ' id='twitter'></i>
				</Link>
			</div>
			<div className='w-full h-fit text-white'>
				<p>Work With Us</p>
				<p>Contact Us</p>
				<p>Privacy Policy</p>
				<p>© 2025 Nyx Hotel | All Rights Reserved</p>
			</div>
		</div>
	);
}
