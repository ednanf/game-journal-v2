export type SyncStatus =
    | 'all-synced' // no local changes
    | 'pending' // local changes exist, sync not happening right now
    | 'syncing' // sync currently running
    | 'offline' // **browser** offline
    | 'unreachable'; // browser is online, **backend** not responding
