import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import {bragGeneratorFlow} from './flows.js';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json());

/**
 * POST /api/brag - Generate a brag using AI
 */
app.post('/api/brag', async (req, res) => {
  try {
    const definition = req.body.definition;
    if (!definition) {
      return res.status(400).json({ error: 'Missing definition in request body' });
    }
    const brag = await bragGeneratorFlow.run({ definition });
    return res.json({ brag });
  } catch (error) {
    console.error('Brag generation error:', error);
    return res.status(500).json({ error: 'Brag generation failed' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
const angularApp = new AngularNodeAppEngine();

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);