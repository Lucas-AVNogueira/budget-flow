import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parse } from 'yaml';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import summaryRoutes from './routes/summary.js';
import categoriesRoutes from './routes/categories.js';
import { authMiddleware } from './middlewares/auth.js';
import { notFoundMiddleware, errorMiddleware } from './middlewares/errors.js';
import { PORT } from './utils/config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(express.json());

  // Swagger
  const swaggerDocument = parse(
    readFileSync(join(__dirname, 'swagger.yaml'), 'utf8')
  );
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Rotas públicas
  app.use('/auth', authRoutes);

  // Rotas protegidas
  app.use('/transactions', authMiddleware, transactionRoutes);
  app.use('/summary', authMiddleware, summaryRoutes);
  app.use('/categories', authMiddleware, categoriesRoutes);

  // 404 e 500
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

const app = createApp();
app.listen(PORT, () => {
  console.log(`Budget-Flow API rodando em http://localhost:${PORT}`);
  console.log(`Swagger UI disponível em http://localhost:${PORT}/api-docs`);
});

export default app;
