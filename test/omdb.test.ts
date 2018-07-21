import test from 'ava';
import * as omdb from '../src/server/omdbsdk';

test('Search', async t => {
  const res1 = await omdb.search({ s: 'south park' });
  t.is(res1.Search.length, 3);
});
