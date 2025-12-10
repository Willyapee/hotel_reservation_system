import React, { useEffect, useState } from 'react';
import { Star, Quote, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const FeedbackList = ({ refreshTrigger }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeedbacks = async () => {
        try {
            const response = await fetch('http://localhost:3000/feedbacks');
            const result = await response.json();
            if (result.success) {
                setFeedbacks(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Refetch jika ada trigger baru (misal setelah submit form)
    useEffect(() => {
        fetchFeedbacks();
    }, [refreshTrigger]);

    if (loading) {
        return (
            <div className="flex justify-center p-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#c19a6b]"></div>
            </div>
        );
    }

    if (feedbacks.length === 0) {
        return (
            <div className="text-center p-10 bg-gray-50 rounded-xl border border-dashed">
                <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacks.map((item, index) => (
                <motion.div
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                    {/* Decorative Quote Icon */}
                    <Quote className="absolute top-4 right-4 w-10 h-10 text-gray-100 rotate-180 group-hover:text-[#fbfaf9] transition-colors" />
                    
                    <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < item.rating ? 'fill-[#c19a6b] text-[#c19a6b]' : 'text-gray-200'}`} 
                            />
                        ))}
                    </div>

                    <p className="text-gray-600 italic mb-4 line-clamp-3 relative z-10">
                        "{item.message}"
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                        <div>
                            <h4 className="font-bold text-[#102E50]">{item.guestName}</h4>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Verified Guest</span>
                        </div>
                        <div className="flex items-center text-gray-400 text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                            })}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default FeedbackList;