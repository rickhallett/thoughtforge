import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from './middlewares/errorHandler';
import { prisma } from './prisma';

import contentRoutes from './routes/contentRoutes';
import healthcheckRoutes from './routes/healthcheckRoutes';
const app = express();

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  req.prisma = prisma;
  next();
})

app.use('/api/content', contentRoutes);
app.use('/api/healthcheck', healthcheckRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app;
