import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavigationBar from "../components/navigationBar.jsx";
import RoomDisplay from "../components/roomDisplay.jsx";
import Carousel from "../components/carousel.jsx";
import Footer from "../components/footer.jsx";

export default function HomePage() {
  const [openMenu, setOpenMenu] = useState(false);
  const [showFloating, setShowFloating] = useState(true);

  const handleOpenMenu = () => setOpenMenu(!openMenu);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector("footer");
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        setShowFloating(footerTop > windowHeight);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full h-auto overflow-x-hidden">
      <NavigationBar openMenu={openMenu} handleOpenMenu={handleOpenMenu} />

      <div className="fixed top-5 right-8 z-50">
        <Link
          to="/booking"
          className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-300"
        >
          Book
        </Link>
      </div>

      <div className="w-full h-screen relative overflow-hidden">
        <video
          src="https://lvmh-chevalblanc.cdn.prismic.io/lvmh-chevalblanc/aCcrMCdWJ-7kSN-l_PaysageCBO.mp4"
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        ></video>
      </div>

      <section id="rooms" className="bg-[#fbfaf9] font-serif px-0 py-20">
        <h2 className="text-center text-3xl font-bold text-[#333] mb-4">
          Rooms & Suites
        </h2>
        <h3 className="text-center text-lg text-[#666] mb-10">
          A range of accommodations from intimate suites to private penthouses.
          Each room carefully designed for comfort and alpine views.
        </h3>
        <RoomDisplay />
      </section>

      <div id="dine" className="px-8 py-20 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#333] mb-4">Dine With Us</h2>
          <h3 className="text-lg text-[#666]">
            Experience culinary excellence at our on-site restaurants and bars,
            offering a variety of gourmet dishes and drinks.
          </h3>
        </div>
        <Carousel />
      </div>

      {showFloating && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link
            to="/booking"
            className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-full shadow-lg transition-colors duration-300"
          >
            Book Now
          </Link>
        </div>
      )}

      <Footer />
    </div>
  );
}
