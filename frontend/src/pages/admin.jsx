import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import '../css/admin.css';

import Log from '../components/log';

export default function Admin() {
	const [visibleTab, setVisibleTab] = useState(null);

	const currentTab = () => {
		switch (visibleTab) {
			case 'log':
				return <Log />;
			default:
				return null;
		}
	};

	return (
		<div className='w-full h-full'>
			<div className='w-full h-10 p-2 flex grid-cols-3 justify-center'>
				<div className='w-full h-full'></div>
				<div className='w-full h-full flex justify-center'>
					<p>Dashboard</p>
				</div>
				<div className='w-full h-full flex justify-end'>
					<Link to={'/login'}>
						<button className='bg-blue-500'>Log Out</button>
					</Link>
				</div>
			</div>

			<div className='w-full h-75 flex grid-cols-2'>
				<div className='w-1/10 h-full border-1 flex flex-col gap-y-2 p-2'>
					<div className='w-full h-auto'>
						<button onClick={() => setVisibleTab('log')} className='w-full bg-blue-500'>
							Log
						</button>
					</div>
					<div className='w-full h-auto'>
						<button onClick={() => setVisibleTab('room')} className='w-full bg-blue-500'>
							Room
						</button>
					</div>
				</div>
				<div className='w-9/10 h-full border-1'>{currentTab()}</div>
			</div>
		</div>
	);
}
