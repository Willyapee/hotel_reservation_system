import React from "react";
import { BedDouble, Coffee, MapPin } from "lucide-react"; 
//ini untuk ikon2 yang ada di introduction, harus install lucide-react dulu
//command: npm install lucide-react

export default function Introduction() {
  return (
    <section className="w-full bg-[#fbfaf9] py-20 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex justify-center mt-5">
          <img src='../picture/logo/logoNoBG.png' className='w-50' />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 mt-2">
          Welcome to <span className="text-yellow-600">Nyx Hotel</span>
        </h2>
        
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Discover comfort, elegance, and timeless luxury. Nyx Hotel offers 
          premium rooms, world-class dining, and unforgettable experiences 
          in the heart of the city.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          <div className="p-6 rounded-2xl shadow-md bg-white flex flex-col items-center">
            <BedDouble className="w-10 h-10 text-yellow-600 mb-4" />
            <h3 className="font-semibold text-xl text-gray-800">Luxury Rooms</h3>
            <p className="text-gray-500 mt-2 text-sm">Spacious, elegant, and designed for your comfort.</p>
          </div>

          <div className="p-6 rounded-2xl shadow-md bg-white flex flex-col items-center">
            <Coffee className="w-10 h-10 text-yellow-600 mb-4" />
            <h3 className="font-semibold text-xl text-gray-800">Fine Dining</h3>
            <p className="text-gray-500 mt-2 text-sm">Enjoy curated menus and world-class chefs.</p>
          </div>

          <div className="p-6 rounded-2xl shadow-md bg-white flex flex-col items-center">
            <MapPin className="w-10 h-10 text-yellow-600 mb-4" />
            <h3 className="font-semibold text-xl text-gray-800">Central Location</h3>
            <p className="text-gray-500 mt-2 text-sm">Perfectly located near cultural & business hubs.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
