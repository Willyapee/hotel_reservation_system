import React, { useState, useEffect } from 'react';

import RoomList from '../../../backend/data/roomList.json';

export default function CardSliderHorizontal() {
	const [room, setRoom] = useState(RoomList);
	return (
		<div className='w-full h-full my-20 flex flex-wrap justify-center gap-5 px-10'>
			{room.map((item) => (
				<div
					className='bg-white rounded-xl overflow-hidden shadow-[0px_10px_20px_-10px_#333]'
					key={item.roomId}>
					<img className='h-50 w-80 ' src={item.roomImage} />
					<p>{item.roomDesc}</p>
				</div>
			))}
		</div>
	);
}
