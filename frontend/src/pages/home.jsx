import './home.css';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
          <button 
            className="book-btn"
            onClick={() => navigate("/book")}
          >
            Book a Room
          </button>
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

      {/* Dine Section */}
      <section id="dine" className="px-8 py-16 h-96 p-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-600 mb-4">Dine With Us</h2>
          <h3 className="text-lg text-gray-400 mb-10">
            Experience culinary excellence at our on-site restaurants and bars,
            offering a variety of gourmet dishes and drinks.
          </h3>
        </div>
        <Carousel cards={cards} maxVisibility={3} />
      </section>

      {/* Footer */}
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

export default Home;
