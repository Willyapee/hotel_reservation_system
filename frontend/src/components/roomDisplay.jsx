import React, { useState, useEffect } from 'react';

import '../css/roomDisplay.css';

import RoomList from '../../../backend/data/roomList.json';

export default function RoomDisplay() {
	const [room, setRoom] = useState(RoomList);

	return (
		<div className='w-full h-fit flex justify-center gap-x-10 px-10 '>
			{room.map((item) => (
				<div key={item.roomId} className='w-auto h-fit bg-white shadow-2xl rounded-xl'>
					<div className='w-full h-fit'>
						<img src={item.roomImage} className='w-100 h-50 rounded-t-xl' />
					</div>
					<div className='p-5'>
						<p>{item.roomDesc}</p>
					</div>
				</div>
			))}
		</div>
	);
}
