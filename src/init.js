import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18n from './locales';
import parserRss from './parserRss';
import watch from './watcher';

const chekingTimeout = 5000;

const proxyUrl = 'https://hexlet-allorigins.herokuapp.com/get?';
const options = 'disableCache=true';
const getFeedUrl = (rssUrl) => `${proxyUrl}${options}&url=${encodeURIComponent(rssUrl)}`;

const loadPosts = (rssUrl, availablePosts = []) => axios.get(getFeedUrl(rssUrl))
  .then((response) => {
    const feedData = parserRss(response.data.contents);
    const loadedPosts = feedData.items.map((item) => ({ ...item, feedUrl: rssUrl }));
    const feed = { url: rssUrl, title: feedData.title, description: feedData.description };
    const posts = _.differenceWith(loadedPosts, availablePosts, _.isEqual);
    return { feed, posts };
  });

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

const updatePosts = (watchedState) => {
  const { feeds } = watchedState;
  const { postsLoaded } = watchedState.posts;
  if (feeds.length === 0) {
    return setTimeout(() => updatePosts(watchedState), chekingTimeout);
  }

  const promises = feeds.map(({ url }) => loadPosts(url, postsLoaded));

  return Promise.all(promises)
    .then((feedPosts) => {
      const newPosts = feedPosts.reduce((acc, { posts }) => [...acc, ...posts], []);
      watchedState.posts = {
        postsLoaded: [...newPosts, ...watchedState.posts.postsLoaded],
        postModal: watchedState.posts.postModal,
        postsVisited: watchedState.posts.postsVisited,
      };
      postsListener(watchedState);
    })
    .finally(() => setTimeout(() => updatePosts(watchedState), chekingTimeout));
};

const loadRss = (watchedState, rssUrl) => loadPosts(rssUrl)
  .then((data) => {
    const { feed, posts } = data;
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
      error: null,
    };
    postsListener(watchedState);
  })
  .catch((err) => {
    const error = (err.message === 'invalidData') ? 'form.invalidData' : 'form.networkError';
    watchedState.loadingState = {
      status: 'failed',
      error: i18n(error),
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
        error,
      };
      return;
    }
    watchedState.form = {
      status: 'sending',
      error,
    };
    loadRss(watchedState, rssUrl);
  });
};
