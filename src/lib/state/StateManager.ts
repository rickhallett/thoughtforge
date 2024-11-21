// Simple key-value store that we can enhance later if needed
export class StateManager {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private state = new Map<string, any>();

    get(key: string) { return this.state.get(key); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    set(key: string, value: any) { this.state.set(key, value); }
}