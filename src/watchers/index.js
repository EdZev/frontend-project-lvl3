import onChange from 'on-change';
import renderForm from './renderForm';
import renderloading from './renderloading';
import renderFeeds from './renderfeeds';
import renderPosts from './renderPosts';

export default (state, fields) => {
  const watch = onChange(state, (path) => {
    const {
      form,
      loadingState,
      feeds,
      posts,
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
      default:
        throw new Error('No such path of state is defined');
    }
  });
  return watch;
};
