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

//conrs config
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true,
}));


// morgan -> winston
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));


// mount routes
app.use('/api-docs', swaggerRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);

//not found
app.use((req, res) => res.status(404).json({ error: 'Not Found.' }));

//error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

export default app;
