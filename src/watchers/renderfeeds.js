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

const renderfeeds = (feeds, fields) => {
  const { feedsField } = fields;
  const h2 = document.createElement('h2');
  h2.textContent = 'Фиды';
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-5');
  ul.append(...feeds.map(({ title, description }) => getFeedElement(title, description)));
  feedsField.innerHTML = '';
  feedsField.append(h2, ul);
};

export default (feeds, fields) => {
  renderfeeds(feeds, fields);
};
