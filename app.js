import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import messageRouter from './routes/message.routes.js';

dotenv.config();

// Connect to database
connect();

const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://eta-frontend.netlify.app',
  'https://project-eta.netlify.app/' 
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept'
    ],
    exposedHeaders: ['Set-Cookie', 'Authorization']
  })
);

// Handle preflight requests
app.options('*', cors());

// Logging middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/ai', aiRoutes);
app.use('/api', messageRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await disconnectDB(); // Implement this in your db.js
    process.exit(0);
});

export default app;