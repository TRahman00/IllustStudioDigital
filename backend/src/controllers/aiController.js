import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function chat(req, res, next) {
  try {
    if (req.user.plan !== 'premium') return res.status(403).json({ message: 'The AI assistant is a Premium feature.' });
    if (!genAI) return res.status(501).json({ message: 'Gemini is not configured yet. Add GEMINI_API_KEY to backend/.env.' });
    const { message } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(
      `You are the in-app assistant for Illust Studio, a digital illustration, photo-editing and animation tool. Answer concisely.\n\nQuestion: ${message}`
    );
    res.json({ reply: result.response.text() });
  } catch (err) { next(err); }
}

export async function interpolate(req, res, next) {
  try {
    if (req.user.plan !== 'premium') return res.status(403).json({ message: 'AI in-betweening is a Premium feature.' });
    const { frameA, frameB, steps } = req.body;
    if (!frameA || !frameB) return res.status(400).json({ message: 'frameA and frameB (data URLs) are required' });
    res.json({ steps: Math.min(8, Math.max(1, steps || 3)) });
  } catch (err) { next(err); }
}