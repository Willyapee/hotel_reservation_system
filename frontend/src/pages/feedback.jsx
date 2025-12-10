import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FeedbackForm from '../components/feedbackForm';
import FeedbackList from '../components/feedbackList';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const [refreshList, setRefreshList] = useState(0);

    const handleFeedbackSubmit = () => {
        // Trigger useEffect di FeedbackList dengan mengubah state angka
        setRefreshList(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-[#fbfaf9] font-[Times_New_Roman]">
            {/* HEADER */}
            <div className="w-full h-20 fixed flex items-center px-4 py-2 bg-[#102E50] z-20 shadow-md">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-white bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Home</span>
                </button>
                <div className="ml-6">
                    <h1 className="text-2xl font-bold text-white tracking-wide">Guest Reviews</h1>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="pt-28 pb-10 px-4 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-10">
                    
                    {/* LEFT COLUMN: FORM */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28">
                            <FeedbackForm onFeedbackSubmit={handleFeedbackSubmit} />
                            
                            {/* Tambahan Info Sidebar */}
                            <div className="mt-6 bg-[#102E50] text-white p-6 rounded-2xl shadow-lg text-center">
                                <h4 className="text-xl font-serif mb-2">Thank You!</h4>
                                <p className="text-gray-300 text-sm">
                                    Your feedback helps us improve our services and provide a better experience for future guests.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: LIST */}
                    <div className="lg:col-span-2">
                        <div className="mb-6 flex items-end justify-between">
                            <div>
                                <h2 className="text-3xl font-serif font-bold text-[#102E50]">What Our Guests Say</h2>
                                <p className="text-gray-500 mt-1">Read genuine reviews from our beloved guests</p>
                            </div>
                        </div>
                        
                        <FeedbackList refreshTrigger={refreshList} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;