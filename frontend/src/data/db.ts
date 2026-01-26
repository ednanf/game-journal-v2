import { openDB } from 'idb';

export const dbPromise = openDB('game-journal-db', 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('entries')) {
            db.createObjectStore('entries', { keyPath: 'localId' });
        }
    },
});
