import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavigationBar from "../components/navigationBar.jsx";
import Introduction from "../components/introduction.jsx";  
import RoomDisplay from "../components/roomDisplay.jsx";
import Carousel from "../components/carousel.jsx";
import Facility from "../components/facility.jsx";
import InfiniteScrollText from "../components/infiniteScrollText.jsx";
import Parallax from "../components/parralax.jsx";
import Footer from "../components/footer.jsx";
import MenuOverlay from "../components/menuOverlay.jsx";

export default function HomePage() {
  const [openMenu, setOpenMenu] = useState(false);
  const [showFloating, setShowFloating] = useState(true);

  const handleOpenMenu = () => setOpenMenu(!openMenu);
  const handleCloseMenu = () => setOpenMenu(false);

  const handleNavigateToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      
      {/* Menu Overlay */}
      <MenuOverlay 
        isOpen={openMenu} 
        onClose={handleCloseMenu}
        onNavigate={handleNavigateToSection}
      />

      <section id="introduction">
        <Introduction />
      </section>
      

      <section className="w-full bg-[#fbfaf9] py-16">
        <div className="w-[90%] h-[35rem] relative overflow-hidden justify-center items-center mx-auto rounded-xl shadow-lg">
          <video
            src="public/video/ChevalBlanc.mp4"
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          ></video>
        </div>
      </section>

      <section id="facilities">
        <Facility />
      </section>

      <InfiniteScrollText />
      
      <section id="rooms" className="bg-[#fbfaf9] px-0 py-20">
        <h2 className="text-center text-4xl font-bold text-[#333] mb-4">
          Rooms & Suites
        </h2>
        <h3 className="text-center text-xl text-[#666] mb-10">
          A range of accommodations from intimate suites to private penthouses.
          Each room carefully designed for comfort and alpine views.
        </h3>
        <RoomDisplay />
      </section>

      <div id="dine" className="px-8 py-20 bg-[#fbfaf9]">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-[#333] mb-4">Dine With Us</h2>
          <h3 className="text-xl text-[#666]">
            Experience culinary excellence at our on-site restaurants and bars,
            offering a variety of gourmet dishes and drinks.
          </h3>
        </div>
        <Carousel />
      </div>

      {showFloating && (
        <div className="fixed bottom-6 right-6 z-30">
          <Link
            to="/booking"
            className="bg-[#c19a6b] hover:bg-[#a67c52] text-white px-6 py-3 rounded-full shadow-lg transition-colors duration-300"
          >
            Book Now
          </Link>
        </div>
      )}

      <Parallax />

      <Footer />
    </div>
  );
}