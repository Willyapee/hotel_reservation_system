import React, { useState, useEffect } from 'react';
import axios from 'axios';

import '../css/log.css';

export default function Log() {
	const [users, setUsers] = useState([]);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await axios.get('http://localhost:3000/users/allusers');
				setUsers(res.data);
			} catch (err) {
				console.log('Error fetching users:', err);
			}
		};
		fetchUser();
	}, []);

	return (
		<div className='w-full h-full p-6 flex flex-col'>

			<div className='flex-1 overflow-y-auto'>
				<div className='grid grid-cols-4 font-semibold p-3 sticky'>
					<div>No</div>
					<div>Username</div>
					<div>Email</div>
					<div>Created At</div>
				</div>

				{users.map((user, index) => (
					<div
						key={user.id_user}
						className='grid grid-cols-4 items-center p-3'>
						<div>{index + 1}</div>
						<div>{user.username}</div>
						<div>{user.email}</div>
						<div>{new Date(user.createdAt).toLocaleString()}</div>
					</div>
				))}

				{users.length === 0 && <div className='text-center p-4'>No users found.</div>}
			</div>
		</div>
	);
}
