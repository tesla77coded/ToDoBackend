import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const router = express.Router();

const specPath = path.resolve(process.cwd(), 'docs', 'openapi.yaml');
let swaggerDocument = null;
try {
  const file = fs.readFileSync(specPath, 'utf8');
  swaggerDocument = yaml.load(file);
} catch (err) {
  console.error('Failed to load openapi.yaml:', err.message);
  swaggerDocument = null;
}

if (swaggerDocument) {
  router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
} else {
  router.get('/', (req, res) => res.status(500).send('Swagger spec not found.'));
}

export default router;
