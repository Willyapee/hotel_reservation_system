// backend/controllers/feedbackController.js
import Feedback from '../models/feedback.js';

export const createFeedback = async (req, res) => {
    try {
        const { rating, message, guestName } = req.body;
        const userId = req.user ? req.user.id : null; 

        const newFeedback = new Feedback({
            userId,
            guestName: guestName || (req.user ? req.user.username : 'Anonymous'),
            rating,
            message
        });

        await newFeedback.save();

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: newFeedback
        });
    } catch (error) {
        console.error('Create feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit feedback'
        });
    }
};

export const getAllFeedbacks = async (req, res) => {
    try {
       
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: feedbacks.length,
            data: feedbacks
        });
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feedbacks'
        });
    }
};