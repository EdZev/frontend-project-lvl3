import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';
import testingLibraryUserEvent from '@testing-library/user-event';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import run from '../src/app.js';

nock.disableNetConnect();

const getFixturePath = (filename) => path.join('./', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');
const proxy = 'https://hexlet-allorigins.herokuapp.com';
const rssUrl = 'http://lorem-rss.herokuapp.com/feed?unit=second&interval=30';
const rssData = { contents: readFile('rss.xml') };

const userEvent = testingLibraryUserEvent;
axios.defaults.adapter = httpAdapter;

const elements = {};

beforeEach(async () => {
  const initHtml = readFile('index.html').toString();
  document.body.innerHTML = initHtml;
  run();
  elements.submit = screen.getByRole('button', { name: 'add' });
  elements.input = screen.getByRole('textbox', { name: 'url' });
});

test('Form - wrong url', async () => {
  expect(elements.input).not.toHaveClass('is-invalid');

  await userEvent.type(elements.input, 'wrong/url');
  await userEvent.click(elements.submit);

  expect(elements.input).toHaveClass('is-invalid');
  expect(screen.queryByText(/Ссылка должна быть валидным URL/i)).toBeInTheDocument();
});

test('Get data', async () => {
  const scope = nock(proxy)
    .get(`/get?disableCache=true&url=${encodeURIComponent(rssUrl)}`)
    .reply(200, rssData);

  await userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(elements.input).not.toHaveClass('is-invalid');
    expect(screen.queryByText(/RSS успешно загружен/i)).toBeInTheDocument();
  });

  scope.done();

  await userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  expect(elements.input).toHaveClass('is-invalid');
  expect(screen.queryByText(/RSS уже существует/i)).toBeInTheDocument();
});

test('Get wrong data', async () => {
  const scope = nock(proxy)
    .get(`/get?disableCache=true&url=${encodeURIComponent(rssUrl)}`)
    .reply(200, 'wrong data');

  await userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(elements.input).not.toHaveClass('is-invalid');
    expect(screen.queryByText(/Ресурс не содержит валидный RSS/i)).toBeInTheDocument();
  });

  scope.done();
});

test('Network error', async () => {
  const scope = nock(proxy)
    .get(`/get?disableCache=true&url=${encodeURIComponent(rssUrl)}`)
    .replyWithError('Network Error');

  await userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(elements.input).not.toHaveClass('is-invalid');
    expect(screen.queryByText(/Ошибка сети/i)).toBeInTheDocument();
  });

  scope.done();
});
