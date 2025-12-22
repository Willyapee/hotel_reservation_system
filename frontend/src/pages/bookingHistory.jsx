import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Home, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Loader,
  FileText,
  Printer,
  CreditCard,
  AlertCircle,
  Download,
  Search,
  Filter
} from 'lucide-react';

function BookingHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUserBookings();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const fetchUserBookings = async () => {
    try {
        setLoading(true);
        setError(null);

        console.log('📡 Fetching bookings...');
        
        // const response = await fetch('http://localhost:3000/reservations/my', {
        const response = await fetch('http://148.230.99.149/reservations/my', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
        });

        console.log('📨 Response status:', response.status);
        
        if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`Failed to fetch bookings (${response.status})`);
        }

        const result = await response.json();
        console.log('✅ API result:', result);
        
        if (result.success && result.reservations) {
        console.log('✅ Bookings loaded:', result.reservations.length, 'items');
        setBookings(result.reservations);
        } else {
        console.log('⚠️ No bookings or empty response');
        setBookings([]);
        }
    } catch (error) {
        console.error('❌ Error fetching bookings:', error);
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
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
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

 const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'reserved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checked_out':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'reserved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending_payment':
        return <Clock className="w-4 h-4" />;
      case 'checked_in':
        return <Home className="w-4 h-4" />;
      case 'checked_out':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
    }
  };

  const calculateInvoiceStatus = (invoice) => {
    if (!invoice) return 'no_invoice';
    
    const now = new Date();
    const dueDate = new Date(invoice.due_date);
    
    if (invoice.status === 'paid') return 'paid';
    if (invoice.status === 'cancelled') return 'cancelled';
    if (invoice.status === 'expired') return 'expired';
    
    if (dueDate < now) return 'overdue';
    return 'pending';
  };

  const handlePrintInvoice = async (invoice) => {
    if (!invoice) {
      alert('No invoice found for this booking');
      return;
    }

    // Cek status invoice
    const invoiceStatus = calculateInvoiceStatus(invoice);
    
    if (invoiceStatus !== 'paid') {
      alert(`Cannot print invoice. Invoice status: ${invoiceStatus.toUpperCase()}\n\nOnly paid invoices can be printed.`);
      return;
    }

    try {
      // Ambil detail invoice dari backend
      // const response = await fetch(`http://localhost:3000/invoices/${invoice.id_invoice}`, {
      const response = await fetch(`http://148.230.99.149/invoices/${invoice.id_invoice}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoice details');
      }

      const result = await response.json();
      
      if (result.success) {
        printInvoice(result.invoice);
      } else {
        throw new Error(result.message || 'Failed to get invoice details');
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      alert(`Failed to print invoice: ${error.message}`);
    }
  };

  const printInvoice = (invoiceData) => {
    const printWindow = window.open('', '_blank');
    
    const invoiceContent = `
      <html>
        <head>
          <title>Invoice ${invoiceData.invoice_number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
            
            body {
              font-family: 'Times New Roman', Times, serif;
              margin: 0;
              padding: 20px;
              background-color: #fff;
              color: #333;
            }
            
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              border: 2px solid #102E50;
              border-radius: 8px;
              padding: 30px;
              background-color: #fff;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px double #c19a6b;
              padding-bottom: 20px;
            }
            
            .hotel-name {
              color: #102E50;
              font-size: 32px;
              font-weight: bold;
              margin: 0;
              letter-spacing: 2px;
            }
            
            .hotel-subtitle {
              color: #666;
              font-size: 14px;
              margin-top: 5px;
            }
            
            .invoice-title {
              color: #c19a6b;
              font-size: 24px;
              margin: 20px 0;
              text-transform: uppercase;
            }
            
            .invoice-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
              padding: 15px;
              background-color: #f9f9f9;
              border-radius: 5px;
            }
            
            .info-section h3 {
              color: #102E50;
              margin-bottom: 10px;
              font-size: 16px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            
            .info-item {
              margin-bottom: 8px;
              font-size: 14px;
            }
            
            .info-label {
              font-weight: bold;
              color: #555;
              display: inline-block;
              width: 120px;
            }
            
            .rooms-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 14px;
            }
            
            .rooms-table th {
              background-color: #102E50;
              color: white;
              padding: 12px;
              text-align: left;
              border: 1px solid #ddd;
            }
            
            .rooms-table td {
              padding: 10px;
              border: 1px solid #ddd;
            }
            
            .rooms-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            .total-section {
              text-align: right;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #102E50;
            }
            
            .total-line {
              font-size: 16px;
              margin-bottom: 8px;
            }
            
            .grand-total {
              font-size: 24px;
              font-weight: bold;
              color: #c19a6b;
              margin-top: 10px;
            }
            
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              margin-left: 10px;
            }
            
            .status-paid {
              background-color: #d4edda;
              color: #155724;
            }
            
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            
            .thank-you {
              color: #102E50;
              font-size: 16px;
              margin: 20px 0;
              font-style: italic;
            }
            
            @media print {
              body { padding: 0; }
              .invoice-container { border: none; padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <h1 class="hotel-name">NYX HOTEL</h1>
              <p class="hotel-subtitle">Luxury Accommodation & Premium Services</p>
              <h2 class="invoice-title">INVOICE RECEIPT</h2>
            </div>
            
            <!-- Invoice Info -->
            <div class="invoice-info">
              <div class="info-section">
                <h3>INVOICE DETAILS</h3>
                <div class="info-item">
                  <span class="info-label">Invoice No:</span> 
                  ${invoiceData.invoice_number}
                </div>
                <div class="info-item">
                  <span class="info-label">Issue Date:</span> 
                  ${formatDateTime(invoiceData.issued_date)}
                </div>
                <div class="info-item">
                  <span class="info-label">Status:</span> 
                  ${invoiceData.status.toUpperCase()}
                  <span class="status-badge status-paid">PAID</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3>BOOKING DETAILS</h3>
                <div class="info-item">
                  <span class="info-label">Booking ID:</span> 
                  ${invoiceData.reservation?.id_reservation || 'N/A'}
                </div>
                <div class="info-item">
                  <span class="info-label">Booking Date:</span> 
                  ${formatDateTime(invoiceData.reservation?.reservation_date || '')}
                </div>
              </div>
            </div>
            
            <!-- Rooms Table -->
            <h3>BOOKED ROOMS</h3>
            <table class="rooms-table">
              <thead>
                <tr>
                  <th>Room Type</th>
                  <th>Room No</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.reservation?.room_reservations?.map(room => `
                  <tr>
                    <td>${room.room?.room_type?.name || 'Room'}</td>
                    <td>${room.room?.room_number || '-'}</td>
                    <td>${formatDate(room.check_in_date)}</td>
                    <td>${formatDate(room.check_out_date)}</td>
                    <td>${room.guest_adults} Adults, ${room.guest_children} Children</td>
                    <td>$${parseFloat(room.subtotal_price || 0).toFixed(2)}</td>
                  </tr>
                `).join('') || '<tr><td colspan="6">No rooms found</td></tr>'}
              </tbody>
            </table>
            
            <!-- Total Section -->
            <div class="total-section">
              <div class="total-line">
                <strong>Subtotal:</strong> $${(parseFloat(invoiceData.total_amount) * 0.9).toFixed(2)}
              </div>
              <div class="total-line">
                <strong>Tax (10%):</strong> $${(parseFloat(invoiceData.total_amount) * 0.1).toFixed(2)}
              </div>
              <div class="grand-total">
                TOTAL: $${parseFloat(invoiceData.total_amount).toFixed(2)}
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="thank-you">
                Thank you for choosing NYX Hotel!
              </div>
              <p>
                <strong>Payment Method:</strong> Bank Transfer / Credit Card<br>
                <strong>Payment Date:</strong> ${formatDateTime(new Date().toISOString())}<br>
                <strong>Transaction ID:</strong> TRX-${Date.now().toString().slice(-8)}
              </p>
              <p style="margin-top: 20px;">
                NYX Hotel • 123 Luxury Street, Jakarta, Indonesia<br>
                Phone: +62 21 1234 5678 • Email: accounting@nyxhotel.com<br>
                www.nyxhotel.com
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <button onclick="window.print()" style="
              background-color: #102E50;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              margin-right: 10px;
            ">
              <i class="fa fa-print"></i> Print Invoice
            </button>
            <button onclick="window.close()" style="
              background-color: #666;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
            ">
              Close Window
            </button>
          </div>
          
          <script>
            // Auto-print setelah window terbuka
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
  };

  const handleDownloadInvoice = (invoice) => {
    if (!invoice) return;
    
    const invoiceStatus = calculateInvoiceStatus(invoice);
    
    if (invoiceStatus !== 'paid') {
      alert(`Cannot download invoice. Invoice status: ${invoiceStatus.toUpperCase()}\n\nOnly paid invoices can be downloaded.`);
      return;
    }

    const invoiceContent = `
=====================================
          NYX HOTEL - INVOICE RECEIPT
=====================================

INVOICE NUMBER: ${invoice.invoice_number}
ISSUE DATE: ${formatDateTime(invoice.issued_date)}
STATUS: ${invoice.status.toUpperCase()}

BOOKING DETAILS:
Booking ID: ${invoice.reservation_id || 'N/A'}

PAYMENT INFORMATION:
Total Amount: $${parseFloat(invoice.total_amount).toFixed(2)}
Payment Method: Bank Transfer
Payment Date: ${formatDateTime(new Date().toISOString())}
Transaction ID: TRX-${Date.now().toString().slice(-8)}

=====================================
     THIS IS AN OFFICIAL RECEIPT
=====================================

Thank you for choosing NYX Hotel!
For any inquiries, contact accounting@nyxhotel.com

=====================================
Generated on: ${formatDateTime(new Date().toISOString())}
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-Receipt-${invoice.invoice_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`Invoice receipt ${invoice.invoice_number} downloaded!`);
  };
  
  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      booking.id_reservation.toString().includes(searchLower) ||
      booking.room_reservations?.some(room => 
        room.room?.room_type?.name?.toLowerCase().includes(searchLower)
      );
    const roomStatus = booking.room_reservations?.[0]?.status;
    const effectiveStatus = roomStatus || booking.status;

    const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[#c19a6b] mx-auto mb-4" />
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl text-red-600 mb-4">Error Loading Bookings</h2>
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
          <h1 className="text-2xl font-bold text-white">My Bookings</h1>
          {user && (
            <p className="text-sm text-gray-300">Hello, {user.name || user.username}</p>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-6 pt-24 max-w-6xl mx-auto">
        {/* SUMMARY CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#102E50] to-[#1a3a5f] rounded-2xl shadow-xl p-6 text-white mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Booking History</h2>
              <p className="text-gray-300">All your hotel reservations and invoices</p>
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-3xl font-bold">{bookings.length}</div>
                <div className="text-sm text-gray-300">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {bookings.filter(b => b.status === 'reserved').length}
                </div>
                <div className="text-sm text-gray-300">Active</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {bookings.filter(b => b.invoice?.status === 'paid').length}
                </div>
                <div className="text-sm text-gray-300">Paid</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SEARCH AND FILTER TOOLS */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Booking ID or Room Type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#102E50] focus:ring-2 focus:ring-[#102E50]/20 outline-none transition-all duration-300"
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:border-[#102E50] focus:ring-2 focus:ring-[#102E50]/20 outline-none appearance-none bg-white cursor-pointer transition-all duration-300"
            >
              <option value="all">All Statuses</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="reserved">Reserved</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {/* Custom Arrow for Select */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

{/* BOOKINGS LIST - GANTI DENGAN INI */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            bookings.length > 0 ? (
               /* Tampilan jika pencarian tidak ditemukan */
               <div className="text-center py-10 text-gray-500 bg-white rounded-2xl shadow">
                 <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                 <p>No bookings match your search.</p>
               </div>
            ) : (
             /* Tampilan jika belum ada booking sama sekali (default) */
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5 }}
               className="bg-white rounded-2xl shadow-lg p-10 text-center"
             >
               <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
               <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Yet</h3>
               <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
               <button
                 onClick={() => navigate('/booking')}
                 className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg transition-colors duration-300"
               >
                 Book Your Stay Now
               </button>
             </motion.div>
            )
          ) : (
            filteredBookings.map((booking, index) => {
              const invoiceStatus = calculateInvoiceStatus(booking.invoice);
              const isInvoicePaid = invoiceStatus === 'paid';
              
              const displayStatus = booking.room_reservations?.[0]?.status || booking.status || 'draft';
              return (
                <motion.div
                  key={booking.id_reservation}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 ${
                    selectedBooking === booking.id_reservation.toString() ? 'ring-2 ring-[#c19a6b]' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[#102E50]">
                          Booking #{booking.id_reservation}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(displayStatus)} flex items-center gap-1`}>
                          {getStatusIcon(displayStatus)}
                          {displayStatus?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                      
                      <div className="text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Booked on: {formatDate(booking.reservation_date)}</span>
                        </div>
                        
                        {booking.room_reservations && booking.room_reservations.length > 0 && (
                          <div className="mt-3">
                            <p className="font-semibold text-gray-700 mb-2">Rooms:</p>
                            <div className="space-y-3">
                              {booking.room_reservations.map((roomRes, idx) => (
                                <div key={idx} className="pl-4 border-l-2 border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <Home className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <p className="font-medium">
                                        {roomRes.room?.room_type?.name || 'Room'} - {roomRes.room?.room_number}
                                      </p>
                                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {formatDate(roomRes.check_in_date)} → {formatDate(roomRes.check_out_date)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          {roomRes.guest_adults} Adults, {roomRes.guest_children} Children
                                        </span>
                                      </div>
                                      <p className="text-[#c19a6b] font-semibold mt-1">
                                        ${parseFloat(roomRes.subtotal_price || 0).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {booking.invoice && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-700">
                                  Invoice: {booking.invoice.invoice_number}
                                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                                    invoiceStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                    invoiceStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                                    invoiceStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {invoiceStatus.toUpperCase()}
                                  </span>
                                </p>
                                <p className="text-sm text-gray-500">
                                  Total: <span className="font-bold text-[#c19a6b]">
                                    ${parseFloat(booking.invoice.total_amount).toFixed(2)}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-400">
                                  Due: {formatDate(booking.invoice.due_date)}
                                </p>
                              </div>
                              
                              {isInvoicePaid && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handlePrintInvoice(booking.invoice)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-[#102E50] hover:bg-[#1a3a5f] text-white rounded-lg transition-colors duration-300 text-sm"
                                    title="Print Invoice"
                                  >
                                    <Printer className="w-4 h-4" />
                                    Print
                                  </button>
                                  <button
                                    onClick={() => handleDownloadInvoice(booking.invoice)}
                                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors duration-300 text-sm"
                                    title="Download Invoice"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {booking.invoice && invoiceStatus === 'pending' && (
                        <button
                          onClick={() => navigate(`/invoices?highlight=${booking.invoice.id_invoice}`)}
                          className="px-4 py-2 bg-[#c19a6b] hover:bg-[#a67c52] text-white rounded-lg transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pay Invoice
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          if (booking.invoice?.id_invoice) {
                            navigate(`/invoices?invoice=${booking.invoice.id_invoice}`);
                          }
                        }}
                        className="px-4 py-2 bg-[#102E50] hover:bg-[#1a3a5f] text-white rounded-lg transition-colors duration-300 text-sm font-medium"
                      >
                        View Details
                      </button>
                      
                      {booking.status === 'reserved' && (
                        <button
                          onClick={() => alert('Modify booking feature coming soon!')}
                          className="px-4 py-2 border border-[#c19a6b] text-[#c19a6b] hover:bg-[#c19a6b] hover:text-white rounded-lg transition-colors duration-300 text-sm font-medium"
                        >
                          Modify Booking
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* INFO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Invoice Information
          </h3>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>• <strong>Pending invoices</strong> can be paid from the "My Invoices" page</li>
            <li>• <strong>Paid invoices</strong> can be printed/downloaded as receipts</li>
            <li>• <strong>Expired invoices</strong> will appear here but cannot be paid</li>
            <li>• Keep printed receipts for check-in verification</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

export default BookingHistory;