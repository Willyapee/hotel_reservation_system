import React, { useState, useEffect, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
	Edit2,
	Save,
	X,
	Camera,
	Bell,
	Shield,
	CreditCard,
	Heart,
	History,
	LogOut,
	ArrowLeft,
} from 'lucide-react';

const Profile = () => {
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const [activeTab, setActiveTab] = useState('profile');
	const [loading, setLoading] = useState(true);
	const [openMenu, setOpenMenu] = useState(false); 

	const [user, setUser] = useState({
		name: '',
		email: '',
		joinDate: '',
		avatar: '../picture/logo/logoNoBG.png',
	});

	const [bookings, setBookings] = useState([]);

	const [formData, setFormData] = useState({ ...user });

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			
			try {
				console.log('🔐 Checking authentication for profile...');
				
				const authResponse = await fetch('http://localhost:3000/auth/check', {
					credentials: 'include'
				});
				
				const authData = await authResponse.json();
				console.log('Profile auth check:', authData);
				
				if (!authResponse.ok || !authData.authenticated) {
					console.log('❌ Not authenticated, redirecting to login');
					navigate('/login', {
						state: {
							redirectTo: '/profile',
							message: 'Please login to view your profile'
						}
					});
					return;
				}
				
				console.log('✅ User authenticated, fetching profile data');
				
				const userRes = await fetch('http://localhost:3000/auth/me', {
					credentials: 'include'
				});
				
				const userData = await userRes.json();
				console.log('User data:', userData);
				
				if (userRes.ok && userData.success) {
					const formattedUser = {
						id: userData.user.id,
						name: userData.user.username,
						email: userData.user.email,
						joinDate: new Date().toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						}),
						avatar: '../picture/logo/logoNoBG.png',
					};
					
					setUser(formattedUser);
					setFormData(formattedUser);
					
					localStorage.setItem('user', JSON.stringify({
						name: userData.user.username,
						initials: userData.user.username.split(' ').map(n => n[0]).join('').toUpperCase(),
						isLoggedIn: true,
						role: userData.user.role || 'guest'
					}));
					
					try {
						const bookingRes = await fetch('http://localhost:3000/reservations/my', {
							credentials: 'include'
						});
						
						if (bookingRes.ok) {
							const bookingData = await bookingRes.json();
							if (bookingData.reservations) {
								setBookings(bookingData.reservations);
							}
						}
					} catch (bookingError) {
						console.warn('Could not load bookings:', bookingError);
					}
					
				} else {
					throw new Error(userData.message || 'Failed to load user data');
				}
				
			} catch (err) {
				console.error('❌ Error loading profile:', err);
				navigate('/login', {
					state: {
						redirectTo: '/profile',
						message: 'Session expired. Please login again.'
					}
				});
			} finally {
				setLoading(false);
			}
		};
		
		fetchData();
	}, [navigate]);

	const handleEditToggle = async () => {
		if (isEditing) {
        try {
            const response = await fetch(`http://localhost:3000/users/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.name, 
                    email: formData.email
                }),
            });

            if (response.ok) {
                const result = await response.json();
                
                setUser({ 
                    ...user, 
                    name: formData.name, 
                    email: formData.email 
                });

				const newInitials = formData.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase();

				window.dispatchEvent(new Event('userUpdated'));
                
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...storedUser,
                    name: formData.name
                }));

				localStorage.setItem('user', JSON.stringify({
                    ...storedUser,
                    name: formData.name,
                    initials: newInitials
                }));

                alert('✅ Profile updated successfully!');
                setIsEditing(false);
            } else {
                const errorData = await response.json();
                alert(`❌ Failed to update: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("❌ Server error when updating profile.");
        }
    } else {
        setIsEditing(true);
    }
	};

	const handleCancelEdit = () => {
		setFormData({ ...user });
		setIsEditing(false);
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSignOut = async () => {
		try {
			await fetch('http://localhost:3000/auth/logout', {
				method: 'POST',
				credentials: 'include'
			});
			
			localStorage.removeItem('user');
			
			navigate('/');
			window.location.reload();
		} catch (error) {
			console.error('Logout error:', error);
			localStorage.removeItem('user');
			
			navigate('/');
			window.location.reload();
		}
	};

	const ProfileInfo = () => (
		<div className='space-y-6'>
			<div className='text-center'>
				<div className='relative inline-block'>
					<img
						src={user.avatar}
						alt='Profile'
						className='w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto'
					/>
					<button className='absolute bottom-2 right-2 bg-[#c19a6b] text-white p-2 rounded-full hover:bg-[#a67c52] transition-colors'>
						<Camera className='w-4 h-4' />
					</button>
				</div>
				<h2 className='text-2xl font-bold text-gray-800 mt-4'>{user.name}</h2>
				<p className='text-gray-600 text-sm'>Member since {user.joinDate}</p>
			</div>

			{/* Profile Details */}
			<div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
				<div className='flex justify-between items-center mb-6'>
					<h3 className='text-xl font-semibold text-gray-800'>
						Personal Information - ONGOING DEVELOPMENT
					</h3>
					<button onClick={handleEditToggle} className='flex items-center gap-2 transition-colors'>
						{isEditing ? (
							<Save className='w-5 h-5 text-[#8f632d] ' />
						) : (
							<Edit2 className='w-5 h-5 text-[#8f632d] ' />
						)}
						<span className='text-[#8f632d] '>{isEditing ? 'Save' : 'Edit'}</span>
					</button>
				</div>

				<div className='space-y-4'>
					<div className='flex items-center gap-3'>
						<User className='w-5 h-5 text-gray-400' />
						<div className='flex-1'>
							<label className='block text-sm text-gray-600 mb-1'>Full Name</label>
							{isEditing ? (
								<input
									type='text'
									value={formData.name}
									onChange={(e) => handleInputChange('name', e.target.value)}
									className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent'
								/>
							) : (
								<p className='text-gray-800'>{user.name}</p>
							)}
						</div>
					</div>

					<div className='flex items-center gap-3'>
						<Mail className='w-5 h-5 text-gray-400' />
						<div className='flex-1'>
							<label className='block text-sm text-gray-600 mb-1'>Email</label>
							{isEditing ? (
								<input
									type='email'
									value={formData.email}
									onChange={(e) => handleInputChange('email', e.target.value)}
									className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent'
								/>
							) : (
								<p className='text-gray-800'>{user.email}</p>
							)}
						</div>
					</div>
				</div>

				{isEditing && (
					<div className='flex gap-3 mt-6'>
						<button
							onClick={handleEditToggle}
							className='flex-1 bg-[#c19a6b] text-white py-2 rounded-lg hover:bg-[#a67c52] transition-colors'>
							Save Changes
						</button>
						<button
							onClick={handleCancelEdit}
							className='flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors'>
							Cancel
						</button>
					</div>
				)}
			</div>

			<button
				onClick={handleSignOut}
				className='w-full bg-red-700 text-white py-3 rounded-lg hover:bg-red-800 transition-colors flex items-center justify-center gap-2'>
				<LogOut className='w-5 h-5' />
				Sign Out
			</button>
		</div>
	);

	const BookingHistory = () => (
		<div className='space-y-6'>
			<h3 className='text-xl font-semibold text-gray-800 mb-4'>Reservation History</h3>
			{bookings.length === 0 ? (
				<div className='text-center py-8 bg-gray-50 rounded-lg border border-dashed'>
					<p className='text-gray-500'>No booking history found.</p>
				</div>
			) : (
				bookings.map((booking) => (
					<div
						key={booking.id_reservation}
						className='bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-4'>
						<div className='bg-[#102E50] p-4 flex justify-between items-center text-white'>
							<span className='font-mono font-bold'>Res ID: #{booking.id_reservation}</span>
							<span
								className={`px-2 py-1 rounded text-xs font-bold capitalize ${
									booking.invoice?.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500 text-black'
								}`}>
								{booking.invoice?.status || 'Pending'}
							</span>
						</div>
						<div className='p-4'>
							{booking.room_reservations.map((rr, idx) => (
								<div key={idx} className='mb-2 pb-2 border-b border-gray-100 last:border-0'>
									<h4 className='font-bold text-gray-800'>
										{rr.room?.room_type?.name}{' '}
										<span className='text-sm font-normal text-gray-500'>
											(Room {rr.room?.room_number})
										</span>
									</h4>
									<p className='text-sm text-gray-600'>
										{new Date(rr.check_in_date).toLocaleDateString()} -{' '}
										{new Date(rr.check_out_date).toLocaleDateString()}
									</p>
								</div>
							))}
							<div className='mt-2 text-right'>
								<span className='text-gray-600 text-sm'>Total: </span>
								<span className='text-lg font-bold text-[#c19a6b]'>
									${booking.invoice?.total_amount}
								</span>
							</div>
						</div>
					</div>
				))
			)}
		</div>
	);

	const tabItems = [
		{ id: 'profile', label: 'Profile', icon: User },
		{ id: 'bookings', label: 'Bookings', icon: History },
	];

	if (loading) {
		return (
			<div className='min-h-screen bg-[#fbfaf9] flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#c19a6b] mx-auto'></div>
					<p className='mt-4 text-gray-600'>Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-[#fbfaf9]'>
			{/* ✅ NAVIGATION BAR - SAMA SEPERTI DI HOMEPAGE */}
			<div className="w-full h-17 fixed flex items-center gap-x-10 px-4 py-2 bg-[#102E50] z-10">
					<button
						  onClick={() => navigate('/')}
						  className="absolute left-6 z-20 flex items-center gap-2 text-white bg-[#102E50] px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:scale-105"
					  >
						  <ArrowLeft className="w-4 h-4" />
						  <span className="text-3sm font-medium">Back to Home</span>
					  </button>
				  </div>

			{/* Padding untuk NavigationBar */}
			<div className='pt-20'>
				<div className='max-w-6xl mx-auto p-6'>
					<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
						{/* Sidebar Navigation */}
						<div className='lg:col-span-1'>
							<div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6'>
								<nav className='space-y-2'>
									{tabItems.map((tab) => {
										const Icon = tab.icon;
										return (
											<button
												key={tab.id}
												onClick={() => setActiveTab(tab.id)}
												className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
													activeTab === tab.id ? 'bg-[#c19a6b]' : 'hover:bg-gray-100'
												}`}>
												<Icon
													className={`w-5 h-5 ${
														activeTab === tab.id ? 'text-white' : 'text-gray-600'
													}`}
												/>
												<span className={activeTab === tab.id ? 'text-white' : 'text-gray-600'}>
													{tab.label}
												</span>
											</button>
										);
									})}
								</nav>
							</div>
						</div>

						{/* Main Content */}
						<div className='lg:col-span-3'>
							<div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
								{activeTab === 'profile' && ProfileInfo() }
								{activeTab === 'bookings' && BookingHistory()}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;