import { journalRepository } from './journalRepository';
import type { OfflineJournalEntry } from './journalTypes';

export async function testJournalDB() {
    const entry: OfflineJournalEntry = {
        _id: crypto.randomUUID(),
        createdBy: 'local-user',
        title: 'First offline entry',
        entryDate: new Date().toISOString(),
        platform: 'PC',
        status: 'started',
        rating: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
    };

    await journalRepository.upsert(entry);

    const allEntries = await journalRepository.getAll();
    console.log('Entries from IndexedDB:', allEntries);
}
