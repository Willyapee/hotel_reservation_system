import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import SuccessPopup from "../components/SuccessPopup";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await axios.post('http://localhost:3000/auth/login', {
                email,
                password,
            }, {
                withCredentials: true // Tambahkan ini untuk cookie
            });

            console.log('Response:', res.data);

            if (res.data.token) {
                // Simpan token dan role di localStorage
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('role', res.data.role);
                
                // Simpan username sementara (nanti akan di-fetch dari /auth/me)
                // Untuk sementara, gunakan email sebagai username
                const username = email.split('@')[0];
                localStorage.setItem('username', username);
                
                // Tampilkan popup sukses
                setPopupMessage("Login successful! Welcome back to Nyx Hotel.");
                setShowSuccessPopup(true);
            }
        } catch (err) {
            console.error(err.response ? err.response.data : err.message);
            alert(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePopupClose = () => {
        setShowSuccessPopup(false);
        // Redirect berdasarkan role setelah popup ditutup
        const role = localStorage.getItem('role');
        if (role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/');
            window.location.reload(); // Tambahkan reload untuk update NavigationBar & MenuOverlay
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Video Background */}
            <div className="absolute inset-0 w-full h-full">
                <video
                    src="/video/Resort.mp4"
                    className="h-full w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
            </div>

            {/* Back to Home Button */}
            <button
                onClick={handleBackToHome}
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white bg-[#102E50] hover:bg-[#1a3a5f] px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:scale-105"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Home</span>
            </button>

            {/* Main Card */}
            <div className="relative w-full max-w-md bg-[#fffcfc96] backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden z-10">
                
                <div className="bg-[#102e50fc] p-5 text-center flex items-center gap-4">
                    <div className="flex justify-center">
                        <img src='../picture/logo/logoNoBG.png' className='w-20 h-auto' alt="Nyx Hotel" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-3">
                        {/* Form fields tetap sama */}
                        <div className="relative">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent transition-all duration-300"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#c19a6b] to-[#a67c52] text-white font-semibold mt-5 py-3 px-4 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-[#c19a6b] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="text-[#102e50] hover:text-[#195aa4] font-semibold transition-colors duration-300"
                            >
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Popup */}
            {showSuccessPopup && (
                <SuccessPopup 
                    message={popupMessage} 
                    onClose={handlePopupClose}
                />
            )}
        </div>
    );
};

export default Login;