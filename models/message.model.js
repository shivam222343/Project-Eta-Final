import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    isAI: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster querying by project
messageSchema.index({ project: 1, createdAt: -1 });

const Message = mongoose.model('message', messageSchema);

export default Message;