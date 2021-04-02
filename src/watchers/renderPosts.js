const getPostElement = (post, index) => {
  const { title, link } = post;
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
  const a = document.createElement('a');
  a.href = link;
  a.classList.add('font-weight-bold');
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
  button.textContent = 'Просмотр';

  li.append(a, button);

  return li;
};

const renderPosts = (posts, fields) => {
  const { postsField } = fields;
  const h2 = document.createElement('h2');
  h2.textContent = 'Посты';
  const ul = document.createElement('ul');
  ul.classList.add('list-group');
  ul.append(...posts.map((post, index) => getPostElement(post, index)));
  postsField.innerHTML = '';
  postsField.append(h2, ul);
};

export default (posts, fields) => {
  renderPosts(posts, fields);
};
