import express from 'express';
import cors from 'cors';
import handler from './api/backend.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins since frontend is on Cloudflare
app.use(cors({ origin: '*' }));

// Parse JSON payloads (Vercel does this automatically, Express needs this)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount the Vercel handler
app.all('/api/backend', async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error("Backend Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Innovexa Hub Backend is running.');
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on port ${PORT}`);
});
