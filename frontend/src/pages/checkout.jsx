import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader } from "lucide-react";
import "../css/checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acknowledgements, setAcknowledgements] = useState({
    dataPolicy: false,
    cardConsent: false,
    terms: false,
  });
  
  const [formData, setFormData] = useState({
    title: "Mr",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    country: "Indonesia",
    city: "",
    address1: "",
    zipCode: ""
  });

  // FETCH CART DATA
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/api/cart', {
        credentials: 'include'
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
    fetchCart();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    
    if (!Object.values(acknowledgements).every(Boolean)) {
      alert("Please agree to all acknowledgements before confirming.");
      return;
    }

    if (cartData.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      return;
    }

    try {
      // CREATE RESERVATION LOGIC
      const response = await fetch('http://localhost:3000/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          cartItems: cartData,
          contactInfo: formData,
          paymentInfo: {}
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // CLEAR CART setelah berhasil checkout
        await fetch('http://localhost:3000/api/cart', {
          method: 'DELETE',
          credentials: 'include'
        });
        
        alert("✅ Booking Confirmed! Thank you for your reservation.");
        generateInvoicePDF(); // Generate invoice
        navigate("/confirmation", { state: { reservationId: result.reservationId } });
      } else {
        alert(`Failed to create reservation: ${result.message}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert("Failed to process booking. Please try again.");
    }
  };

  // CALCULATE TOTALS
  const calculateTotals = () => {
    if (!Array.isArray(cartData) || cartData.length === 0) {
      return { subtotal: 0, serviceFee: 0, total: 0 };
    }

    const subtotal = cartData.reduce((sum, item) => {
      return sum + parseFloat(item.totalPrice || 0);
    }, 0);

    const serviceFee = 10;
    const total = subtotal + serviceFee;

    return { subtotal, serviceFee, total };
  };

  const { subtotal, serviceFee, total } = calculateTotals();

  // GENERATE INVOICE PDF
  const generateInvoicePDF = async () => {
    if (cartData.length === 0) {
      alert("Cart is empty. Cannot generate invoice.");
      return;
    }

    try {
      const doc = new jsPDF();
      
      const logoImg = new Image();
      logoImg.src = '/picture/logo/logoNoBG.png';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });
      
      doc.addImage(logoImg, 'PNG', 14, 10, 30, 30);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(40, 40, 40);
      doc.text("NYX HOTEL", 50, 22);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Luxury Accommodation & Hospitality", 50, 28);
      doc.text("123 Your Street", 50, 33);
      doc.text("City, State, Country | Tel: 555-555-1234", 50, 37);
      doc.text("info@nyxhotel.com | www.nyxhotel.com", 50, 41);
      
      doc.setDrawColor(193, 154, 107);
      doc.setFillColor(193, 154, 107);
      doc.rect(140, 10, 60, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("INVOICE", 170, 18, { align: "center" });
      
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Invoice Number:", 140, 28);
      doc.text("Date of Issue:", 140, 33);
      doc.text("Payment Terms:", 140, 38);
      
      doc.setFont("helvetica", "bold");
      const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
      const invoiceDate = new Date().toLocaleDateString('en-US');
      doc.text(invoiceNumber, 175, 28);
      doc.text(invoiceDate, 175, 33);
      doc.text("Due on Receipt", 175, 38);
      
      doc.setDrawColor(193, 154, 107);
      doc.setLineWidth(0.5);
      doc.line(14, 48, 196, 48);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(193, 154, 107);
      doc.text("BILL TO:", 14, 56);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const guestName = formData.firstName || formData.lastName 
        ? `${formData.title} ${formData.firstName} ${formData.lastName}`
        : "Guest Name";
      doc.text(guestName, 14, 62);
      doc.text(formData.address1 || "Address", 14, 67);
      doc.text(`${formData.city || "City"}, ${formData.country || "Country"}`, 14, 72);
      doc.text(`Email: ${formData.email || "N/A"}`, 14, 77);
      doc.text(`Phone: ${formData.phone || "N/A"}`, 14, 82);
      
      const startY = 90;
      const rowHeight = 8;
      const colWidths = [12, 70, 35, 20, 25, 25]; // Lebar kolom
      const headers = ["#", "Description", "Type", "Qty", "Unit Price", "Amount"];
      
      doc.setFillColor(193, 154, 107);
      doc.rect(14, startY - 5, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      
      let x = 14;
      headers.forEach((h, i) => {
        doc.text(h, x + 2, startY);
        x += colWidths[i];
      });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      let y = startY + rowHeight;
      
      let itemNumber = 1;
      let totalAmount = 0;
      
      // Table Rows dengan alternating background
      cartData.forEach((item, cartIndex) => {
        const room = item.room || {};
        const roomPrice = parseFloat(room.price || 0);
        const nights = item.nights || 1;
        const roomTotal = roomPrice * nights;
        totalAmount += roomTotal;
        
        // Alternate row background
        if (itemNumber % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(14, y - rowHeight + 2, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        }
        
        // Room row
        x = 14;
        const roomRow = [
          itemNumber.toString(),
          room.name || "Room",
          "Room",
          nights.toString(),
          `$${roomPrice.toFixed(2)}`,
          `$${roomTotal.toFixed(2)}`
        ];
        
        roomRow.forEach((text, i) => {
          doc.text(text, x + 2, y);
          doc.setDrawColor(200, 200, 200);
          doc.rect(x, y - rowHeight + 2, colWidths[i], rowHeight);
          x += colWidths[i];
        });
        
        y += rowHeight;
        itemNumber++;
        
        // Services rows
        if (item.services && Array.isArray(item.services)) {
          item.services.forEach((service, serviceIndex) => {
            const serviceName = service.service?.name || "Service";
            const servicePrice = parseFloat(service.service?.service_price || 0);
            const serviceQuantity = service.quantity || 1;
            const serviceTotal = parseFloat(service.totalPrice || 0);
            totalAmount += serviceTotal;
            
            // Alternate row background
            if ((itemNumber + serviceIndex) % 2 === 0) {
              doc.setFillColor(245, 245, 245);
              doc.rect(14, y - rowHeight + 2, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
            }
            
            x = 14;
            const serviceRow = [
              `${cartIndex + 1}.${serviceIndex + 1}`,
              serviceName,
              "Service",
              serviceQuantity.toString(),
              `$${servicePrice.toFixed(2)}`,
              `$${serviceTotal.toFixed(2)}`
            ];
            
            serviceRow.forEach((text, i) => {
              doc.text(text, x + 2, y);
              doc.setDrawColor(200, 200, 200);
              doc.rect(x, y - rowHeight + 2, colWidths[i], rowHeight);
              x += colWidths[i];
            });
            
            y += rowHeight;
          });
        }
        
        // Page break jika mendekati bawah
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
      
      // Summary Section
      const summaryY = y + 10;
      const summaryX = 130;
      
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(summaryX, summaryY, 196, summaryY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("Subtotal:", summaryX, summaryY + 8);
      doc.text("Service Fee:", summaryX, summaryY + 15);
      doc.text("Tax (0%):", summaryX, summaryY + 22);
      
      doc.text(`$${subtotal.toFixed(2)}`, 196, summaryY + 8, { align: "right" });
      doc.text(`$${serviceFee.toFixed(2)}`, 196, summaryY + 15, { align: "right" });
      doc.text(`$0.00`, 196, summaryY + 22, { align: "right" });
      
      // Total Box - Highlighted
      doc.setFillColor(193, 154, 107);
      doc.rect(summaryX, summaryY + 27, 66, 10, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("TOTAL:", summaryX + 3, summaryY + 34);
      doc.text(`$${total.toFixed(2)}`, 193, summaryY + 34, { align: "right" });
      
      // Reservation Details
      const detailsY = summaryY + 50;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(193, 154, 107);
      doc.text("Reservation Details:", 14, detailsY);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      if (cartData.length > 0) {
        const firstItem = cartData[0];
        doc.text(`Check-in: ${firstItem.checkIn || "N/A"}`, 14, detailsY + 6);
        doc.text(`Check-out: ${firstItem.checkOut || "N/A"}`, 14, detailsY + 12);
        doc.text(`Total Nights: ${cartData.reduce((sum, item) => sum + (item.nights || 0), 0)}`, 14, detailsY + 18);
        doc.text(`Total Guests: ${cartData.reduce((sum, item) => sum + (item.adults || 0) + (item.children || 0), 0)}`, 14, detailsY + 24);
      }
      
      // Terms & Conditions
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(193, 154, 107);
      doc.text("Terms & Conditions:", 14, detailsY + 40);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const terms = [
        "• Payment is due upon receipt of this invoice",
        "• Cancellation must be made 48 hours prior to check-in",
        "• Late cancellations may incur a fee of one night's stay",
        "• Check-in time: 3:00 PM | Check-out time: 11:00 AM",
        "• All prices are in USD"
      ];
      
      let termsY = detailsY + 46;
      terms.forEach(term => {
        doc.text(term, 14, termsY);
        termsY += 5;
      });
      
      // Footer dengan timestamp - SAMA SEPERTI USER REPORT
      const downloadDate = new Date().toLocaleString();
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${downloadDate}`, 14, 290);
      
      doc.setDrawColor(193, 154, 107);
      doc.setLineWidth(0.5);
      doc.line(14, 270, 196, 270);
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Thank you for choosing Nyx Hotel", 105, 277, { align: "center" });
      doc.setFontSize(8);
      doc.text("This invoice was automatically generated and serves as your payment confirmation", 105, 282, { align: "center" });
      doc.text("For inquiries, please contact us at info@nyxhotel.com | +1 555-555-1234", 105, 287, { align: "center" });
      
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Nyx_Hotel_Invoice_${dateStr}_${invoiceNumber}.pdf`;
      doc.save(fileName);
      
      console.log('✅ Invoice PDF generated successfully:', fileName);
      
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="flex justify-center items-center">
            <Loader className="w-8 h-8 animate-spin text-[#c19a6b] mr-3" />
            <span className="text-gray-600 text-lg">Loading checkout...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#fbfaf9] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl text-red-600 mb-4">Error Loading Cart</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/cart")}
            className="w-full bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fbfaf9] font-times">
      {/* HEADER */}
      <div className="w-full h-17 fixed flex items-center px-4 py-2 bg-primary z-10">
        <button
          onClick={() => navigate("/cart")}
          className="absolute left-6 z-20 flex items-center gap-2 text-white bg-primary px-4 py-2 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-3sm font-medium">Back to Cart</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-10 pt-24 max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        {/* LEFT: FORM SECTION */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-2 bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-3xl font-bold text-primary mb-6">Checkout</h2>

          {cartData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-6">Your cart is empty.</p>
              <button
                onClick={() => navigate("/booking")}
                className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-lg text-lg shadow-md transition-colors duration-300"
              >
                Continue Booking
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmBooking} className="space-y-10">
              {/* CONTACT INFO SECTION */}
              <section>
                <h3 className="text-2xl font-semibold text-primary mb-4">
                  Contact Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Title *
                    </label>
                    <select 
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-accent"
                    >
                      <option>Mr</option>
                      <option>Mrs</option>
                      <option>Ms</option>
                      <option>Dr</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Mobile Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="+62 812-3456-7890"
                      className="w-full border border-gray-300 rounded-lg p-3"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="john@example.com"
                    className="w-full border border-gray-300 rounded-lg p-3"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This is the email we will send your confirmation to.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Country *
                    </label>
                    <select 
                      name="country"
                      value={formData.country}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    >
                      <option>Indonesia</option>
                      <option>France</option>
                      <option>United States</option>
                      <option>Japan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Address 1 *
                    </label>
                    <input
                      type="text"
                      name="address1"
                      value={formData.address1}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Zip / Postal Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* RESERVATION DETAILS */}
              <section>
                <h3 className="text-2xl font-semibold text-primary mb-4">
                  Reservation Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Estimated Arrival Time *
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg p-3">
                      <option>12:00 PM</option>
                      <option>2:00 PM</option>
                      <option>4:00 PM</option>
                      <option>6:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Estimated Departure Time *
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg p-3">
                      <option>8:00 AM</option>
                      <option>10:00 AM</option>
                      <option>12:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-1">
                    Special Requests
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Add your special requests..."
                    className="w-full border border-gray-300 rounded-lg p-3"
                  ></textarea>
                </div>
              </section>

              {/* PAYMENT */}
              <section>
                <h3 className="text-2xl font-semibold text-primary mb-4">
                  Payment
                </h3>
                <p className="text-gray-600 mb-3">
                  We use secure transmission and encrypted storage to protect your
                  information.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full border border-gray-300 rounded-lg p-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Expiration (MM/YY) *
                      </label>
                      <input
                        type="text"
                        placeholder="12/27"
                        className="w-full border border-gray-300 rounded-lg p-3"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full border border-gray-300 rounded-lg p-3"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-1">
                    Name on Card *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-3"
                    required
                  />
                </div>
              </section>

              {/* ACKNOWLEDGEMENT */}
              <section>
                <h3 className="text-2xl font-semibold text-primary mb-4">
                  Acknowledgement
                </h3>
                <div className="space-y-4 text-gray-700">
                  {[
                    {
                      key: "dataPolicy",
                      text: (
                        <>
                          I consent to the processing of my personal data for
                          managing my booking.{" "}
                          <a
                            href="#"
                            className="text-accent underline hover:text-accent-dark"
                          >
                            Data Privacy Policy
                          </a>
                          .
                        </>
                      ),
                    },
                    {
                      key: "cardConsent",
                      text: "I agree to provide consent for card data storage and authorize the merchant to process my transactions.",
                    },
                    {
                      key: "terms",
                      text: (
                        <>
                          I confirm that I have read and understood the{" "}
                          <a
                            href="#"
                            className="text-accent underline hover:text-accent-dark"
                          >
                            Terms & Conditions
                          </a>
                          .
                        </>
                      ),
                    },
                  ].map(({ key, text }) => (
                    <label key={key} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={acknowledgements[key]}
                        onChange={() =>
                          setAcknowledgements((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                        className="mt-1 w-5 h-5 accent-[#c19a6b]"
                      />
                      <span>{text}</span>
                    </label>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <button
                    type="submit"
                    className={`px-8 py-3 rounded-lg font-semibold text-lg shadow-md transition-colors duration-300 ${
                      Object.values(acknowledgements).every(Boolean)
                        ? "bg-accent hover:bg-accent-dark text-white"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    Confirm Booking
                  </button>
                </div>
              </section>
            </form>
          )}
        </motion.div>

        {/* RIGHT: PRICE DETAILS */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 h-fit"
        >
          <h2 className="text-2xl font-bold text-primary mb-6">
            Price Details
          </h2>

          {cartData.length > 0 ? (
            <>
              {/* Display cart items */}
              {cartData.map((item, index) => {
                const room = item.room || {};
                const services = item.services || [];
                
                return (
                  <div key={index} className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                    {/* Room info */}
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Room {index + 1}: {room.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.checkIn} - {item.checkOut} ({item.nights} nights)
                      </p>
                      <p className="text-sm text-gray-600">
                        Guests: {item.adults} Adults, {item.children} Children
                      </p>
                      <p className="text-accent font-semibold text-lg">
                        Room: ${((room.price || 0) * (item.nights || 1)).toFixed(2)}
                      </p>
                    </div>

                    {/* Services info */}
                    {services.length > 0 && (
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Services:</p>
                        {services.map((service, serviceIndex) => (
                          <div key={serviceIndex} className="text-sm text-gray-600">
                            • {service.service?.name}: ${service.totalPrice}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-gray-700 text-lg">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-lg">
                  <span>Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between text-xl font-bold text-primary">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* PDF BUTTON */}
              <div className="text-center mt-8">
                <button
                  onClick={generateInvoicePDF}
                  disabled={cartData.length === 0}
                  className={`px-6 py-3 rounded-lg shadow-md transition-all duration-300 font-medium w-full ${
                    cartData.length > 0
                      ? "bg-[#102E50] hover:bg-[#0a1f3a] text-white cursor-pointer hover:scale-[1.02] active:scale-95"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                   Download Invoice (PDF)
                </button>
                
                {cartData.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Professional invoice with your details
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No items in cart</p>
              <button
                onClick={() => navigate("/booking")}
                className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Book Rooms
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Checkout;