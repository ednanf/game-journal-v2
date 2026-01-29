import { openDB, type IDBPDatabase } from 'idb';

export const DB_NAME = 'game-journal-db';
export const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

export async function getDb() {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('entries')) {
                db.createObjectStore('entries', { keyPath: 'localId' });
            }
        },
    });

    return dbInstance;
}

export async function clearDb() {
    const db = await getDb();

    const tx = db.transaction('entries', 'readwrite');
    await tx.store.clear();
    await tx.done;
}
