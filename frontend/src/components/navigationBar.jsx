import '../css/navigationBar.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import PlaceHolder from '../../public/picture/placeHolder.png';

export default function NavigationBar({ openMenu, handleOpenMenu }) {
	
	return (
		<div className='bg-[#102E50]'>
			<div className='w-screen h-15 p-8 gap-x-4 text-lg flex items-center'>
				<img src='../picture/logo/logo.png' className='w-13 h-fit' />

				<Link to={openMenu ? '/' : '/menu'}>
					<button onClick={handleOpenMenu} className='gap-x-5 flex items-center text-white'>
						<span>{openMenu ? '✕' : '☰'}</span>
						<p className='text-sm text-white'>Menu</p>
					</button>
				</Link>
			</div>
		</div>
	);
}
