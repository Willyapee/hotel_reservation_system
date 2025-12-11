import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
    const [topSpenders, setTopSpenders] = useState([]);
    const [loyaltyAnalytics, setLoyaltyAnalytics] = useState(null);
    const [loading, setLoading] = useState({ topSpenders: false, loyalty: false });
    const [activeTab, setActiveTab] = useState('spenders');

    // Fungsi untuk mengambil token dari cookie
    const getTokenFromCookie = () => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'token') {
                return value;
            }
        }
        return null;
    };

    useEffect(() => {
        console.log('🔍 Analytics component mounted');
        fetchTopSpenders();
        fetchLoyaltyAnalytics();
    }, []);

    const fetchTopSpenders = async () => {
        setLoading(prev => ({ ...prev, topSpenders: true }));
        try {
            console.log('💰 Fetching top spenders...');
            
            // Buat config dengan credentials
            const config = {
                withCredentials: true, // Ini penting untuk mengirim cookie
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            // Coba ambil token dari localStorage atau cookie
            const token = localStorage.getItem('token') || getTokenFromCookie();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('🔐 Token found, adding to request');
            }

            const res = await axios.get('http://localhost:3000/analytics/top-spenders', config);
            console.log('✅ Top spenders response:', res.data);
            
            if (res.data.success) {
                setTopSpenders(res.data.topSpenders || []);
            } else {
                console.warn('⚠️ Top spenders API returned success: false', res.data);
            }
        } catch (err) {
            console.error('❌ Error fetching top spenders:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
            
            // Jika unauthorized, coba refresh atau tampilkan pesan
            if (err.response?.status === 401) {
                console.log('🔐 Unauthorized - Please login as admin');
                // Bisa tambahkan logic untuk redirect ke login
            }
        } finally {
            setLoading(prev => ({ ...prev, topSpenders: false }));
        }
    };

    const fetchLoyaltyAnalytics = async () => {
        setLoading(prev => ({ ...prev, loyalty: true }));
        try {
            console.log('📊 Fetching loyalty analytics...');
            
            const config = {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const token = localStorage.getItem('token') || getTokenFromCookie();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            const res = await axios.get('http://localhost:3000/analytics/customer-loyalty', config);
            console.log('✅ Loyalty analytics response:', res.data);
            
            if (res.data.success) {
                setLoyaltyAnalytics(res.data);
            } else {
                console.warn('⚠️ Loyalty analytics API returned success: false', res.data);
            }
        } catch (err) {
            console.error('❌ Error fetching loyalty analytics:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
        } finally {
            setLoading(prev => ({ ...prev, loyalty: false }));
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '$0.00';
        const num = parseFloat(amount);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    const getRankBadgeClass = (index) => {
        switch(index) {
            case 0: return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
            case 1: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
            case 2: return 'bg-gradient-to-r from-amber-700 to-amber-800 text-white';
            default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700';
        }
    };

    const prepareSpendingChartData = () => {
        return topSpenders.slice(0, 8).map((user, index) => ({
            name: user.username?.length > 10 ? user.username.substring(0, 10) + '...' : user.username || `User ${index + 1}`,
            amount: user.totalSpent || 0,
            bookings: user.totalBookings || 0,
            rank: index + 1
        }));
    };

    const prepareLoyaltyPieData = () => {
        if (!loyaltyAnalytics) return [];
        return [
            { name: 'New Customers', value: loyaltyAnalytics.analytics?.newCustomers || 0, color: '#10B981' },
            { name: 'Loyal Customers', value: loyaltyAnalytics.analytics?.loyalCustomers || 0, color: '#F59E0B' }
        ];
    };

    const COLORS = ['#10B981', '#F59E0B'];

    return (
        <div className="w-full h-full p-6 flex flex-col">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Hotel Analytics Dashboard</h1>
                <p className="text-gray-600">Comprehensive insights into customer behavior and spending patterns</p>
            </div>

            {/* Tabs */}
            <div className="flex mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('spenders')}
                    className={`px-4 py-3 text-lg font-medium transition-colors ${activeTab === 'spenders' ? 'text-[#c19a6b] border-b-2 border-[#c19a6b]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    💰 Top Spenders
                </button>
                <button
                    onClick={() => setActiveTab('loyalty')}
                    className={`px-4 py-3 text-lg font-medium transition-colors ${activeTab === 'loyalty' ? 'text-[#c19a6b] border-b-2 border-[#c19a6b]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    👥 Customer Loyalty
                </button>
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-3 text-lg font-medium transition-colors ${activeTab === 'overview' ? 'text-[#c19a6b] border-b-2 border-[#c19a6b]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    📊 Overview
                </button>
            </div>

            {/* Authentication Warning */}
            {(topSpenders.length === 0 && !loading.topSpenders) && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700">
                        <strong>Note:</strong> Analytics data requires admin authentication. 
                        Make sure you're logged in as an admin user.
                    </p>
                </div>
            )}

            {/* Top Spenders Tab */}
            {activeTab === 'spenders' && (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                            <div className="text-sm text-gray-600 font-medium">Total Revenue</div>
                            <div className="text-2xl font-bold text-gray-800 mt-2">
                                {formatCurrency(topSpenders.reduce((sum, user) => sum + (user.totalSpent || 0), 0))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">From top customers</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                            <div className="text-sm text-gray-600 font-medium">Average Spending</div>
                            <div className="text-2xl font-bold text-gray-800 mt-2">
                                {topSpenders.length > 0 
                                    ? formatCurrency(topSpenders.reduce((sum, user) => sum + (user.totalSpent || 0), 0) / topSpenders.length)
                                    : '$0.00'
                                }
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Per customer</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                            <div className="text-sm text-gray-600 font-medium">Total Bookings</div>
                            <div className="text-2xl font-bold text-gray-800 mt-2">
                                {topSpenders.reduce((sum, user) => sum + (user.totalBookings || 0), 0)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">From top customers</div>
                        </div>
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                            <div className="text-sm text-gray-600 font-medium">Top Spender</div>
                            <div className="text-xl font-bold text-gray-800 mt-2 truncate">
                                {topSpenders[0]?.username || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                                {topSpenders[0] ? formatCurrency(topSpenders[0].totalSpent) : 'No data'}
                            </div>
                        </div>
                    </div>

                    {/* Chart and Table */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Spending Chart */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Top Spenders Visualization</h3>
                            {loading.topSpenders ? (
                                <div className="h-64 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c19a6b] border-t-transparent"></div>
                                </div>
                            ) : topSpenders.length > 0 ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={prepareSpendingChartData()}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="name" stroke="#6b7280" />
                                            <YAxis stroke="#6b7280" />
                                            <Tooltip 
                                                formatter={(value) => [formatCurrency(value), 'Amount']}
                                                labelStyle={{ color: '#374151' }}
                                            />
                                            <Legend />
                                            <Bar dataKey="amount" name="Total Spent" fill="#c19a6b" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                                    <div className="w-16 h-16 mb-4 text-gray-300">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <p className="font-medium">No spending data available</p>
                                    <p className="text-sm mt-2">Make sure:</p>
                                    <ul className="text-xs text-gray-400 mt-1 text-center">
                                        <li>1. You're logged in as admin</li>
                                        <li>2. Customers have made paid bookings</li>
                                        <li>3. Invoice status is "paid"</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Leaderboard */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Top Spenders Leaderboard</h3>
                                <button 
                                    onClick={fetchTopSpenders}
                                    disabled={loading.topSpenders}
                                    className="flex items-center gap-2 bg-[#c19a6b] hover:bg-[#a67c52] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading.topSpenders ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Refreshing...
                                        </>
                                    ) : 'Refresh'}
                                </button>
                            </div>
                            
                            {loading.topSpenders ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#c19a6b] border-t-transparent"></div>
                                </div>
                            ) : topSpenders.length > 0 ? (
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {topSpenders.map((user, index) => (
                                        <div key={user.id || index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${getRankBadgeClass(index)} mr-4`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-800">{user.username || `User ${user.id}`}</div>
                                                <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-800">{formatCurrency(user.totalSpent)}</div>
                                                <div className="text-sm text-gray-500">{user.totalBookings || 0} bookings</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="font-medium">No spending data available</p>
                                    <p className="text-sm">Customers need to make bookings first</p>
                                    <button 
                                        onClick={fetchTopSpenders}
                                        className="mt-4 text-sm text-[#c19a6b] hover:underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Loyalty Tab */}
            {activeTab === 'loyalty' && (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    {loyaltyAnalytics && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                                <div className="text-sm text-gray-600 font-medium">Period</div>
                                <div className="text-2xl font-bold text-gray-800 mt-2">
                                    {loyaltyAnalytics.period || 'Current'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Current month/year</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                                <div className="text-sm text-gray-600 font-medium">Total Customers</div>
                                <div className="text-2xl font-bold text-gray-800 mt-2">
                                    {loyaltyAnalytics.analytics?.totalCustomers || 0}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Active this month</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                                <div className="text-sm text-gray-600 font-medium">New Customers</div>
                                <div className="text-2xl font-bold text-gray-800 mt-2">
                                    {loyaltyAnalytics.analytics?.newCustomers || 0}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {loyaltyAnalytics.analytics?.totalCustomers > 0 
                                        ? `${Math.round(((loyaltyAnalytics.analytics?.newCustomers || 0) / loyaltyAnalytics.analytics?.totalCustomers) * 100)}% of total`
                                        : '0%'
                                    }
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                                <div className="text-sm text-gray-600 font-medium">Loyalty Rate</div>
                                <div className="text-2xl font-bold text-gray-800 mt-2">
                                    {loyaltyAnalytics.analytics?.loyaltyRate || '0%'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {loyaltyAnalytics.analytics?.loyalCustomers || 0} loyal customers
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pie Chart */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Customer Distribution</h3>
                                <button 
                                    onClick={fetchLoyaltyAnalytics}
                                    disabled={loading.loyalty}
                                    className="flex items-center gap-2 bg-[#c19a6b] hover:bg-[#a67c52] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading.loyalty ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Refreshing...
                                        </>
                                    ) : 'Refresh'}
                                </button>
                            </div>
                            
                            {loading.loyalty ? (
                                <div className="h-64 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c19a6b] border-t-transparent"></div>
                                </div>
                            ) : loyaltyAnalytics ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={prepareLoyaltyPieData()}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {prepareLoyaltyPieData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [value, 'Customers']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                                    <div className="w-16 h-16 mb-4 text-gray-300">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <p className="font-medium">No loyalty data available</p>
                                    <p className="text-sm mt-2">Make sure:</p>
                                    <ul className="text-xs text-gray-400 mt-1 text-center">
                                        <li>1. You're logged in as admin</li>
                                        <li>2. Customers have bookings this month</li>
                                        <li>3. Invoices are paid</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Monthly Trends */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Monthly Trends (Last 3 Months)</h3>
                            {loyaltyAnalytics?.analytics?.monthlyTrends ? (
                                <div className="space-y-6">
                                    {loyaltyAnalytics.analytics.monthlyTrends.map((trend, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">{trend.month}</span>
                                                <span className="text-sm text-gray-500">
                                                    {Math.round(((trend.loyal || 0) / ((trend.new || 0) + (trend.loyal || 0))) * 100) || 0}% loyal
                                                </span>
                                            </div>
                                            <div className="flex h-6 rounded-lg overflow-hidden">
                                                <div 
                                                    className="bg-green-400 flex items-center justify-center text-xs text-white font-medium"
                                                    style={{ width: `${(((trend.new || 0) / ((trend.new || 0) + (trend.loyal || 0))) * 100) || 0}%` }}
                                                >
                                                    {trend.new || 0} New
                                                </div>
                                                <div 
                                                    className="bg-amber-500 flex items-center justify-center text-xs text-white font-medium"
                                                    style={{ width: `${(((trend.loyal || 0) / ((trend.new || 0) + (trend.loyal || 0))) * 100) || 0}%` }}
                                                >
                                                    {trend.loyal || 0} Loyal
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    No trend data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">Total Users</span>
                                    <span className="font-bold text-gray-800">-</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">Active Reservations</span>
                                    <span className="font-bold text-gray-800">-</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">Monthly Revenue</span>
                                    <span className="font-bold text-gray-800">-</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Export Reports</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={fetchTopSpenders}
                                    className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            📊
                                        </div>
                                        <span className="font-medium">Export Spending Report</span>
                                    </div>
                                    <span className="text-blue-600">→</span>
                                </button>
                                <button 
                                    onClick={fetchLoyaltyAnalytics}
                                    className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            👥
                                        </div>
                                        <span className="font-medium">Export Loyalty Report</span>
                                    </div>
                                    <span className="text-green-600">→</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-[#c19a6b] rounded-full flex items-center justify-center text-white">
                                    1
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">Analytics Dashboard Accessed</div>
                                    <div className="text-sm text-gray-500">Admin viewed analytics page</div>
                                </div>
                                <div className="text-sm text-gray-400">Just now</div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-[#c19a6b] rounded-full flex items-center justify-center text-white">
                                    2
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">Data Refresh</div>
                                    <div className="text-sm text-gray-500">Fetched latest analytics data</div>
                                </div>
                                <div className="text-sm text-gray-400">Just now</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}