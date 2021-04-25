import * as yup from 'yup';
import axios from 'axios';
import $ from 'jquery';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import i18n from './locales';
import parserRss from './parserRss';

const proxyUrl = 'https://hexlet-allorigins.herokuapp.com/get?';
const options = 'disableCache=true';
const getFeedUrl = (rssUrl) => `${proxyUrl}${options}&url=${encodeURIComponent(rssUrl)}`;

export const loadPosts = (rssUrl, availablePosts = []) => axios.get(getFeedUrl(rssUrl))
  .then((response) => {
    const feedData = parserRss(response.data.contents);
    const loadedPosts = feedData.items.map((item) => ({ ...item, feedUrl: rssUrl }));
    const feed = { url: rssUrl, title: feedData.title, description: feedData.description };
    const posts = differenceWith(loadedPosts, availablePosts, isEqual);
    return { feed, posts };
  });

const getValidationURL = () => yup.string()
  .url(i18n('form.invalidUrl'))
  .required(i18n('form.fieldRequared'));

export const validateURL = (rssUrl, feeds) => {
  const feedsUrl = feeds.map((feed) => feed.url);
  const validationSchema = getValidationURL().notOneOf(feedsUrl, i18n('form.alreadyLoaded'));
  try {
    validationSchema.validateSync(rssUrl);
    return null;
  } catch (e) {
    return e.message;
  }
};

const addVisitedPost = (watchedState, link) => {
  const { postsVisited, postsLoaded } = watchedState.posts;
  const postToModal = postsLoaded.find((el) => el.link === link);
  const isVisited = postsVisited.includes(link);
  const newPostVisited = (isVisited) ? postsVisited : [link, ...postsVisited];
  watchedState.posts = {
    postsLoaded: watchedState.posts.postsLoaded,
    postModal: postToModal,
    postsVisited: newPostVisited,
  };
};

export const markVisitedLinks = (watchedState) => {
  ($('div.posts a')).on('click', (evt) => {
    const { target } = evt;
    const link = target.href;
    addVisitedPost(watchedState, link);
    markVisitedLinks(watchedState);
  });

  $('div.posts button').on('click', (evt) => {
    const id = evt.target.getAttribute('data-id');
    const elementLink = $(`a[data-id=${id}]`)[0];
    const link = elementLink.href;
    addVisitedPost(watchedState, link);
    markVisitedLinks(watchedState);
  });
};
