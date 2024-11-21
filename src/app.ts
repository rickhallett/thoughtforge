import express from 'express';
import contentRoutes from './routes/content';

const app = express();
app.use(express.json());
app.use('/content', contentRoutes);

export default app;