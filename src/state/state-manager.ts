
import { logger } from '../logger/logger';
import { StructuredContent, ContentStatus } from '../../types/content';

export class StateManager {
    private state = new Map<string, any>();

    // Basic get/set operations
    get<T>(key: string): T | null {
        const value = this.state.get(key);
        return value ? (value as T) : null;
    }

    set<T>(key: string, value: T): void {
        this.state.set(key, value);
        logger.debug('State updated', { key });
    }

    // Simple namespacing by key prefix
    getContentState(contentId: string): StructuredContent | null {
        return this.get<StructuredContent>(`content:${contentId}`);
    }

    setContentState(contentId: string, content: StructuredContent): void {
        this.set(`content:${contentId}`, content);
    }

    getContentStatus(contentId: string): ContentStatus | null {
        return this.get<ContentStatus>(`status:${contentId}`);
    }

    setContentStatus(contentId: string, status: ContentStatus): void {
        this.set(`status:${contentId}`, status);
    }

    // Basic cleanup
    remove(key: string): void {
        this.state.delete(key);
        logger.debug('State removed', { key });
    }

    clear(): void {
        this.state.clear();
        logger.debug('State cleared');
    }
}