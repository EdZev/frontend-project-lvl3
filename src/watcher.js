import onChange from 'on-change';
import {
  renderForm,
  renderloading,
  renderFeeds,
  renderPosts,
  renderModal,
} from './renders';

export default (state, fields) => {
  const watch = onChange(state, (path) => {
    const {
      form,
      loadingState,
      feeds,
      posts,
      postModal,
    } = state;
    switch (path) {
      case 'form':
        renderForm(form, fields);
        break;
      case 'loadingState':
        renderloading(loadingState, fields);
        break;
      case 'feeds':
        renderFeeds(feeds, fields);
        break;
      case 'posts':
        renderPosts(posts, fields);
        break;
      case 'postModal':
        renderModal(postModal, fields);
        break;
      default:
        throw new Error('No such path of state is defined');
    }
  });
  return watch;
};
