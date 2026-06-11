import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { n8nService } from '../services/n8n.service';
import { createError } from '../middleware/errorHandler';

const router = Router();

const ticketsBodySchema = z.object({
  dateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dateStart must be YYYY-MM-DD'),
  dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dateEnd must be YYYY-MM-DD'),
  brand: z.string().optional().default(''),
  tipoFilter: z.string().optional().default(''),
  subtipoFilter: z.string().optional().default(''),
  cursor: z.string().optional(), // pagination cursor for progressive loading
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const parsed = ticketsBodySchema.safeParse(req.body);

  if (!parsed.success) {
    return next(createError(parsed.error.errors.map((e) => e.message).join('; '), 400));
  }

  try {
    const result = await n8nService.fetchPage(parsed.data);
    res.json(result);
  } catch (err) {
    const error = err as Error;
    console.error('[tickets.router] Error fetching tickets:', error.message);
    next(createError(`Failed to fetch tickets: ${error.message}`, 502));
  }
});

export default router;
