export async function chat(req, res, next) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const query = message.toLowerCase().trim();

    // Smart Local Rule-Based Responses for Illust Studio
    let reply = "I am Illust Studio's AI Assistant! I can help you with digital illustration, photo editing, and animation tools.";

    if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
      reply = "Hello! How can I assist you with Illust Studio today?";
    } else if (query.includes('tool') || query.includes('draw')) {
      reply = "Illust Studio provides digital canvas tools, layer support, frame interpolation for animation, and CAD integration!";
    } else if (query.includes('animation') || query.includes('interpolate')) {
      reply = "You can use our frame interpolation feature to smoothly transition between keyframes in your animation.";
    } else if (query.includes('price') || query.includes('plan') || query.includes('premium')) {
      reply = "Check out our Pricing section to unlock premium tools and unlimited AI features!";
    }

    return res.json({ reply });

  } catch (err) {
    console.error("AI Assistant Error:", err);
    res.status(500).json({ 
      message: 'Failed to generate response. Please try again.' 
    });
  }
}

export async function interpolate(req, res, next) {
  try {
    const { frameA, frameB, steps } = req.body;
    if (!frameA || !frameB) return res.status(400).json({ message: 'frameA and frameB (data URLs) are required' });
    res.json({ steps: Math.min(6, Math.max(1, steps || 3)) });
  } catch (err) {
    next(err);
  }
}