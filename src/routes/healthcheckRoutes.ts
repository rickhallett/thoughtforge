import { Router } from 'express';
import { HealthcheckController } from '../controllers/healthcheckController';

const router = Router();
const healthcheckController = new HealthcheckController();

router.get('/ping', healthcheckController.ping);
router.get('/health', healthcheckController.checkHealth);

export default router;