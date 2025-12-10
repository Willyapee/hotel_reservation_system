import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: Number, 
        required: false 
    },
    guestName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;