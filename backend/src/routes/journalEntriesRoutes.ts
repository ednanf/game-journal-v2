import express, { RequestHandler } from 'express';
import { xss } from 'express-xss-sanitizer';
import journalEntriesController
    from '../controllers/journalEntriesController.js';
import zodValidate from '../middlewares/zodValidate.js';
import { createJournalEntryBodySchema } from '../zodSchemas/journalEntry.js';
import validateObjectId from '../middlewares/validateObjectId.js';

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
    .get(getJournalEntries as RequestHandler)
    .post(xss(), zodValidate(createJournalEntryBodySchema), createJournalEntry as RequestHandler);

router.get('/statistics', getJournalEntriesStatistics);

router
    .route('/:id')
    .get(validateObjectId('id'), getJournalEntryById as RequestHandler)
    .patch(patchJournalEntry)
    .delete(deleteJournalEntry);

export default router;