// This file contains the status options for games in the application.
// They follow the format accepted by the backend model JournalEntry.

export const gameStatus: { label: string; value: string }[] = [
  { label: 'Started', value: 'started' },
  { label: 'Completed', value: 'completed' },
  { label: 'Revisited', value: 'revisited' },
  { label: 'Paused', value: 'paused' },
  { label: 'Dropped', value: 'dropped' },
];
