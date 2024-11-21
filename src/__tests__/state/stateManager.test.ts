import { StateManager } from "../../lib/state/StateManager";

describe('StateManager', () => {
  it('should store and retrieve values', () => {
      const stateManager = new StateManager();
      stateManager.set('test', { value: 'test' });
      const result = stateManager.get('test') as { value: string };
      expect(result?.value).toBe('test');
  });
});