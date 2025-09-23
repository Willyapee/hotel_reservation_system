import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const URL = 'http://localhost:5000/reservation';

export default function Reservations() {
	const [reservations, setReservations] = useState([]);
	const [guestName, setGuestName] = useState('');
	const [checkIn, setCheckIn] = useState('');
	const [checkOut, setCheckOut] = useState('');
	const [roomType, setRoomType] = useState('Standard');

	useEffect(() => {
		const fetchReservations = async () => {
			const response = await axios.get(URL);
			setReservations(response.data);
		};
		fetchReservations();
	}, []);

	const createReservations = async (e) => {
		e.preventDefault();
		const newReservation = {
			guestName,
			checkInDate: checkIn,
			checkOutDate: checkOut,
			roomType,
		};

		try {
			await axios.post(URL, newReservation);
			const response = await axios.get(URL);
			setReservations(response.data);

			setGuestName('');
			setCheckIn('');
			setCheckOut('');
			setRoomType('Standard');
		} catch (error) {
			console.error('Gagal membuat reservasi:', error);
			alert('Gagal menyimpan reservasi. Silakan coba lagi.');
		}
	};

	return (
		<div>
			<form onSubmit={createReservations} className="">
				<div>
					<input
						type="text"
						value={guestName}
						onChange={(e) => setGuestName(e.target.value)}
						placeholder="Guest Name"
						required
					></input>
				</div>
				<div>
					<input
						type="date"
						value={checkIn}
						onChange={(e) => setCheckIn(e.target.value)}
						className="p-2 border rounded"
						required
					/>
				</div>
				<div>
					<input
						type="date"
						value={checkOut}
						onChange={(e) => setCheckOut(e.target.value)}
						className="p-2 border rounded"
						required
					/>
				</div>
				<div>
					<select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
						<option value="Standard">Standard</option>
						<option value="Deluxe">Deluxe</option>
						<option value="Suite">Suite</option>
					</select>
				</div>

				<div>
					<button type="submit">Book</button>
				</div>

				<div className="reservationsList">
					<h2>Current Reservations</h2>
					{reservations.length > 0 ? (
						reservations.map((res) => (
							<div key={res.id || res.guestName}>
								<p>
									<strong>{res.guestName}</strong> {res.roomType}
									<br />
									Check In: {new Date(res.checkInDate).toLocaleDateString()}
									<br />
									Check Out: {new Date(res.checkOutDate).toLocaleDateString()}
								</p>
							</div>
						))
					) : (
						<p>No Reservation yet.</p>
					)}
				</div>
			</form>
		</div>
	);
}
