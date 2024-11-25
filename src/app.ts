import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from './middlewares/errorHandler';
import { prisma } from './prisma';

import contentRoutes from './routes/contentRoutes';
import healthcheckRoutes from './routes/healthcheckRoutes';
import { handleFileUpload } from './middlewares/fileUploadHandler';

const app = express();

app.use(express.json());

app.use(handleFileUpload);

app.use((req: Request, res: Response, next: NextFunction) => {
  req.prisma = prisma;
  next();
});

app.use('/api/content', contentRoutes);
app.use('/api/health', healthcheckRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
