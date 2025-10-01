import React from 'react';
import { Link } from 'react-router-dom';

import '../css/footer.css';

export default function Footer() {
	return (
		<div className='w-full h-fit flex flex-col gap-y-2 p-4 bg-[#102E50] items-center text-center'>
			<div className='flex gap-x-6 text-2xl'>
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

			<div className='flex gap-x-6 gap-y-2 flex-wrap justify-center text-gray-300'>
				<button>Work With Us</button>
				<button>Contact Us</button>
				<button>Privacy Policy</button>
			</div>

			<p className='text-gray-300'>© 2025 Nyx Hotel | All Rights Reserved</p>
		</div>
	);
}
