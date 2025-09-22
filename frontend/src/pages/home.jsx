import './home.css';
import React, { useState } from "react";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? "✖" : "☰"}
      </button>

      <nav className={`sidebar ${menuOpen ? "active" : ""}`}>
        <h2>Nyx Hotel</h2>
        <ul>
          <li><a href="#rooms">Check Our Rooms</a></li>
          <li><a href="#dine">Dine With Us</a></li>
          <li><a href="#facilities">Our Facilities</a></li>
        </ul>
      </nav>

      {/* Video Section */}
      <section className="video-section">
        <video autoPlay muted loop>
          <source src="video/Resort.mp4" type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
        <div className="video-overlay"></div>
        <div className="title-content">
          <h2>Nyx Hotel</h2>
          <button className="book-btn">Book a Room</button>
        </div>
      </section>

      {/* Features Section */}
      <section id="rooms">
        <div>
          <h2>Rooms & Suites</h2>
          <h3 className="room-title-text">
            A range of accommodations from intimate suites to private penthouses. Each room carefully
            designed for comfort and alpine views.
          </h3>
          <div className="cards">
            <div className="card">
              <div
                className="media"
                style={{
                  backgroundImage: "url(/room/room1.jpg)",
                }}
              ></div>
              <div className="content">
                <h4>Stellar Suite</h4>
                <p className="meta">King bed • 40m²</p>
                <p>
                  Warm materials, elegant furnishings and sweeping view of the slopes.
                </p>
              </div>
            </div>
            <div className="card">
              <div
                className="media"
                style={{
                  backgroundImage: "url(/room/room3.jpg)",
                }}
              ></div>
              <div className="content">
                <h4>Orion Room</h4>
                <p className="meta">King bed • Living area</p>
                <p>
                  Separate living room, refined details and private balcony.
                </p>
              </div>
            </div>
            <div className="card">
              <div
                className="media"
                style={{
                  backgroundImage: "url(/room/room7.jpg)",
                }}
              ></div>
              <div className="content">
                <h4>Luna Suite</h4>
                <p className="meta">Two bedrooms • Terrace</p>
                <p>
                  Expansive terrace, private services and panoramic vistas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dine" className="flex flex-col md:flex-row items-start gap-8 px-8 py-16">
  {/* Left Column */}
  <div className="md:w-1/2">
    <h2 className="text-3xl font-bold mb-4">Dine With Us</h2>
    <h3 className="text-lg text-gray-600">
      Experience culinary excellence at our on-site restaurants and bars,
      offering a variety of gourmet dishes and drinks.
    </h3>
  </div>

  {/* Right Column: Vertical Slider */}
  <div className="md:w-1/2 h-[400px] overflow-y-auto space-y-6 pr-2 custom-scroll">
    {/* Card 1 */}
    <div className="bg-white shadow-lg rounded-xl overflow-hidden flex">
      <div
        className="w-40 h-40 bg-cover bg-center"
        style={{ backgroundImage: "url(/dine/dine1.jpg)" }}
      ></div>
      <div className="p-4 flex flex-col justify-center">
        <h4 className="text-xl font-semibold">Skyline Restaurant</h4>
        <p className="text-sm text-gray-500">Fine Dining</p>
        <p className="text-gray-600">
          Enjoy panoramic views while savoring gourmet dishes crafted from local ingredients.
        </p>
      </div>
    </div>

    {/* Card 2 */}
    <div className="bg-white shadow-lg rounded-xl overflow-hidden flex">
      <div
        className="w-40 h-40 bg-cover bg-center"
        style={{ backgroundImage: "url(/dine/dine2.jpg)" }}
      ></div>
      <div className="p-4 flex flex-col justify-center">
        <h4 className="text-xl font-semibold">The Lounge</h4>
        <p className="text-sm text-gray-500">Casual Dining</p>
        <p className="text-gray-600">
          A relaxed atmosphere offering a diverse menu of international cuisine and cocktails.
        </p>
      </div>
    </div>

    {/* Card 3 */}
    <div className="bg-white shadow-lg rounded-xl overflow-hidden flex">
      <div
        className="w-40 h-40 bg-cover bg-center"
        style={{ backgroundImage: "url(/dine/dine3.jpg)" }}
      ></div>
      <div className="p-4 flex flex-col justify-center">
        <h4 className="text-xl font-semibold">Bar Celeste</h4>
        <p className="text-sm text-gray-500">Cocktails & More</p>
        <p className="text-gray-600">
          Unwind with expertly crafted cocktails and a curated selection of wines and spirits.
        </p>
      </div>
    </div>
  </div>
</section>


      <footer>
        <div className="social-icons">
          <a href=""><i className="fa-brands fa-instagram"></i></a>
          <a href=""><i className="fa-brands fa-facebook"></i></a>
          <a href=""><i className="fa-brands fa-twitter"></i></a>
        </div>
        <div className="footer-links">
          <a href="#">Work With Us</a>
          <a href="#">Contact Us</a>
          <a href="#">Privacy Policy</a>
        </div>
        <div className="footer-bottom">
          © 2025 Nyx Hotel | All Rights Reserved
        </div>
      </footer>
    </>
  );
}

export default App;

