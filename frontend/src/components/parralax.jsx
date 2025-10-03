export default function Parallax() {
  return (
    <section
      className="relative w-full h-[40rem] bg-fixed bg-center bg-cover flex items-center justify-center"
      style={{ backgroundImage: "url('/picture/parralaxWall.png')" }} 
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative text-center text-white px-4 md:px-6"> 
        <h2 className="text-4xl md:text-6xl font-bold mb-10 drop-shadow-lg">
          Our Achievements
        </h2>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-8"> 
          
          <div className="w-full max-w-[200px] bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-2xl hover:scale-105 transition-transform duration-300">
            <img
              src="picture/logo/award1.png"
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-3"
              alt="Best Luxury Hotel Award"
            />
            <p className="font-semibold text-sm sm:text-base">Best Luxury Hotel 2024</p>
          </div>

          <div className="w-full max-w-[200px] bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-2xl hover:scale-105 transition-transform duration-300">
            <img
              src="picture/logo/award2.png"
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-3"
              alt="Top 5 Hotels in Asia Award"
            />
            <p className="font-semibold text-sm sm:text-base">Top 5 Hotels in Asia</p>
          </div>

          <div className="w-full max-w-[200px] bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-2xl hover:scale-105 transition-transform duration-300">
            <img
              src="picture/logo/award3.png"
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-3"
              alt="5-Star Excellence Award"
            />
            <p className="font-semibold text-sm sm:text-base">5-Star Excellence 2025</p>
          </div>
        </div>
      </div>
    </section>
  );
}