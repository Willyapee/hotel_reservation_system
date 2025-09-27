import React, { useState } from 'react';
import Cards from '../../../backend/data/dineList.json';

import '../css/carousel.css';

export default function Carousel() {
	const [active, setActive] = useState(2);
	const [cards, setCards] = useState(Cards);

	return (
		<div className='transform-3d justify-self-center relative w-100 h-[30rem] perspective-[1000px] select-none'>
			{active > 1 && (
				<button
					className='nav left text-3xl absolute flex items-center justify-center align-middle
          top-1/2 -translate-y-1/2 z-10 cursor-pointer select-none left-[-3rem] '
					onClick={() => setActive(active - 1)}>
					&#x25C0;
				</button>
			)}
			{cards.map((item) => (
				<div
					key={item.dineId}
					className='card-container absolute w-full h-100 transition-all duration-300 ease-out mt-[2rem]'
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
							className='w-full h-60 object-cover rounded-xl mb-4'
						/>
						<h4 className='text-lg font-bold mb-2 text-center'>{item.title}</h4>
						<p className='text-sm text-gray-600 text-center'>{item.content}</p>
						{item.description && (
							<p className='text-gray-400 text-center mt-2'>{item.description}</p>
						)}
					</div>
				</div>
			))}
			{active < cards.length && (
				<button
					className='nav right flex items-center justify-center text-gray-200 text-3xl absolute 
  top-1/2 -translate-y-1/2 z-10 cursor-pointer select-none right-[-3rem]'
					onClick={() => setActive(active + 1)}>
					&#x25B6;
				</button>
			)}
		</div>
	);
}
