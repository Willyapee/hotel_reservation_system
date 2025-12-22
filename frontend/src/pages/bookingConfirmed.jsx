import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  Download, 
  Home, 
  CreditCard,
  Building,
  Smartphone,
  Mail,
  Phone,
  Calendar,
  FileText,
  User
} from 'lucide-react';

function BookingConfirmed() {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(16 * 60 * 60); // 16 jam dalam detik
  const [bookingData, setBookingData] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    if (!location.state) {
      navigate('/');
      return;
    }

    setBookingData(location.state);
    console.log('✅ Booking data received:', location.state);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location, navigate]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePayNow = async () => {
    try {
      setPaymentProcessing(true);
      
      console.log('💳 Starting payment process...');
      
      console.log(`📝 Updating invoice ${bookingData.invoiceId} status to paid...`);
      // const response = await fetch(`http://localhost:3000/invoices/${bookingData.invoiceId}/status`, {
      const response = await fetch(`http://148.230.99.149/invoices/${bookingData.invoiceId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          status: 'paid',
          payment_method: bookingData.paymentMethod || 'bank_transfer'
        })
      });
      
      const responseText = await response.text();
      console.log('📨 Response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        throw new Error(result?.message || `Payment failed: ${response.status}`);
      }
      
      console.log('✅ Payment successful!');
      
      try {
        // await fetch('http://localhost:3000/api/cart', {
        await fetch('http://148.230.99.149/api/cart', {
          method: 'DELETE',
          credentials: 'include'
        });
        console.log('🛒 Cart cleared');
      } catch (cartError) {
        console.warn('Failed to clear cart:', cartError);
      }
      
      setPaymentCompleted(true);

      setTimeout(() => {
        alert('✅ Payment successful! Your booking is now confirmed.\n\n' +
              `Booking ID: ${bookingData.bookingId}\n` +
              `Invoice: ${bookingData.invoiceNumber}\n` +
              `Total: $${bookingData.totalAmount}`);
        navigate('/');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert(`❌ ${error.message}\n\nPlease try again or contact support.`);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  const handleDownloadInvoice = () => {
    const invoiceContent = `
      =====================================
                NYX HOTEL INVOICE
      =====================================
      Invoice Number: ${bookingData?.invoiceNumber || 'N/A'}
      Booking ID: ${bookingData?.bookingId || 'N/A'}
      Date: ${new Date().toLocaleDateString()}
      
      Guest Information:
      Name: ${bookingData?.guestName || 'N/A'}
      Email: ${bookingData?.email || 'N/A'}
      Phone: ${bookingData?.phone || 'N/A'}
      
      Booking Details:
      Rooms: ${bookingData?.roomsCount || '0'}
      Total Amount: $${bookingData?.totalAmount || '0.00'}
      Due Date: ${new Date(bookingData?.dueDate).toLocaleDateString()}
      
      Payment Status: ${paymentCompleted ? 'PAID' : 'PENDING'}
      Payment Method: ${bookingData?.paymentMethod?.toUpperCase()?.replace('_', ' ') || 'BANK TRANSFER'}
      
      =====================================
      Thank you for choosing NYX Hotel!
      =====================================
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${bookingData?.invoiceNumber || 'NYX'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('📄 Invoice downloaded!');
  };

  if (!bookingData) {
    return (
      <div className="w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c19a6b] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking confirmation...</p>
        </div>
      </div>
    );
  }

  const paymentMethods = {
    bank_transfer: {
      name: 'Bank Transfer',
      icon: Building,
      instructions: [
        'Transfer to our bank account:',
        'Bank: BCA (Bank Central Asia)',
        'Account: 123-456-7890',
        'Name: PT. NYX Hotel Indonesia',
        'Amount: $' + bookingData.totalAmount,
        'Use Invoice Number as reference'
      ]
    },
    virtual_account: {
      name: 'Virtual Account',
      icon: CreditCard,
      instructions: [
        'Virtual Account Number:',
        'BCA: 12345-67890-12345',
        'Mandiri: 98765-43210-98765',
        'BNI: 54321-09876-54321',
        'Valid for 16 hours',
        'Payment via ATM/Mobile Banking'
      ]
    },
    ewallet: {
      name: 'E-Wallet',
      icon: Smartphone,
      instructions: [
        'Scan QR Code below:',
        '[QR Code Image Placeholder]',
        'Or pay directly via:',
        'GoPay, OVO, Dana, ShopeePay',
        'Use Phone: +62 812-3456-7890',
        'Include Invoice Number in note'
      ]
    }
  };

  const selectedPayment = paymentMethods[bookingData.paymentMethod] || paymentMethods.bank_transfer;
  const PaymentIcon = selectedPayment.icon;

  return (
    <div className="w-full min-h-screen bg-[#fbfaf9] font-[Times_New_Roman]">
      {/* HEADER */}
      <div className="w-full h-17 fixed flex items-center justify-center px-4 py-2 bg-[#102E50] z-10">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <h1 className="text-2xl font-bold text-white">Booking Confirmed!</h1>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-10 pt-24 max-w-6xl mx-auto">
        {/* SUCCESS MESSAGE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center mb-8"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Thank You for Your Booking!</h2>
          <p className="text-gray-600 mb-4">
            Your reservation has been confirmed. An invoice has been sent to your email.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="font-bold text-[#102E50]">{bookingData.invoiceNumber}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="font-bold text-[#102E50]">{bookingData.bookingId}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-bold text-[#c19a6b]">${parseFloat(bookingData.totalAmount).toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* LEFT: PAYMENT TIMER & ACTIONS */}
          <div className="md:col-span-2 space-y-8">
            {/* PAYMENT TIMER */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-red-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-red-500" />
                  <h3 className="text-xl font-bold text-gray-800">Payment Due Timer</h3>
                </div>
                <span className={`text-lg font-bold ${timeLeft < 3600 ? 'text-red-600' : 'text-[#c19a6b]'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-700 text-sm">
                  ⚠️ Complete your payment within <span className="font-bold">{formatTime(timeLeft)}</span>.
                  Your booking will be automatically cancelled if payment is not received.
                </p>
              </div>

              {paymentCompleted ? (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-semibold text-green-700">Payment Completed!</p>
                      <p className="text-sm text-green-600">Your booking is now fully confirmed.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <button
                    onClick={handlePayNow}
                    disabled={paymentProcessing || timeLeft <= 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                      paymentProcessing || timeLeft <= 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#c19a6b] hover:bg-[#a67c52] text-white hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    {paymentProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay Now (${parseFloat(bookingData.totalAmount).toFixed(2)})
                      </>
                    )}
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Secure payment • Instant confirmation
                  </p>
                </div>
              )}
            </motion.div>

            {/* PAYMENT INSTRUCTIONS */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <PaymentIcon className="w-6 h-6 text-[#102E50]" />
                <h3 className="text-xl font-bold text-gray-800">{selectedPayment.name} Instructions</h3>
              </div>

              <div className="space-y-3">
                {selectedPayment.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{instruction}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  💡 <span className="font-semibold">Important:</span> After payment, please keep the transaction receipt. 
                  Payment verification may take up to 1 hour.
                </p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: INVOICE DETAILS */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* INVOICE CARD */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Invoice Details
                </h3>
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-2 text-[#102E50] hover:text-[#c19a6b] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Guest Name</p>
                    <p className="font-semibold">{bookingData.guestName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold">{bookingData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold">{bookingData.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Booking Date</p>
                    <p className="font-semibold">
                      {new Date(bookingData.reservationDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-2xl font-bold text-[#c19a6b]">
                      ${parseFloat(bookingData.totalAmount).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Due: {new Date(bookingData.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-gradient-to-br from-[#102E50] to-[#1a3a5f] rounded-2xl shadow-lg p-6 text-white">
              <h4 className="text-lg font-bold mb-4">Quick Actions</h4>
              
              <div className="space-y-3">
                <button
                  onClick={handleGoToHome}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg flex items-center justify-center gap-3 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Go to Homepage
                </button>
                
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg flex items-center justify-center gap-3 transition-colors"
                >
                  <User className="w-5 h-5" />
                  View My Bookings
                </button>
                
                <button
                  onClick={() => alert('Support contacted!')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg flex items-center justify-center gap-3 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Contact Support
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-sm text-gray-300 text-center">
                  Need help? Call us at +62 21 1234 5678
                </p>
              </div>
            </div>

            {/* REMINDER */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Reminder
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Check-in: 2:00 PM • Check-out: 12:00 PM</li>
                <li>• Bring ID/passport for verification</li>
                <li>• Early check-in/late check-out subject to availability</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM NOTE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center text-gray-600"
        >
          <p>
            Your invoice has been sent to <span className="font-semibold">{bookingData.email}</span>.
            Check your spam folder if you don't see it.
          </p>
          <p className="text-sm mt-2">
            Booking reference: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {bookingData.invoiceNumber}
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default BookingConfirmed;