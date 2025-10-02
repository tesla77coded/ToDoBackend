import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerRoutes from './utils/swagger.js';
import logger from './utils/logger.js';
import userRoutes from './routes/user.routes.js';
import taskRoutes from './routes/task.routes.js';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS setup 
// empty/undefined => default to localhost dev origin
// a single origin string
// a comma-separated list of origins
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawOrigins
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

logger.info('CORS allowed origins:', { allowedOrigins });
console.info('CORS allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin 
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('CORS not allowed for this origin: ' + origin));
      }
    },
    credentials: true,
  })
);

// morgan -> winston
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// mount routes
app.use('/api-docs', swaggerRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);

// not found
app.use((req, res) => res.status(404).json({ error: 'Not Found.' }));

// error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

export default app;
