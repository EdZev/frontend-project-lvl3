export default (data) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, 'application/xml');
  const parserError = xml.querySelector('parsererror');
  if (parserError) {
    throw new Error('invalidData');
  }
  const channelTitle = xml.querySelector('channel > title').textContent;
  const channelDescription = xml.querySelector('channel > description').textContent;

  const itemElements = xml.querySelectorAll('item');
  const items = [...itemElements].map((el) => {
    const title = el.querySelector('title').textContent;
    const link = el.querySelector('link').textContent;
    const description = el.querySelector('description').textContent;
    return { title, link, description };
  });

  return { title: channelTitle, description: channelDescription, items };
};
