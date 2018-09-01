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

interface OMDBConfig {
  r?: string;
  plot?: string;
  type?: string;
  s: string; // search param
}

interface OMDBSearchResult {
  Poster: string;
  Title: string;
  Type: string;
  Year: string;
  imdbID: string;
}

interface SearchResult {
  posterUrl?: string;
  title: string;
  type: string;
  year: string;
  imdbID: string;
}

instance.defaults.params = {
  apiKey: process.env.OMDB_API_KEY,
  plot: 'short',
  r: 'json',
  type: 'series',
};

function configure(opts: OMDBConfig): OMDBConfig {
  instance.defaults.params = {
    ...instance.defaults.params,
    ...opts,
  };
  return instance.defaults.params;
}

async function _search(params: OMDBConfig): Promise<OMDBSearchResult> {
  const result = await instance({
    method: 'get',
    params,
  });
  const deprecatedBody = result.data;
  const data: SearchResult[] = deprecatedBody.Search
    ? deprecatedBody.Search.map((elem: OMDBSearchResult) => ({
        imdbID: elem.imdbID,
        posterURL: elem.Poster,
        title: elem.Title,
        type: elem.Type,
        year: elem.Year,
      }))
    : [];
  return {
    ...deprecatedBody,
    data,
  };
}

interface Episode {
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
        Season: i + 1,
        i: imdbID,
      },
    });
    return res.data.Episodes;
  });
  const seasons = await Promise.all(promises);
  const episodes: Episode[] = [];
  seasons.forEach((season, i) => {
    season.forEach((episode: Episode, j: number) => {
      episodes.push({
        ...episode,
        episode: j + 1,
        imdbRating: Number(episode.imdbRating),
        season: i + 1,
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

export async function search(params: OMDBConfig) {
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
