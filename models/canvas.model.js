import mongoose from 'mongoose';

const canvasSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    imageData: {
        type: String,
        required: true
    },
    shapes: {
        type: String,
        default: '[]'
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const CanvasModel = mongoose.model('Canvas', canvasSchema);

export default CanvasModel;