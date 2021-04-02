import * as yup from 'yup';
import axios from 'axios';
import parseRss from './parserRss';
import watch from './watchers/index';

const proxyUrl = 'https://hexlet-allorigins.herokuapp.com';

const getFeedUrl = (rssUrl) => `${proxyUrl}/raw?url=${encodeURIComponent(rssUrl)}`;

const getValidationURL = () => yup.string()
  .url('The URL mast be valid')
  .required('This field is required');

const validateURL = (rssUrl, feeds) => {
  const feedsUrl = feeds.map((feed) => feed.url);
  const validationSchema = getValidationURL().notOneOf(feedsUrl, 'This RSS has already been loaded');
  try {
    validationSchema.validateSync(rssUrl);
    return null;
  } catch (e) {
    return e.message;
  }
};

const getRss = (watcher, rssUrl) => axios.get(getFeedUrl(rssUrl))
  .then((response) => {
    const feedData = parseRss(response.data);
    const feed = { url: rssUrl, title: feedData.title, description: feedData.description };
    const posts = feedData.items.map((item) => ({ ...item, feedUrl: feed.url }));
    watcher.feeds = [feed, ...watcher.feeds];
    watcher.posts = [...posts, ...watcher.posts];
    watcher.loadingState = {
      stutus: 'idle',
      error: null,
    };
    watcher.form = {
      status: 'finished',
      valid: null,
      error: null,
    };
  })
  .catch((err) => {
    watcher.loadingState = {
      status: 'failed',
      error: err,
    };
  });

export default () => {
  const state = {
    feeds: [],
    posts: [],
    loadingState: {
      status: 'idle',
      error: null,
    },
    form: {
      status: 'filling',
      valid: null,
      error: null,
    },
  };
  const fields = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feedsField: document.querySelector('.feeds'),
    postsField: document.querySelector('.posts'),
  };

  const watchedState = watch(state, fields);

  fields.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rssUrl = formData.get('url');
    const error = validateURL(rssUrl, watchedState.feeds);
    if (error) {
      watchedState.form = {
        status: 'filling',
        valid: false,
        error,
      };
      return;
    }
    watchedState.form = {
      status: 'sending',
      valid: true,
      error,
    };
    getRss(watchedState, rssUrl);
  });
};
