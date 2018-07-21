import axios from 'axios';
import { Map } from 'immutable';
import { range } from 'lodash';

const episodeStore = {
  requests: Map(),
  results: Map(),
};

const searchStore = {
  requests: Map(),
  results: Map(),
};

const instance = axios.create({
  baseURL: `http://www.omdbapi.com/`,
  timeout: 4000,
});

interface IOMDBConfig {
  r?: string;
  plot?: string;
  type?: string;
  s: string; // search param
}

instance.defaults.params = {
  apiKey: process.env.OMDB_API_KEY,
  r: 'json',
  plot: 'short',
  type: 'series',
};

function configure(opts: IOMDBConfig) {
  instance.defaults.params = {
    ...instance.defaults.params,
    ...opts,
  };
  return instance.defaults.params;
}

async function _search(params: IOMDBConfig) {
  const result = await instance({
    method: 'get',
    params,
  });
  return result.data;
}

interface IEpisode {
  imdbRating: number;
  season: number;
  episode: number;
}

async function _getEpisodes(imdbID: string) {
  const result = await instance({
    method: 'get',
    params: {
      i: imdbID,
    },
  });
  const show = result.data;
  const nSeasons = show.totalSeasons;
  const promises = range(nSeasons).map(async (s: any, i) => {
    const res = await instance({
      method: 'get',
      params: {
        i: imdbID,
        Season: i + 1,
      },
    });
    return res.data.Episodes;
  });
  const seasons = await Promise.all(promises);
  const episodes: IEpisode[] = [];
  seasons.forEach((season, i) => {
    season.forEach((episode: IEpisode, j: number) => {
      episodes.push({
        ...episode,
        imdbRating: Number(episode.imdbRating),
        season: i + 1,
        episode: j + 1,
      });
    });
  });
  return {
    ...show,
    episodes,
  };
}

export async function getEpisodes(imdbID: string) {
  if (episodeStore.requests.has(imdbID)) {
    return episodeStore.requests.get(imdbID);
  }
  if (episodeStore.results.has(imdbID)) {
    return episodeStore.results.get(imdbID);
  }
  const promise = _getEpisodes(imdbID).then(res => {
    episodeStore.results = episodeStore.results.set(imdbID, res);
    episodeStore.requests = episodeStore.requests.delete(imdbID);
    return res;
  });
  episodeStore.requests = episodeStore.requests.set(imdbID, promise);
  return promise;
}

export async function search(params: IOMDBConfig) {
  const key = JSON.stringify(params, Object.keys(params).sort());
  if (searchStore.requests.has(key)) {
    return searchStore.requests.get(key);
  }
  if (searchStore.results.has(key)) {
    return searchStore.results.get(key);
  }
  const promise = _search(params).then(res => {
    searchStore.results = searchStore.results.set(key, res);
    searchStore.requests = searchStore.requests.delete(key);
    return res;
  });
  searchStore.requests = searchStore.requests.set(key, promise);
  return promise;
}
