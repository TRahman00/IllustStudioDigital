import express from 'express';

const router = express.Router();

router.get('/profile/:id', (req, res) => {
  res.status(200).json({ message: 'User profile fetched' });
});

export default router;