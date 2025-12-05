import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  CreditCard,
  Clock,
  AlertCircle,
  Loader,
  Calendar,
  DollarSign,
  XCircle,
  CheckCircle
} from 'lucide-react';

function Invoices() {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(null);

  useEffect(() => {
    fetchPendingInvoices();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const fetchPendingInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3000/invoices/pending', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch pending invoices: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.invoices) {
        console.log('✅ Pending invoices loaded:', result.invoices);
        setInvoices(result.invoices);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('❌ Error fetching pending invoices:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const calculateTimeLeft = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    
    if (diffMs <= 0) {
      return { expired: true, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return { 
      expired: false, 
      hours: diffHours, 
      minutes: diffMinutes, 
      seconds: diffSeconds 
    };
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      setProcessingPayment(invoiceId);
      
      // Simulasi proses pembayaran
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update status invoice ke 'paid' di backend
      const response = await fetch(`http://localhost:3000/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'paid'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice status');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh list invoices
        await fetchPendingInvoices();
        alert('✅ Payment successful! Invoice has been marked as paid.\n\nYou can now print the receipt from "My Bookings" page.');
      } else {
        throw new Error(result.message || 'Payment failed');
      }
      
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setProcessingPayment(null);
    }
  };

  const getTimeLeftColor = (timeLeft) => {
    if (timeLeft.expired) return 'text-red-600';
    if (timeLeft.hours < 2) return 'text-red-500';
    if (timeLeft.hours < 6) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTimeLeftText = (timeLeft) => {
    if (timeLeft.expired) return 'PAYMENT OVERDUE';
    if (timeLeft.hours === 0 && timeLeft.minutes === 0) {
      return `${timeLeft.seconds}s remaining`;
    }
    return `${timeLeft.hours}h ${timeLeft.minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[#c19a6b] mx-auto mb-4" />
          <p className="text-gray-600">Loading pending invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl text-red-600 mb-4">Error Loading Invoices</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fbfaf9] font-[Times_New_Roman]">
      {/* HEADER */}
      <div className="w-full h-17 fixed flex items-center px-4 py-2 bg-[#102E50] z-10">
        <button
          onClick={() => navigate('/')}
          className="absolute left-6 z-20 flex items-center gap-2 text-white bg-[#102E50] px-4 py-2 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <div className="w-full text-center">
          <h1 className="text-2xl font-bold text-white">Pending Invoices</h1>
          {user && (
            <p className="text-sm text-gray-300">Hello, {user.name || user.username}</p>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-6 pt-24 max-w-4xl mx-auto">
        {/* SUMMARY CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#102E50] to-[#1a3a5f] rounded-2xl shadow-xl p-6 text-white mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Payment Due</h2>
              <p className="text-gray-300">Complete payment for your pending invoices</p>
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-3xl font-bold">{invoices.length}</div>
                <div className="text-sm text-gray-300">Pending Invoices</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  ${invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-300">Total Due</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* WARNING BANNER */}
        {invoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Important Notice</h3>
                <p className="text-red-700 text-sm">
                  All invoices must be paid within 16 hours. Unpaid invoices will be automatically 
                  cancelled and your booking will be released to other guests.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* INVOICES LIST */}
        <div className="space-y-6">
          {invoices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-10 text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Invoices</h3>
              <p className="text-gray-500 mb-6">All your invoices are paid. Great job!</p>
              <button
                onClick={() => navigate('/my-bookings')}
                className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg transition-colors duration-300"
              >
                View My Bookings
              </button>
            </motion.div>
          ) : (
            invoices.map((invoice, index) => {
              const timeLeft = calculateTimeLeft(invoice.due_date);
              const isExpired = timeLeft.expired;
              const timeColor = getTimeLeftColor(timeLeft);
              
              return (
                <motion.div
                  key={invoice.id_invoice}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 ${
                    isExpired ? 'border-2 border-red-300' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className={`w-6 h-6 ${isExpired ? 'text-red-500' : 'text-[#102E50]'}`} />
                        <div>
                          <h3 className={`text-xl font-bold ${isExpired ? 'text-red-600' : 'text-[#102E50]'}`}>
                            Invoice: {invoice.invoice_number}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              isExpired 
                                ? 'bg-red-100 text-red-800 border-red-200' 
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            } flex items-center gap-1`}>
                              {isExpired ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {isExpired ? 'OVERDUE' : 'PENDING'}
                            </span>
                            <span className={`text-sm font-medium ${timeColor}`}>
                              {getTimeLeftText(timeLeft)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Issued: {formatDate(invoice.issued_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {formatDate(invoice.due_date)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span>Amount: <span className="font-bold text-[#c19a6b]">${parseFloat(invoice.total_amount).toFixed(2)}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span>Booking ID: {invoice.reservation_id}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {!isExpired ? (
                        <button
                          onClick={() => handlePayInvoice(invoice.id_invoice)}
                          disabled={processingPayment === invoice.id_invoice}
                          className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 ${
                            processingPayment === invoice.id_invoice
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-[#c19a6b] hover:bg-[#a67c52] hover:scale-105 active:scale-95'
                          }`}
                        >
                          {processingPayment === invoice.id_invoice ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5" />
                              Pay Now (${parseFloat(invoice.total_amount).toFixed(2)})
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/my-bookings')}
                          className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300 font-semibold"
                        >
                          View in Bookings
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigate(`/my-bookings?invoice=${invoice.id_invoice}`)}
                        className="px-4 py-2 border border-[#102E50] text-[#102E50] hover:bg-[#102E50] hover:text-white rounded-lg transition-colors duration-300 text-sm font-medium"
                      >
                        View Booking Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* PAYMENT METHODS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Accepted Payment Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-gray-800 mb-2">Bank Transfer</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• BCA: 123-456-7890</li>
                <li>• Mandiri: 987-654-3210</li>
                <li>• BNI: 456-789-0123</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-gray-800 mb-2">Virtual Account</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• BCA VA: 12345-67890</li>
                <li>• Mandiri VA: 98765-43210</li>
                <li>• BNI VA: 54321-09876</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-gray-800 mb-2">E-Wallet</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• GoPay: 0812-3456-7890</li>
                <li>• OVO: 0812-3456-7890</li>
                <li>• Dana: 0812-3456-7890</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-blue-700">
            <p><strong>Note:</strong> Include invoice number as payment reference. Payment verification may take up to 1 hour.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Invoices;