import EntryCard from '../../components/EntryCard/EntryCard.tsx';
import { VStack } from 'react-swiftstacks';

const rawEntry = {
    _id: '6942abf3e2093908238c9104',
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
            <EntryCard entry={entry} to={`/entries/${entry._id}`} />
        </VStack>
    );
};
export default JournalPage;
