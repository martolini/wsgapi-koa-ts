import * as Router from 'koa-router';
import * as omdb from './omdbsdk';

const router = new Router();

router.get('/search', async ctx => {
  const { s } = ctx.query;
  if (!s) {
    ctx.throw('Pass a search parameter with ?s=', 400);
  }
  ctx.body = await omdb.search(ctx.query);
});

const getShow = async (ctx: Router.IRouterContext) => {
  const { id } = ctx.params;
  if (id === undefined) {
    ctx.throw('No ID specified', 400);
  }
  ctx.body = await omdb.getEpisodes(id);
};

router.get('/show/:id', getShow);

// Backwards compability
router.get('/get/:id', getShow);

router.get('/health', async ctx => {
  ctx.body = {
    data: true,
  };
});

export const routes = router.routes();
