// FILE PERCOBAANNYA WILLY GA NGARUH SAMA PROJEK KELEN
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../css/register.css";

const Register = () => {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  axios.defaults.withCredentials = true;

  const validatePassword = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    if (!validatePassword()) return;
    e.preventDefault(); 
    console.log(username, email, password);

    axios.post('http://localhost:3000/auth/register', {
        username,
        email,
        password
    }).then((res) => {
        if (res.status === 201) alert("Registration successful");
    }).catch((error) => {
        console.log(error);
    })
  };

  useEffect(() => {
    const particles = document.querySelector(".particles");
    const handleMouseMove = (e) => {
      const dot = document.createElement("div");
      dot.className = "dot";
      dot.style.left = `${e.pageX}px`;
      dot.style.top = `${e.pageY}px`;
      particles.appendChild(dot);
      setTimeout(() => dot.remove(), 1500);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0f29] flex flex-col lg:flex-row text-white font-sans">
      {/* Parallax star layers */}
      <div className="stars stars1"></div>
      <div className="stars stars2"></div>
      <div className="stars stars3"></div>
      <div className="particles"></div>

      {/* LEFT — form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative z-10">
        <div className="relative w-full max-w-md backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)] p-10 animate-fadein">
          <div className="absolute inset-0 rounded-3xl border border-[#b2aaff]/20 animate-orbit pointer-events-none"></div>

          <h1 className="text-3xl font-semibold text-center mb-6 tracking-wide text-[#d6d3ff]">
            Nyx Hotel Registration
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-[#e2e2ff] font-medium"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full mt-1 bg-white/10 text-white rounded-lg px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a2b4ff] transition-all duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[#e2e2ff] font-medium"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 bg-white/10 text-white rounded-lg px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a2b4ff] transition-all duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[#e2e2ff] font-medium"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 bg-white/10 text-white rounded-lg px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a2b4ff] transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-[#e2e2ff] font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 bg-white/10 text-white rounded-lg px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a2b4ff] transition-all duration-300"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-[#6f89ff] to-[#a8c4ff] text-[#0a0f29] font-semibold py-2 rounded-lg shadow-md hover:shadow-[0_0_15px_rgba(167,198,255,0.7)] hover:scale-[1.02] transition-all duration-500 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
              Register
            </button>
          </form>

          <p className="text-center mt-6 text-[#bdbdfb]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#ffd580] hover:text-[#ffe4a3] transition-all"
            >
              Login here
            </Link>
          </p>
        </div>
        
      </div>

      
    </div>
  );
};

export default Register;