import { Request, Response } from 'express';
import HealthcheckService from '../services/healthcheckService';

export class HealthcheckController {
  private healthcheckService: HealthcheckService;

  constructor() {
    this.healthcheckService = new HealthcheckService();
  }

  ping = async (_: Request, res: Response): Promise<void> => {
    await this.healthcheckService.ping();
    res.json({ message: 'pong' });
  };

  status = async (req: Request, res: Response): Promise<void> => {
    const { results, errors } = await this.healthcheckService.checkHealth(req);
    res.json({ results, errors });
  };
}
