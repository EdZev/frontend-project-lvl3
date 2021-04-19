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

const postsListener = (watchedState) => {
  const buttons = document.querySelectorAll('.btn-sm');
  buttons.forEach((button) => {
    const postsHandler = (evt) => {
      const { postsLoaded, postsVisited } = watchedState.posts;
      const targetId = evt.target.dataset.id;
      const target = document.querySelector(`a[data-id="${targetId}"]`);
      const targetUrl = target.href;
      const postTarget = postsLoaded.find((el) => el.link === targetUrl);
      const isVisited = postsVisited.includes(targetUrl);
      const newPostVisited = (isVisited) ? postsVisited : [targetUrl, ...postsVisited];
      watchedState.posts = {
        postsLoaded: watchedState.posts.postsLoaded,
        postModal: postTarget,
        postsVisited: newPostVisited,
      };
      postsListener(watchedState);
    };
    button.addEventListener('click', postsHandler);
  });
};

const getPosts = (feedData, url) => feedData.items.map((item) => ({ ...item, feedUrl: url }));

const updatePosts = (watchedState) => {
  const { feeds } = watchedState;
  const { postsLoaded } = watchedState.posts;
  if (feeds.length === 0) {
    return setTimeout(() => updatePosts(watchedState), chekingTimeout);
  }
  const newPosts = feeds.map(({ url }) => axios.get(getFeedUrl(url), { timeout: downloadTimeout })
    .then((response) => {
      const feedData = parseRss(response.data);
      const oldPosts = postsLoaded.filter(({ feedUrl }) => feedUrl === url);
      const newlyReceivedPosts = getPosts(feedData, url);
      return _.differenceWith(newlyReceivedPosts, oldPosts, _.isEqual);
    }));

  return Promise.all(newPosts)
    .then((feedPosts) => {
      const result = _.flatten(feedPosts);
      watchedState.posts = {
        postsLoaded: [...result, ...watchedState.posts.postsLoaded],
        postModal: watchedState.posts.postModal,
        postsVisited: watchedState.posts.postsVisited,
      };
      postsListener(watchedState);
    })
    .finally(() => setTimeout(() => updatePosts(watchedState), chekingTimeout));
};

const getRss = (watchedState, rssUrl) => axios.get(getFeedUrl(rssUrl), { timeout: downloadTimeout })
  .then((response) => {
    console.log('request!!!', rssUrl)
    const feedData = parseRss(response.data);
    console.log(feedData);
    const feed = { url: rssUrl, title: feedData.title, description: feedData.description };
    const posts = getPosts(feedData, rssUrl);
    watchedState.feeds = [feed, ...watchedState.feeds];
    watchedState.posts = {
      postsLoaded: [...posts, ...watchedState.posts.postsLoaded],
      postModal: watchedState.posts.postModal,
      postsVisited: watchedState.posts.postsVisited,
    };
    watchedState.loadingState = {
      stutus: 'idle',
      error: null,
    };
    watchedState.form = {
      status: 'finished',
      valid: null,
      error: null,
    };
    postsListener(watchedState);
  })
  .catch((err) => {
    watchedState.loadingState = {
      status: 'failed',
      error: err,
    };
  });

export default () => {
  const state = {
    feeds: [],
    posts: {
      postsLoaded: [],
      postModal: '',
      postsVisited: [],
    },
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
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.full-article'),
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
