import { Request } from 'express';

type HealthCheck = (req: Request) => Promise<void>;

const healthChecks = new Set<string>();

function registerHealthCheck(
  target: any,
  propertyKeyOrContext?: string | symbol | ClassMethodDecoratorContext
): void {
  if (typeof propertyKeyOrContext === 'string' || typeof propertyKeyOrContext === 'symbol') {
    healthChecks.add(propertyKeyOrContext as string);
  } else if (propertyKeyOrContext && 'name' in propertyKeyOrContext) {
    healthChecks.add(propertyKeyOrContext.name as string);
  }
}

export default class HealthcheckService {
  constructor() {

  }

  async ping(): Promise<void> {
    return Promise.resolve();
  }

  @registerHealthCheck
  private async checkDatabaseConnection(req: Request): Promise<void> {
    const prisma = req.prisma;
    try {
      // Check basic connectivity
      await prisma.$queryRaw`SELECT 1`;

      // Get database name from connection URL
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL is not defined');
      }

      const dbName = new URL(dbUrl).pathname.slice(1);

      // Check if database exists
      const result = await prisma.$queryRaw`
        SELECT datname 
        FROM pg_database 
        WHERE datname = ${dbName}
      `;

      if (!Array.isArray(result) || result.length === 0) {
        throw new Error(`Database '${dbName}' does not exist`);
      }
    } finally {
      await prisma.$disconnect();
    }
  }

  @registerHealthCheck
  private async checkRedisConnection(req: Request): Promise<void> {
    return Promise.reject(new Error('Not implemented'));
  }

  @registerHealthCheck
  private async checkOpenAIConnection(req: Request): Promise<void> {
    return Promise.reject(new Error('Not implemented'));
  }

  @registerHealthCheck
  private async checkAnthropicConnection(req: Request): Promise<void> {
    return Promise.reject(new Error('Not implemented'));
  }

  @registerHealthCheck
  private async checkGoogleCloudConnection(req: Request): Promise<void> {
    return Promise.reject(new Error('Not implemented'));
  }

  @registerHealthCheck
  private async checkStripeConnection(req: Request): Promise<void> {
    return Promise.reject(new Error('Not implemented'));
  }

  @registerHealthCheck
  private async checkNodemailerConnection(req: Request): Promise<void> {
    return Promise.reject(new Error('Not implemented'));
  }

  async checkHealth(req: Request): Promise<{ results: Record<string, string>, errors: string[] }> {
    const results: Record<string, string> = {};
    const errors: string[] = [];

    for (const check of healthChecks) {
      try {
        const method = this[check as keyof HealthcheckService] as unknown as HealthCheck;
        await method(req);
        results[check] = `OK`;
      } catch (error) {
        results[check] = `ERROR: ${error}`;
        errors.push(`${check}: ${error}`);
      }
    }

    return { results, errors };
  }

  private checkEnvironmentVariables(): string[] {
    const requiredVariables = ['DATABASE_URL', 'REDIS_URL', 'OPENAI_API_KEY'];
    const missingVariables: string[] = [];

    for (const variable of requiredVariables) {
      if (!process.env[variable]) {
        missingVariables.push(variable);
      }
    }

    return missingVariables;
  }
}
