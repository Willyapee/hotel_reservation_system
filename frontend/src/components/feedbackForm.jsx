import React, { useState } from 'react';
import { Star, Send, Loader, User, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const FeedbackForm = ({ onFeedbackSubmit }) => {
    const [formData, setFormData] = useState({
        guestName: '',
        rating: 0,
        message: ''
    });
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cek apakah user login dari localStorage untuk auto-fill nama (opsional)
    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setFormData(prev => ({ ...prev, guestName: user.name || '' }));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.rating === 0) {
            alert('Please select a star rating');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:3000/feedbacks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Penting agar backend bisa baca session user
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                alert('Thank you for your feedback!');
                setFormData({ ...formData, rating: 0, message: '' }); // Reset form kecuali nama
                if (onFeedbackSubmit) onFeedbackSubmit(); // Refresh list di parent
            } else {
                alert(result.message || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Server error, please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
        >
            <h3 className="text-2xl font-serif font-bold text-[#102E50] mb-2">Share Your Experience</h3>
            <p className="text-gray-500 mb-6">We value your opinion. Tell us about your stay.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Rating Input */}
                <div className="flex flex-col items-center p-4 bg-[#fbfaf9] rounded-xl border border-dashed border-gray-300">
                    <label className="text-sm font-semibold text-gray-600 mb-2">How would you rate us?</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setFormData({ ...formData, rating: star })}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110 focus:outline-none"
                            >
                                <Star 
                                    className={`w-8 h-8 ${
                                        star <= (hoverRating || formData.rating)
                                            ? 'fill-[#c19a6b] text-[#c19a6b]'
                                            : 'text-gray-300'
                                    }`} 
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-[#c19a6b] font-medium mt-2">
                        {formData.rating ? `${formData.rating} out of 5 stars` : 'Select stars'}
                    </p>
                </div>

                {/* Name Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            required
                            placeholder="Your Name"
                            value={formData.guestName}
                            onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Message Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                    <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                            required
                            rows="4"
                            placeholder="Tell us what you liked..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent outline-none transition-all resize-none"
                        ></textarea>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#102E50] hover:bg-[#1a406a] text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Submit Review
                </button>
            </form>
        </motion.div>
    );
};

export default FeedbackForm;