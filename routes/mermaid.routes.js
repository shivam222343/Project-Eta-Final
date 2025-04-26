import express from 'express';
import mermaid from 'mermaid';

const router = express.Router();

// Configure mermaid for server-side rendering
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'default',
  // Disable puppeteer for server-side rendering if it's causing issues
  // puppeteerConfig: {
  //   args: ['--no-sandbox']
  // }
});

/**
 * @route POST /mermaid/render
 * @description Render a Mermaid diagram to SVG
 * @access Public
 */
router.post('/render', async (req, res) => {
  try {
    const { code, theme = 'default' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No mermaid code provided' });
    }

    // Configure mermaid with the selected theme
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: theme
    });

    try {
      // Render the diagram to SVG
      const diagramId = `mermaid-diagram-${Date.now()}`;
      const { svg } = await mermaid.render(diagramId, code);
      
      return res.json({ svg });
    } catch (renderError) {
      // If server-side rendering fails, return a detailed error
      console.error('Mermaid rendering error:', renderError);
      return res.status(400).json({ 
        error: 'Invalid diagram syntax', 
        details: renderError.message 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

export default router; 