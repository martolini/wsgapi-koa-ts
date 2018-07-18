import * as Koa from 'koa';

import { config } from './config';
import { logger } from './logging';
import { routes } from './routes';

const app = new Koa();

async function responseTimeMiddleware(ctx: Koa.Context, next: () => {}) {
  const now = Date.now();
  await next();
  const timeSpent = Date.now() - now;
  ctx.set('X-Response-Time', `${timeSpent}ms`);
}

app.use(responseTimeMiddleware);
app.use(logger);
app.use(routes);

app.listen(config.port);

console.log(`Server running on port ${config.port}`);
