import * as Router from 'koa-router';
import * as omdb from './omdbsdk';

const router = new Router();

router.get('/shows/search', async ctx => {
  const { s } = ctx.query;
  if (!s) {
    ctx.throw('Send a search query with ?s=', 400);
  }
  try {
    ctx.body = await omdb.search(ctx.query);
  } catch (ex) {
    console.error(ex);
    ctx.throw(ex.message);
  }
});

const getShow = async (ctx: Router.IRouterContext) => {
  const { id } = ctx.params;
  if (id === undefined) {
    ctx.throw('No ID specified', 400);
  }
  ctx.body = {
    data: await omdb.getShow(id),
  };
};

router.get('/shows/:id', getShow);

router.get('/health', async ctx => {
  ctx.body = {
    data: true,
  };
});

router.get('/', async ctx => {
  ctx.body = { version: process.env.API_VERSION || 'dev' };
});

export const routes = router.routes();
