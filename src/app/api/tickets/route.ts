import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { zdService } from '@/services/zendesk.service';

const schema = z.object({
  dateStart:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dateStart must be YYYY-MM-DD'),
  dateEnd:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dateEnd must be YYYY-MM-DD'),
  brand:         z.string().optional().default(''),
  tipoFilter:    z.string().optional().default(''),
  subtipoFilter: z.string().optional().default(''),
  cursor:        z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: { message: 'Invalid JSON body' } }, { status: 400 });
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.errors.map((e) => e.message).join('; ') } },
      { status: 400 }
    );
  }

  try {
    const result = await zdService.fetchPage(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const error = err as Error;
    console.error('[api/tickets] Error:', error.message);
    return NextResponse.json(
      { error: { message: `Erro ao buscar tickets: ${error.message}` } },
      { status: 502 }
    );
  }
}
