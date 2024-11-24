import os
import json
import subprocess
from datetime import datetime

class GitProjectInitializer:
    def __init__(self, root="thoughtforge"):
        self.root = root
        self.git = lambda cmd: subprocess.run(['git'] + cmd, cwd=self.root, check=True)
        
    def create_file(self, path, content=''):
        """Create a file with optional content"""
        full_path = os.path.join(self.root, path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w') as f:
            f.write(content)

    def commit(self, message):
        """Create a git commit with the given message"""
        self.git(['add', '.'])
        self.git(['commit', '-m', message])

    def initialize_project(self):
        # Initial configuration files
        self.create_file('.gitignore', """node_modules/
dist/
coverage/
.env
*.log
""")
        
        self.create_file('README.md', """# Content Pipeline Service

A TypeScript-based service for processing and enhancing content through various pipelines.

## Features
- Content standardization
- AI-powered enhancement
- SEO optimization

## Setup
TBD

## Usage
TBD
""")
        
        self.commit("chore: initialize project")

        # 2. Add package.json and TypeScript configuration
        package_json = {
            "name": "content-pipeline-service",
            "version": "0.1.0",
            "private": True,
            "scripts": {
                "start": "ts-node src/index.ts",
                "dev": "nodemon src/index.ts",
                "build": "tsc",
                "test": "jest",
                "lint": "eslint . --ext .ts",
                "format": "prettier --write \"src/**/*.ts\"",
            },
            "dependencies": {
                "express": "^4.17.1",
                "typescript": "^4.5.0",
                "@prisma/client": "^3.0.0",
                "winston": "^3.3.3"
            },
            "devDependencies": {
                "@types/express": "^4.17.13",
                "@types/jest": "^27.0.0",
                "@typescript-eslint/eslint-plugin": "^5.0.0",
                "@typescript-eslint/parser": "^5.0.0",
                "eslint": "^8.0.0",
                "jest": "^27.0.0",
                "nodemon": "^2.0.15",
                "prettier": "^2.5.0",
                "ts-node": "^10.4.0"
            }
        }
        
        self.create_file('package.json', json.dumps(package_json, indent=2))
        
        tsconfig = {
            "compilerOptions": {
                "target": "es2017",
                "module": "commonjs",
                "outDir": "./dist",
                "rootDir": "./src",
                "strict": True,
                "esModuleInterop": True,
                "skipLibCheck": True,
                "forceConsistentCasingInFileNames": True
            },
            "include": ["src/**/*"],
            "exclude": ["node_modules", "**/*.test.ts"]
        }
        
        self.create_file('tsconfig.json', json.dumps(tsconfig, indent=2))
        self.commit("chore: add typescript and package configuration")

        # 3. Add Prisma configuration
        self.create_file('prisma/schema.prisma', """
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Add your models here
""")
        
        os.makedirs(os.path.join(self.root, 'prisma/migrations'), exist_ok=True)
        self.commit("feat: add prisma schema and migrations directory")

        # 4. Add core application structure
        self.create_file('src/app.ts', """import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import contentRoutes from './routes/contentRoutes';

const app = express();

app.use(express.json());
app.use('/api/content', contentRoutes);
app.use(errorHandler);

export default app;
""")
        
        self.create_file('src/index.ts', """import app from './app';
import { logger } from './utils/logger';
import { config } from './config/config';

const port = config.port || 3000;

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
""")
        
        self.commit("feat: add core application setup")

        # 5. Add utilities and config
        self.create_file('src/utils/logger.ts', """import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
""")
        
        self.create_file('src/utils/constants.ts', """export const Constants = {
  QUEUE_NAMES: {
    CONTENT_PROCESSING: 'content-processing',
  },
  PIPELINE_STAGES: {
    STANDARDIZATION: 'standardization',
    AI_ENHANCEMENT: 'ai-enhancement',
    SEO_ENHANCEMENT: 'seo-enhancement',
  },
};
""")
        
        self.create_file('src/config/config.ts', """export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
};
""")
        
        self.commit("feat: add utilities and configuration")

        # 6. Add middleware
        self.create_file('src/middlewares/errorHandler.ts', """import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(error.message);
  
  return res.status(500).json({
    error: 'Internal Server Error',
    message: error.message,
  });
};
""")
        
        self.create_file('src/middlewares/validateRequest.ts', """import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details,
      });
    }
    
    next();
  };
};
""")
        
        self.commit("feat: add middleware implementations")

        # 7. Add service layer
        services = {
            'contentService.ts': """export class ContentService {
  async processContent(content: string) {
    // Content processing logic
  }
}""",
            'queueService.ts': """export class QueueService {
  async addToQueue(data: any) {
    // Queue processing logic
  }
}""",
            'pipelineService.ts': """export class PipelineService {
  async executePipeline(content: string) {
    // Pipeline execution logic
  }
}"""
        }
        
        for filename, content in services.items():
            self.create_file(f'src/services/{filename}', content)
        
        self.commit("feat: add service layer implementations")

        # 8. Add controllers and routes
        self.create_file('src/controllers/contentController.ts', """import { Request, Response } from 'express';
import { ContentService } from '../services/contentService';

export class ContentController {
  private contentService: ContentService;

  constructor() {
    this.contentService = new ContentService();
  }

  async processContent(req: Request, res: Response) {
    try {
      const result = await this.contentService.processContent(req.body.content);
      return res.json(result);
    } catch (error) {
      throw error;
    }
  }
}
""")
        
        self.create_file('src/routes/contentRoutes.ts', """import { Router } from 'express';
import { ContentController } from '../controllers/contentController';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();
const contentController = new ContentController();

router.post(
  '/process',
  validateRequest(/* add validation schema */),
  contentController.processContent.bind(contentController)
);

export default router;
""")
        
        self.commit("feat: add controllers and routes")

        # 9. Add pipeline processors
        processors = {
            'standardizationProcessor.ts': """export class StandardizationProcessor {
  process(content: string) {
    // Standardization logic
  }
}""",
            'aiEnhancementProcessor.ts': """export class AIEnhancementProcessor {
  process(content: string) {
    // AI enhancement logic
  }
}""",
            'seoEnhancementProcessor.ts': """export class SEOEnhancementProcessor {
  process(content: string) {
    // SEO enhancement logic
  }
}"""
        }
        
        for filename, content in processors.items():
            self.create_file(f'src/pipelines/processors/{filename}', content)
        
        self.create_file('src/pipelines/contentPipeline.ts', """import { StandardizationProcessor } from './processors/standardizationProcessor';
import { AIEnhancementProcessor } from './processors/aiEnhancementProcessor';
import { SEOEnhancementProcessor } from './processors/seoEnhancementProcessor';

export class ContentPipeline {
  private standardization: StandardizationProcessor;
  private aiEnhancement: AIEnhancementProcessor;
  private seoEnhancement: SEOEnhancementProcessor;

  constructor() {
    this.standardization = new StandardizationProcessor();
    this.aiEnhancement = new AIEnhancementProcessor();
    this.seoEnhancement = new SEOEnhancementProcessor();
  }

  async process(content: string) {
    // Pipeline processing logic
  }
}
""")
        
        self.commit("feat: add pipeline processors")

        # 10. Add queue implementation
        self.create_file('src/queues/contentQueue.ts', """export class ContentQueue {
  async add(content: string) {
    // Queue addition logic
  }

  async process() {
    // Queue processing logic
  }
}
""")
        
        self.commit("feat: add queue implementation")

        # 11. Add test directories
        test_dirs = [
            'tests/controllers',
            'tests/services',
            'tests/queues',
            'tests/pipelines',
            'tests/routes',
            'tests/utils'
        ]
        
        for directory in test_dirs:
            dir_path = os.path.join(self.root, directory)
            os.makedirs(dir_path, exist_ok=True)
            # Add .gitkeep file to ensure Git tracks the directory
            with open(os.path.join(dir_path, '.gitkeep'), 'w') as f:
                pass
        
        self.commit("test: add test directory structure")

        # 12. Add environment configuration
        self.create_file('.env', """NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/content_pipeline?schema=public"
""")
        
        self.create_file('.env.example', """NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/content_pipeline?schema=public"
""")
        
        # Stage the new files
        self.git(['add', '.env.example'])
        
        # Now commit will work
        self.commit("chore: add environment configuration")

if __name__ == "__main__":
    initializer = GitProjectInitializer()
    initializer.initialize_project()