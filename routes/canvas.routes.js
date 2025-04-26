import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import CanvasModel from '../models/canvas.model.js';

const router = express.Router();

// Get canvas data by project ID
router.get('/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const canvasData = await CanvasModel.findOne({ projectId });
        
        if (!canvasData) {
            return res.status(404).json({ message: 'Canvas data not found' });
        }
        
        res.json(canvasData);
    } catch (error) {
        console.error('Error fetching canvas data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Save canvas data
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { projectId, imageData, shapes } = req.body;
        
        if (!projectId || !imageData) {
            return res.status(400).json({ message: 'Project ID and image data are required' });
        }
        
        const updateData = { 
            projectId,
            imageData,
            lastModified: new Date(),
            lastModifiedBy: req.user._id
        };
        
        // Add shapes if provided
        if (shapes) {
            updateData.shapes = shapes;
        }
        
        // Find and update or create new canvas data
        const updatedCanvas = await CanvasModel.findOneAndUpdate(
            { projectId },
            updateData,
            { new: true, upsert: true }
        );
        
        res.json({
            message: 'Canvas data saved successfully',
            lastModified: updatedCanvas.lastModified
        });
    } catch (error) {
        console.error('Error saving canvas data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete canvas data
router.delete('/:projectId', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params;
        
        await CanvasModel.findOneAndDelete({ projectId });
        
        res.json({ message: 'Canvas data deleted successfully' });
    } catch (error) {
        console.error('Error deleting canvas data:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router; 