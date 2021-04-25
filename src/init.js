import i18n from './locales';
import watch from './watcher';
import {
  validateURL,
  loadPosts,
  markVisitedLinks,
} from './utils';

const chekingTimeout = 5000;

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
      markVisitedLinks(watchedState);
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
    markVisitedLinks(watchedState);
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
