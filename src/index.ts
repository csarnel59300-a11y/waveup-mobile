import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Routes
app.get('/api/auth/authorize', (req, res) => {
  res.json({ message: 'Use Vercel functions instead' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WaveUp Backend running on port ${PORT}`);
});

export default app;
