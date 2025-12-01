import express, {RequestHandler} from 'express';
import {xss} from 'express-xss-sanitizer';
import journalEntriesController from '../controllers/journalEntriesController.js';
import authenticate from '../middlewares/authenticate.js';
import zodValidate from '../middlewares/zodValidate.js';
import {createJournalEntryBodySchema} from '../zodSchemas/journalEntry.js';

const router = express.Router();

const {
    getJournalEntries,
    getJournalEntryById,
    getJournalEntriesStatistics,
    createJournalEntry,
    patchJournalEntry,
    deleteJournalEntry,
} = journalEntriesController;

router
    .route('/')
    .get(authenticate, getJournalEntries as RequestHandler)
    .post(xss(), authenticate, zodValidate(createJournalEntryBodySchema), createJournalEntry as RequestHandler);

router.get('/statistics', getJournalEntriesStatistics);

router
    .route('/:id')
    .get(getJournalEntryById)
    .patch(patchJournalEntry)
    .delete(deleteJournalEntry);

export default router;