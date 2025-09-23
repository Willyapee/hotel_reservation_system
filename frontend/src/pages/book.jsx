import React, { useState } from "react";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import "react-date-range/dist/styles.css"; 
import "react-date-range/dist/theme/default.css"; 
import "./book.css";

function Book() {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: "selection",
    },
  ]);

  return (
    <div className="book-container">
      <h2>Book Your Stay</h2>

      <div className="booking-box">
        <div className="booking-field">
          <label>Check-in</label>
          <button onClick={() => setOpenCalendar(!openCalendar)}>
            {date[0].startDate.toDateString()}
          </button>
        </div>

        <div className="booking-field">
          <label>Check-out</label>
          <button onClick={() => setOpenCalendar(!openCalendar)}>
            {date[0].endDate.toDateString()}
          </button>
        </div>
      </div>

      {openCalendar && (
        <div className="calendar-popup">
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setDate([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={date}
            minDate={new Date()}
          />
        </div>
      )}

      {/* Template contoh kamar */}
      <div className="room-list">
        <div className="room-card">
          <div
            className="room-img"
            style={{ backgroundImage: "url(/room/sample.jpg)" }}
          ></div>
          <div className="room-info">
            <h3>Deluxe Room</h3>
            <p>1 King Bed • 45m²</p>
            <p>Large open bay windows, separate dressing room, complimentary minibar.</p>
            <button className="reserve-btn">Reserve Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Book;
