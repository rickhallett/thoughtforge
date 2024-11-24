import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import contentRoutes from './routes/contentRoutes';

const app = express();

app.use(express.json());
app.use('/api/content', contentRoutes);
app.use(errorHandler);

export default app;
