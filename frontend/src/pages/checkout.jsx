import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import "../css/checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);
  const [acknowledgements, setAcknowledgements] = useState({
    dataPolicy: false,
    cardConsent: false,
    terms: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem("cartData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setCartData(Array.isArray(parsed) ? parsed : [parsed]);
    }
  }, []);

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (Object.values(acknowledgements).every(Boolean)) {
      alert("✅ Booking Confirmed! Thank you for your reservation.");
      localStorage.removeItem("cartData");
      navigate("/");
    } else {
      alert("Please agree to all acknowledgements before confirming.");
    }
  };

  const subtotal = cartData.reduce(
    (acc, room) => acc + parseFloat(room.price || 0),
    0
  );
  const serviceFee = cartData.length > 0 ? 10 : 0;
  const total = subtotal + serviceFee;

  // blom gua ubah isinya masi template invoice
 const generateInvoicePDF = async () => {
  const doc = new jsPDF();
  
  const logoImg = new Image();
  logoImg.src = '/picture/logo/logo.png';
  
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
  
  // Invoice Details Box
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Invoice Number:", 140, 28);
  doc.text("Date of Issue:", 140, 33);
  doc.text("Payment Terms:", 140, 38);
  
  doc.setFont("helvetica", "bold");
  doc.text(`INV-${Date.now().toString().slice(-6)}`, 175, 28);
  doc.text(new Date().toLocaleDateString('en-US'), 175, 33);
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
  doc.text("Guest Name", 14, 62);
  doc.text("Guest Address", 14, 67);
  doc.text("City, State, Country", 14, 72);
  doc.text("ZIP Code", 14, 77);
  
  // Check if cart is empty
  if (cartData.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("No rooms currently booked.", 14, 95);
    doc.text("This is a sample invoice template.", 14, 102);
    
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for choosing Nyx Hotel", 105, 270, { align: "center" });
    doc.text("For inquiries, please contact us at info@nyxhotel.com", 105, 275, { align: "center" });
    
    doc.save("Nyx_Hotel_Invoice.pdf");
    return;
  }
  
  const tableData = cartData.map((room, index) => [
    index + 1,
    room.name || "Room",
    room.type || "Standard",
    `$${(room.price || 0).toFixed(2)}`,
    room.quantity || 1,
    `$${((room.price || 0) * (room.quantity || 1)).toFixed(2)}`
  ]);
  
  doc.autoTable({
    head: [["#", "Room Name", "Room Type", "Unit Price", "Nights", "Amount"]],
    body: tableData,
    startY: 85,
    theme: "striped",
    headStyles: { 
      fillColor: [193, 154, 107],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      halign: "center"
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { cellWidth: 50 },
      2: { cellWidth: 35 },
      3: { halign: "right", cellWidth: 28 },
      4: { halign: "center", cellWidth: 20 },
      5: { halign: "right", cellWidth: 28 }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    margin: { left: 14, right: 14 }
  });
  
  const finalY = doc.lastAutoTable.finalY + 10;
  
  const summaryX = 130;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(summaryX, finalY, 196, finalY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Subtotal:", summaryX, finalY + 8);
  doc.text("Service Fee:", summaryX, finalY + 15);
  doc.text("Tax (0%):", summaryX, finalY + 22);
  
  doc.setFont("helvetica", "normal");
  doc.text(`$${subtotal.toFixed(2)}`, 196, finalY + 8, { align: "right" });
  doc.text(`$${serviceFee.toFixed(2)}`, 196, finalY + 15, { align: "right" });
  doc.text(`$0.00`, 196, finalY + 22, { align: "right" });
  
  doc.setFillColor(193, 154, 107);
  doc.rect(summaryX, finalY + 27, 66, 10, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL:", summaryX + 3, finalY + 34);
  doc.text(`$${total.toFixed(2)}`, 193, finalY + 34, { align: "right" });
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(193, 154, 107);
  doc.text("Terms & Conditions:", 14, finalY + 50);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const terms = [
    "• Payment is due upon receipt of this invoice",
    "• Cancellation must be made 48 hours prior to check-in",
    "• Late cancellations may incur a fee of one night's stay",
    "• Check-in time: 3:00 PM | Check-out time: 11:00 AM"
  ];
  
  let termsY = finalY + 56;
  terms.forEach(term => {
    doc.text(term, 14, termsY);
    termsY += 5;
  });
  
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
  
  doc.save(`Nyx_Hotel_Invoice_${Date.now()}.pdf`);
};

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

          <form onSubmit={handleConfirmBooking} className="space-y-10">
            {/* CONTACT INFO */}
            <section>
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Contact Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Title *
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-accent">
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
                  <select className="w-full border border-gray-300 rounded-lg p-3">
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
              {cartData.map((room, index) => (
                <div
                  key={index}
                  className="space-y-2 border-b border-gray-200 pb-4 mb-4"
                >
                  <p className="text-lg font-medium text-gray-700">
                    Room {index + 1}: {room.name}
                  </p>
                  {room.desc && (
                    <p className="text-gray-600 text-sm">{room.desc}</p>
                  )}
                  <p className="text-accent font-semibold text-lg">
                    ${room.price} / night
                  </p>
                </div>
              ))}

              <div className="mt-6 flex justify-between text-gray-700 text-lg">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700 text-lg">
                <span>Service Fee</span>
                <span>${serviceFee}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-primary mt-4">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-600 mb-6">No item in cart.</p>
          )}

          {/* PDF BUTTON — SELALU ADA */}
          <div className="text-center mt-8">
            <button
              onClick={generateInvoicePDF}
              className="px-6 py-3 bg-accent text-white rounded-lg shadow-md hover:bg-accent-dark transition-colors duration-300"
            >
              Download Invoice (PDF)
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Checkout;
