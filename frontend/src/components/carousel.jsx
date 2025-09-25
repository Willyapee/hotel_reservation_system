import React, { useState } from 'react';
import Cards from '../../../backend/data/dineList.json';

import '../css/carousel.css';

export default function Carousel() {
	const [active, setActive] = useState(2);
	const [cards, setCards] = useState(Cards);

	return (
		<div className='transform-3d justify-self-center relative w-80 h-[20rem] mx-auto perspective-[1000px]'>
			{active > 0 && (
				<button
					className='nav left text-gray-200 text-5xl absolute flex items-center justify-center 
          top-1/2 -translate-y-1/2 z-10 cursor-pointer select-none'
					onClick={() => setActive(active - 1)}>
					&lt;
				</button>
			)}
			{cards.map(item => (
				<div
					key={item.dineId}
					className='card-container absolute w-full h-[18rem] transition-all duration-300 ease-out mt-[2rem]'
					style={{
						'--active': item.dineId === active ? 1 : 0,
						'--offset': (active - item.dineId) / 3,
						'--direction': Math.sign(active - item.dineId),
						'--abs-offset': Math.abs(active - item.dineId),
						opacity: Math.abs(active - item.dineId) >= 3 ? '0' : '1',
						display: Math.abs(active - item.dineId) > 3 ? 'none' : 'block',
					}}>
					<div className='item w-full h-full p-4 rounded-2xl text-gray-700 text-justify shadow-lg bg-white flex flex-col items-center'>
						<img
							src={item.img}
							alt={item.title}
							className='w-full h-40 object-cover rounded-xl mb-4'
						/>
						<h4 className='text-lg font-bold mb-2 text-center mt-[20px]'>{item.title}</h4>
						<p className='text-sm text-gray-600 text-center'>{item.content}</p>
						{item.description && (
							<p className='text-xs text-gray-400 text-center mt-2'>{item.description}</p>
						)}
					</div>
				</div>
			))}
			{active < cards.length && (
				<button
					className='nav right text-gray-200 text-5xl absolute flex items-center justify-center 
          top-1/2 -translate-y-1/2 z-10 cursor-pointer select-none right-2'
					onClick={() => setActive(active + 1)}>
					&gt;
				</button>
			)}
		</div>
	);
}
