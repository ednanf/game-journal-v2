import { DB_NAME } from './db';

export function deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);

        request.onsuccess = () => resolve();
        request.onerror = () =>
            reject(request.error ?? new Error('Failed to delete IndexedDB'));
        request.onblocked = () => {
            console.warn(
                'IndexedDB deletion blocked. Close other tabs of the app.',
            );
        };
    });
}
