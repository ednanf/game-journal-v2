import EntryCard from '../../components/EntryCard/EntryCard.tsx';
import { VStack } from 'react-swiftstacks';

const rawEntry = {
    title: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    platform: 'Nintendo Switch 2',
    status: 'completed',
    rating: 9,
    entryDate: '2025-12-15T18:16:06.019+00:00',
};

// Backend sends a string that should be converted *before* going into as prop
const entry = {
    ...rawEntry,
    entryDate: new Date(rawEntry.entryDate),
};

const JournalPage = () => {
    return (
        <VStack align={'center'}>
            <EntryCard
                title={entry.title}
                platform={entry.platform}
                status={entry.status}
                rating={entry.rating}
                date={entry.entryDate}
            />
            <EntryCard
                title={entry.title}
                platform={entry.platform}
                status={entry.status}
                rating={entry.rating}
                date={entry.entryDate}
            />
            <EntryCard
                title={entry.title}
                platform={entry.platform}
                status={entry.status}
                rating={entry.rating}
                date={entry.entryDate}
            />
            <EntryCard
                title={entry.title}
                platform={entry.platform}
                status={entry.status}
                rating={entry.rating}
                date={entry.entryDate}
            />
            <EntryCard
                title={entry.title}
                platform={entry.platform}
                status={entry.status}
                rating={entry.rating}
                date={entry.entryDate}
            />
            <EntryCard
                title={entry.title}
                platform={entry.platform}
                status={entry.status}
                rating={entry.rating}
                date={entry.entryDate}
            />
            <EntryCard
                title={entry.title}
                platform={entry.platform}
                status={entry.status}
                rating={entry.rating}
                date={entry.entryDate}
            />
            <EntryCard
                title={entry.title}
                platform={entry.platform}
                status={entry.status}
                rating={entry.rating}
                date={entry.entryDate}
            />
        </VStack>
    );
};
export default JournalPage;
