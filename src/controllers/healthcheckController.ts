import { Request, Response } from 'express';
import HealthcheckService from '../services/healthcheckService';

export class HealthcheckController {
  private healthcheckService: HealthcheckService;

  constructor() {
    this.healthcheckService = new HealthcheckService();
    this.ping = this.ping.bind(this);
    this.checkHealth = this.checkHealth.bind(this);
  }

  ping = async (_: Request, res: Response): Promise<void> => {
    await this.healthcheckService.ping();
    res.json({ message: 'pong' });
  }

  checkHealth = async (req: Request, res: Response): Promise<void> => {
    const { results, errors } = await this.healthcheckService.checkHealth(req);
    res.json({ results, errors });
  }
}
