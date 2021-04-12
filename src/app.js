import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18n from './locales';
import parseRss from './parserRss';
import watch from './watcher';

const downloadTimeout = 10000;
const chekingTimeout = 5000;

const proxyUrl = 'https://hexlet-allorigins.herokuapp.com';
const getFeedUrl = (rssUrl) => `${proxyUrl}/raw?url=${encodeURIComponent(rssUrl)}`;

const getValidationURL = () => yup.string()
  .url(i18n('form.invalidUrl'))
  .required(i18n('form.fieldRequared'));

const validateURL = (rssUrl, feeds) => {
  const feedsUrl = feeds.map((feed) => feed.url);
  const validationSchema = getValidationURL().notOneOf(feedsUrl, i18n('form.alreadyLoaded'));
  try {
    validationSchema.validateSync(rssUrl);
    return null;
  } catch (e) {
    return e.message;
  }
};

const postsListener = (watcher) => {
  const buttons = document.querySelectorAll('.btn-sm');
  const handlerClick = (e) => {
    const target = document.querySelector(`a[data-id="${e.target.dataset.id}"]`);
    const targetUrl = target.href;
    const post = watcher.posts.find((el) => el.link === targetUrl);
    watcher.postModal = post;
  };
  buttons.forEach((button) => {
    button.addEventListener('click', handlerClick);
  });
};

const getPosts = (feedData, url) => feedData.items.map((item) => ({ ...item, feedUrl: url }));

const updatePosts = (watcher) => {
  const { feeds, posts } = watcher;
  if (feeds.length === 0) {
    return setTimeout(() => updatePosts(watcher), chekingTimeout);
  }
  const newPosts = feeds.map(({ url }) => axios.get(getFeedUrl(url), { timeout: downloadTimeout })
    .then((response) => {
      const feedData = parseRss(response.data);
      const oldPosts = posts.filter(({ feedUrl }) => feedUrl === url);
      const newlyReceivedPosts = getPosts(feedData, url);
      return _.differenceWith(newlyReceivedPosts, oldPosts, _.isEqual);
    }));

  return Promise.all(newPosts)
    .then((feedPosts) => {
      watcher.posts = [..._.flatten(feedPosts), ...watcher.posts];
      postsListener(watcher);
    })
    .finally(() => setTimeout(() => updatePosts(watcher), chekingTimeout));
};

const getRss = (watcher, rssUrl) => axios.get(getFeedUrl(rssUrl), { timeout: downloadTimeout })
  .then((response) => {
    const feedData = parseRss(response.data);
    const feed = { url: rssUrl, title: feedData.title, description: feedData.description };
    const posts = getPosts(feedData, rssUrl);
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
    postsListener(watcher);
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
    postModal: null,
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
    body: document.querySelector('body'),
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    submit: document.querySelector('.rss-form button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feedsField: document.querySelector('.feeds'),
    postsField: document.querySelector('.posts'),
    modalField: document.getElementById('modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.full-article'),
    modalButtons: document.querySelectorAll('button[data-dismiss="modal"]'),
  };

  const watchedState = watch(state, fields);

  setTimeout(() => updatePosts(watchedState), chekingTimeout);

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
