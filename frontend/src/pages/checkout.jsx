import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader, CreditCard, Building, Smartphone } from 'lucide-react';
import '../css/checkout.css';

function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [cartData, setCartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [userData, setUserData] = useState(null);
    
    const [acknowledgements, setAcknowledgements] = useState({
        dataPolicy: false,
        terms: false,
    });

    const [paymentMethod, setPaymentMethod] = useState('bank_transfer'); // default

    const [formData, setFormData] = useState({
        title: 'Mr',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        country: 'Indonesia',
        city: '',
        address1: '',
        zipCode: '',
        specialRequests: '',
    });

    // Fungsi untuk mendapatkan data user
    const fetchUserData = async () => {
        try {
            const response = await fetch('http://localhost:3000/auth/me', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setUserData(data.user);
                
                // Isi form dengan data user jika ada
                if (data.user) {
                    setFormData(prev => ({
                        ...prev,
                        firstName: data.user.firstName || data.user.username?.split(' ')[0] || '',
                        lastName: data.user.lastName || data.user.username?.split(' ').slice(1).join(' ') || '',
                        email: data.user.email || ''
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const fetchCart = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:3000/api/cart', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && Array.isArray(result.cart)) {
                console.log('🛒 Checkout - Cart Data:', result.cart);
                setCartData(result.cart);
            } else {
                setCartData([]);
            }
        } catch (error) {
            console.error('Failed to fetch cart for checkout:', error);
            setError(`Failed to load cart: ${error.message}`);
            setCartData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchCart();
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleClearCart = async () => {
        try {
            await fetch('http://localhost:3000/api/cart', {
                method: 'DELETE',
                credentials: 'include'
            });
            console.log('🛒 Cart cleared');
        } catch (cartError) {
            console.warn('Failed to clear cart:', cartError);
        }
    };

    const handleConfirmBooking = async (e) => {
    e.preventDefault();
    
    // Cek apakah user sudah login
    if (!userData) {
        alert('Please login first to make a booking');
        navigate('/login', { 
            state: { 
                redirectTo: '/checkout',
                message: 'Please login to complete your booking'
            }
        });
        return;
    }
    
    if (!Object.values(acknowledgements).every(Boolean)) {
        alert('Please agree to all acknowledgements before confirming.');
        return;
    }

    if (cartData.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
    }

    const requiredFields = ['firstName', 'lastName', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
        alert(`Please fill in: ${missingFields.map(f => f.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}`);
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address.');
        return;
    }

    try {
        setProcessing(true);
        
        console.log('🚀 Processing checkout...');
        console.log('📤 Sending cart items:', cartData.map(item => ({
            id: item.id,
            roomNumber: item.room?.roomNumber || item.room?.room_number
        })));

        const response = await fetch('http://localhost:3000/reservations/create-from-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                guestInfo: formData,
                cartItems: cartData.map(item => ({
                    id: item.id,
                    roomNumber: item.room?.roomNumber || item.room?.room_number
                }))
            })
        });

        const responseText = await response.text();
        console.log('📨 Raw response:', responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
        }

        if (!response.ok) {
            console.error('❌ API Error:', result);
            throw new Error(result.message || `Failed to create reservation (${response.status})`);
        }

        console.log('✅ Checkout result:', result);

        if (result.success) {
            // Bersihkan cart setelah berhasil checkout
            try {
                await fetch('http://localhost:3000/api/cart', {
                    method: 'DELETE',
                    credentials: 'include'
                });
                console.log('🛒 Cart cleared');
            } catch (cartError) {
                console.warn('Failed to clear cart:', cartError);
            }
            
            // Navigate ke confirmation page
            navigate('/booking-confirmed', {
                state: {
                    bookingId: result.reservation.id_reservation,
                    invoiceId: result.invoice.id_invoice,
                    invoiceNumber: result.invoice.invoice_number,
                    totalAmount: result.invoice.total_amount,
                    dueDate: result.invoice.due_date,
                    guestName: result.guest_info.name,
                    email: result.guest_info.email,
                    phone: result.guest_info.phone,
                    reservationDate: result.reservation.reservation_date,
                    paymentDue: result.summary.payment_due,
                    roomsCount: result.summary.rooms_count,
                    paymentMethod: paymentMethod,
                    subtotal: result.summary.subtotal,
                    tax: result.summary.tax,
                    service_fee: result.summary.service_fee
                }
            });
            
        } else {
            throw new Error(result.message || 'Failed to create reservation');
        }

    } catch (error) {
        console.error('❌ Checkout error:', error);
        alert(`Failed to process booking: ${error.message}\n\nPlease check console for details or contact support.`);
    } finally {
        setProcessing(false);
    }
};

    const calculateTotals = () => {
        if (!Array.isArray(cartData) || cartData.length === 0) {
            return { subtotal: 0, serviceFee: 0, tax: 0, total: 0 };
        }

        const subtotal = cartData.reduce((sum, item) => {
            return sum + parseFloat(item.totalPrice || 0);
        }, 0);

        const serviceFee = 10; 
        const tax = subtotal * 0.1;
        const total = subtotal + serviceFee + tax;

        return { subtotal, serviceFee, tax, total };
    };

    const { subtotal, serviceFee, tax, total } = calculateTotals();

    const paymentMethods = [
        {
            id: 'bank_transfer',
            name: 'Bank Transfer',
            description: 'Transfer to our bank account',
            icon: Building,
            banks: ['BCA', 'Mandiri', 'BNI']
        },
        {
            id: 'virtual_account',
            name: 'Virtual Account',
            description: 'Pay via virtual account number',
            icon: CreditCard,
            banks: ['BCA VA', 'Mandiri VA', 'BNI VA']
        },
        {
            id: 'ewallet',
            name: 'E-Wallet',
            description: 'Pay with digital wallet',
            icon: Smartphone,
            wallets: ['GoPay', 'OVO', 'Dana', 'ShopeePay']
        }
    ];

    if (loading) {
        return (
            <div className='w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center p-4'>
                <div className='bg-white p-8 rounded-lg shadow-lg text-center max-w-md'>
                    <div className='flex justify-center items-center'>
                        <Loader className='w-8 h-8 animate-spin text-[#c19a6b] mr-3' />
                        <span className='text-gray-600 text-lg'>Loading checkout...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center p-4'>
                <div className='bg-white p-8 rounded-lg shadow-lg text-center max-w-md'>
                    <h2 className='text-2xl text-red-600 mb-4'>Error Loading Cart</h2>
                    <p className='text-gray-600 mb-4'>{error}</p>
                    <button
                        onClick={() => navigate('/cart')}
                        className='w-full bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg transition-colors duration-300'>
                        Back to Cart
                    </button>
                </div>
            </div>
        );
    }

    if (cartData.length === 0 && !loading) {
        return (
            <div className="w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                    <h2 className="text-2xl text-[#102E50] mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-6">Please add rooms to your cart before checkout</p>
                    <button
                        onClick={() => navigate('/booking')}
                        className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg transition-colors duration-300">
                        Browse Rooms
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full min-h-screen bg-[#fbfaf9] font-times'>
            {/* HEADER */}
            <div className='w-full h-17 fixed flex items-center px-4 py-2 bg-primary z-10'>
                <button
                    onClick={() => navigate('/cart')}
                    className='absolute left-6 z-20 flex items-center gap-2 text-white bg-primary px-4 py-2 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105'>
                    <ArrowLeft className='w-4 h-4' />
                    <span className='text-3sm font-medium'>Back to Cart</span>
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className='p-10 pt-24 max-w-7xl mx-auto grid md:grid-cols-3 gap-10'>
                {/* LEFT: FORM SECTION */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className='md:col-span-2 bg-white rounded-2xl shadow-lg p-8'>
                    <h2 className='text-3xl font-bold text-primary mb-6'>Checkout</h2>
                    
                    {userData && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-700">
                                Booking as: <span className="font-semibold">{userData.username || userData.email}</span>
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleConfirmBooking} className='space-y-10'>
                        {/* CONTACT INFO SECTION */}
                        <section>
                            <h3 className='text-2xl font-semibold text-primary mb-4'>Contact Info</h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-gray-700 font-medium mb-1'>Title</label>
                                    <select
                                        name='title'
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        className='w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-accent'>
                                        <option>Mr</option>
                                        <option>Mrs</option>
                                        <option>Ms</option>
                                        <option>Dr</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-gray-700 font-medium mb-1'>First Name *</label>
                                    <input
                                        type='text'
                                        name='firstName'
                                        value={formData.firstName}
                                        onChange={handleFormChange}
                                        className='w-full border border-gray-300 rounded-lg p-3'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block text-gray-700 font-medium mb-1'>Last Name *</label>
                                    <input
                                        type='text'
                                        name='lastName'
                                        value={formData.lastName}
                                        onChange={handleFormChange}
                                        className='w-full border border-gray-300 rounded-lg p-3'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block text-gray-700 font-medium mb-1'>Mobile Phone</label>
                                    <input
                                        type='tel'
                                        name='phone'
                                        value={formData.phone}
                                        onChange={handleFormChange}
                                        placeholder='+62 812-3456-7890'
                                        className='w-full border border-gray-300 rounded-lg p-3'
                                    />
                                </div>
                            </div>

                            <div className='mt-4'>
                                <label className='block text-gray-700 font-medium mb-1'>Email Address *</label>
                                <input
                                    type='email'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    placeholder='john@example.com'
                                    className='w-full border border-gray-300 rounded-lg p-3'
                                    required
                                />
                                <p className='text-sm text-gray-500 mt-1'>
                                    Booking confirmation will be sent to this email
                                </p>
                            </div>

                            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-gray-700 font-medium mb-1'>Country</label>
                                    <select
                                        name='country'
                                        value={formData.country}
                                        onChange={handleFormChange}
                                        className='w-full border border-gray-300 rounded-lg p-3'>
                                        <option>Indonesia</option>
                                        <option>France</option>
                                        <option>United States</option>
                                        <option>Japan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-gray-700 font-medium mb-1'>City</label>
                                    <input
                                        type='text'
                                        name='city'
                                        value={formData.city}
                                        onChange={handleFormChange}
                                        className='w-full border border-gray-300 rounded-lg p-3'
                                    />
                                </div>
                                <div>
                                    <label className='block text-gray-700 font-medium mb-1'>Address</label>
                                    <input
                                        type='text'
                                        name='address1'
                                        value={formData.address1}
                                        onChange={handleFormChange}
                                        className='w-full border border-gray-300 rounded-lg p-3'
                                    />
                                </div>
                                <div>
                                    <label className='block text-gray-700 font-medium mb-1'>
                                        Zip / Postal Code
                                    </label>
                                    <input
                                        type='text'
                                        name='zipCode'
                                        value={formData.zipCode}
                                        onChange={handleFormChange}
                                        className='w-full border border-gray-300 rounded-lg p-3'
                                    />
                                </div>
                            </div>
                        </section>

                        {/* PAYMENT METHOD SECTION */}
                        <section>
                            <h3 className='text-2xl font-semibold text-primary mb-4'>Payment Method</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {paymentMethods.map((method) => {
                                    const Icon = method.icon;
                                    return (
                                        <div
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`cursor-pointer border-2 rounded-lg p-4 transition-all duration-300 ${
                                                paymentMethod === method.id
                                                    ? 'border-[#c19a6b] bg-[#fdf8f2]'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`p-2 rounded-lg ${
                                                    paymentMethod === method.id 
                                                    ? 'bg-[#c19a6b] text-white' 
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className="font-semibold">{method.name}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                                            {method.banks && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {method.banks.map((bank, idx) => (
                                                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {bank}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {method.wallets && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {method.wallets.map((wallet, idx) => (
                                                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {wallet}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* RESERVATION DETAILS */}
                        <section>
                            <h3 className='text-2xl font-semibold text-primary mb-4'>Reservation Details</h3>
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-3">Your Booking Summary:</h4>
                                {cartData.map((item, index) => (
                                    <div key={index} className="mb-4 p-3 bg-white rounded-lg border">
                                        <p className="font-medium text-gray-800">
                                            {item.room?.name || 'Room'} - Room {item.room?.room_number || item.roomNumber}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            📅 {new Date(item.checkIn).toLocaleDateString()} to {new Date(item.checkOut).toLocaleDateString()} ({item.nights} nights)
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            👥 {item.guests?.adults || 0} Adults, {item.guests?.children || 0} Children
                                        </p>
                                        <p className="text-accent font-semibold mt-1">
                                            ${parseFloat(item.totalPrice || 0).toFixed(2)}
                                        </p>
                                        
                                        {/* Services */}
                                        {item.services && item.services.length > 0 && (
                                            <div className="mt-2 ml-4">
                                                <p className="text-sm font-medium text-gray-700">Services:</p>
                                                {item.services.map((service, serviceIndex) => (
                                                    <div key={serviceIndex} className="text-sm text-gray-600">
                                                        • {service.service?.name}: ${service.totalPrice}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className='mt-4'>
                                <label className='block text-gray-700 font-medium mb-1'>Special Requests</label>
                                <textarea
                                    name="specialRequests"
                                    value={formData.specialRequests}
                                    onChange={handleFormChange}
                                    rows='3'
                                    placeholder='Add your special requests (early check-in, late check-out, allergies, etc.)'
                                    className='w-full border border-gray-300 rounded-lg p-3'></textarea>
                            </div>
                        </section>

                        {/* ACKNOWLEDGEMENT */}
                        <section>
                            <h3 className='text-2xl font-semibold text-primary mb-4'>Acknowledgement</h3>
                            <div className='space-y-4 text-gray-700'>
                                {[
                                    {
                                        key: 'dataPolicy',
                                        text: (
                                            <>
                                                I consent to the processing of my personal data for managing my booking.{' '}
                                                <a href='#' className='text-accent underline hover:text-accent-dark'>
                                                    Data Privacy Policy
                                                </a>
                                                .
                                            </>
                                        ),
                                    },
                                    {
                                        key: 'terms',
                                        text: (
                                            <>
                                                I confirm that I have read and understood the{' '}
                                                <a href='#' className='text-accent underline hover:text-accent-dark'>
                                                    Terms & Conditions
                                                </a>
                                                , including cancellation policy.
                                            </>
                                        ),
                                    },
                                ].map(({ key, text }) => (
                                    <label key={key} className='flex items-start gap-3'>
                                        <input
                                            type='checkbox'
                                            checked={acknowledgements[key]}
                                            onChange={() =>
                                                setAcknowledgements((prev) => ({
                                                    ...prev,
                                                    [key]: !prev[key],
                                                }))
                                            }
                                            className='mt-1 w-5 h-5 accent-[#c19a6b]'
                                            required
                                        />
                                        <span>{text}</span>
                                    </label>
                                ))}
                            </div>

                            <div className='text-center mt-10'>
                                <button
                                    type='submit'
                                    disabled={!Object.values(acknowledgements).every(Boolean) || processing}
                                    className={`px-8 py-3 rounded-lg font-semibold text-lg shadow-md transition-all duration-300 min-w-[200px] ${
                                        Object.values(acknowledgements).every(Boolean) && !processing
                                            ? 'bg-[#c19a6b] hover:bg-[#a67c52] text-white hover:scale-105 active:scale-95'
                                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    }`}>
                                    {processing ? (
                                        <div className="flex items-center justify-center">
                                            <Loader className="w-5 h-5 animate-spin mr-2" />
                                            Processing...
                                        </div>
                                    ) : (
                                        'Confirm Booking'
                                    )}
                                </button>
                                <p className="text-sm text-gray-500 mt-3">
                                    Invoice will be generated and sent to {formData.email || 'your email'}
                                </p>
                            </div>
                        </section>
                    </form>
                </motion.div>

                {/* RIGHT: PRICE DETAILS */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className='bg-white rounded-2xl shadow-lg p-8 h-fit sticky top-24'>
                    <h2 className='text-2xl font-bold text-primary mb-6'>Price Details</h2>

                    <div className='space-y-4'>
                        {/* Subtotal */}
                        <div className='flex justify-between text-gray-700'>
                            <span>Subtotal</span>
                            <span className="font-semibold">${subtotal.toFixed(2)}</span>
                        </div>
                        
                        {/* Service Fee */}
                        <div className='flex justify-between text-gray-700'>
                            <span>Service Fee</span>
                            <span className="font-semibold">${serviceFee.toFixed(2)}</span>
                        </div>
                        
                        {/* Tax */}
                        <div className='flex justify-between text-gray-700'>
                            <span>Tax (10%)</span>
                            <span className="font-semibold">${tax.toFixed(2)}</span>
                        </div>
                        
                        {/* Total */}
                        <div className='border-t border-gray-300 pt-4 mt-4'>
                            <div className='flex justify-between text-xl font-bold text-primary'>
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Selected Payment Method */}
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">💳 Selected Payment:</h4>
                        <p className="text-sm text-blue-700">
                            {paymentMethods.find(m => m.id === paymentMethod)?.name || 'Bank Transfer'}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Payment details will be shown after booking confirmation
                        </p>
                    </div>

                    {/* Important Information */}
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">⏰ Important:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-4">
                            <li>Complete payment within 16 hours</li>
                            <li>Booking will be cancelled if unpaid</li>
                            <li>Invoice sent to your email</li>
                            <li>Payment confirmation within 1 hour</li>
                        </ul>
                    </div>

                    {/* Need Help */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 mb-2">Need help?</p>
                        <a 
                            href="mailto:support@nyxhotel.com" 
                            className="text-accent hover:text-accent-dark underline text-sm"
                        >
                            support@nyxhotel.com
                        </a>
                        <p className="text-xs text-gray-400 mt-2">24/7 Customer Support</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Checkout;