import i18n from './locales';

const formSending = (fields) => {
  const { submit, input, feedback } = fields;
  submit.disabled = true;
  input.readOnly = true;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.innerHTML = '';
};

const formFilling = (fields, error) => {
  const { input, feedback } = fields;
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = error;
};

const formFinished = (fields) => {
  const {
    submit,
    form,
    input,
    feedback,
  } = fields;
  form.reset();
  submit.removeAttribute('disabled');
  input.removeAttribute('readOnly');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18n('form.successLoaded');
};

const renderForm = (state, fields) => {
  switch (state.status) {
    case 'filling':
      formFilling(fields, state.error);
      break;
    case 'sending':
      formSending(fields);
      break;
    case 'finished':
      formFinished(fields);
      break;
    default:
      throw new Error('No such status of state is defined');
  }
};

const renderloading = (loadingState, fields) => {
  const { submit, feedback, input } = fields;
  submit.removeAttribute('disabled');
  input.removeAttribute('readOnly');
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
  feedback.innerHTML = loadingState.error;
};

const getFeedElement = (title, description) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item');

  const h3 = document.createElement('h3');
  h3.textContent = title;

  const p = document.createElement('p');
  p.textContent = description;

  li.append(h3, p);

  return li;
};

const renderFeeds = (feeds, fields) => {
  const { feedsField } = fields;
  const h2 = document.createElement('h2');
  h2.textContent = i18n('feeds');
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-5');
  ul.append(...feeds.map(({ title, description }) => getFeedElement(title, description)));
  feedsField.innerHTML = '';
  feedsField.append(h2, ul);
};

const getPostElement = (post, index, postsVisited) => {
  const { title, link } = post;
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
  const postVisited = postsVisited.includes(`${link}`) ? 'font-weight-normal' : 'font-weight-bold';
  const a = document.createElement('a');
  a.href = link;
  a.classList.add(postVisited);
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  a.setAttribute('data-id', index);
  a.textContent = title;
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary', 'btn-sm');
  button.setAttribute('type', 'button');
  button.setAttribute('data-id', index);
  button.setAttribute('data-toggle', 'modal');
  button.setAttribute('data-target', '#modal');
  button.textContent = i18n('viewing');

  li.append(a, button);

  return li;
};

const renderModal = (postModal, fields) => {
  const { title, link, description } = postModal;
  const { modalTitle, modalBody, modalLink } = fields;
  modalTitle.textContent = title;
  modalBody.textContent = description;
  modalLink.href = link;
};

const renderPosts = (posts, fields) => {
  const { postsField } = fields;
  const { postsLoaded, postModal, postsVisited } = posts;
  renderModal(postModal, fields);
  const h2 = document.createElement('h2');
  h2.textContent = i18n('posts');
  const ul = document.createElement('ul');
  ul.classList.add('list-group');
  ul.append(...postsLoaded.map((post, index) => getPostElement(post, index, postsVisited)));
  postsField.innerHTML = '';
  postsField.append(h2, ul);
};

export {
  renderForm,
  renderloading,
  renderFeeds,
  renderPosts,
};
