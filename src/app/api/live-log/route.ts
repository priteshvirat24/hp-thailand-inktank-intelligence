/**
 * GET /api/live-log
 * Server-Sent Events (SSE) stream of the live scraper log file.
 * Streams /tmp/scrapling_live.log as it is written, so the UI can display
 * live progress without polling.
 */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

export const dynamic = 'force-dynamic';

const LOG_FILE = '/tmp/scrapling_live.log';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let offset = 0;

      if (fs.existsSync(LOG_FILE)) {
        const initial = fs.readFileSync(LOG_FILE, 'utf-8');
        if (initial) {
          const lines = initial.split('\n').filter(Boolean);
          for (const line of lines) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ line, ts: Date.now() })}\n\n`));
          }
          offset = Buffer.byteLength(initial, 'utf-8');
        }
      }

      const poll = () => {
        if (!fs.existsSync(LOG_FILE)) return;
        try {
          const stat = fs.statSync(LOG_FILE);
          if (stat.size > offset) {
            const fd = fs.openSync(LOG_FILE, 'r');
            const buf = Buffer.allocUnsafe(stat.size - offset);
            fs.readSync(fd, buf, 0, buf.length, offset);
            fs.closeSync(fd);
            offset = stat.size;
            const chunk = buf.toString('utf-8');
            const lines = chunk.split('\n').filter(Boolean);
            for (const line of lines) {
              try { controller.enqueue(encoder.encode(`data: ${JSON.stringify({ line, ts: Date.now() })}\n\n`)); } catch { return; }
            }
          }
        } catch {}
      };

      const interval = setInterval(poll, 400);
      const heartbeat = setInterval(() => {
        try { controller.enqueue(encoder.encode(': ping\n\n')); } catch { clearInterval(heartbeat); }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        clearInterval(heartbeat);
        try { controller.close(); } catch {}
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
