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
const rssData = readFile('rss.xml');

const userEvent = testingLibraryUserEvent;
axios.defaults.adapter = httpAdapter;

let elements;

beforeEach(async () => {
  const initHtml = readFile('index.html').toString();
  document.body.innerHTML = initHtml;
  run();
  elements = {
    submit: screen.getByRole('button', { name: 'add' }),
    input: screen.getByRole('textbox', { name: 'url' }),
  };
});

test('Form - wrong url', async () => {
  expect(elements.input).not.toHaveClass('is-invalid');

  await userEvent.type(elements.input, 'wrong/url');
  await userEvent.click(elements.submit);

  expect(elements.input).toHaveClass('is-invalid');
  expect(screen.queryByText('The URL mast be valid')).toBeInTheDocument();
});

test('Get data', async () => {
  const scope = nock(proxy)
    .get(`/raw?url=${encodeURIComponent(rssUrl)}`)
    .reply(200, rssData);

  await userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(elements.input).not.toHaveClass('is-invalid');
    expect(screen.queryByText('Rss loaded successfully')).toBeInTheDocument();
  });

  scope.done();

  await userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  expect(elements.input).toHaveClass('is-invalid');
  expect(screen.queryByText('This RSS has already been loaded')).toBeInTheDocument();
});

test('Get wrong data', async () => {
  const scope = nock(proxy)
    .get(`/raw?url=${encodeURIComponent(rssUrl)}`)
    .reply(200, 'wrong data');

  await userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(elements.input).not.toHaveClass('is-invalid');
    expect(screen.queryByText('Error: The page at this url contains invalid data')).toBeInTheDocument();
  });

  scope.done();
});

test('Network error', async () => {
  const scope = nock(proxy)
    .get(`/raw?url=${encodeURIComponent(rssUrl)}`)
    .replyWithError('Network Error');

  await userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  await waitFor(() => {
    expect(elements.input).not.toHaveClass('is-invalid');
    expect(screen.queryByText('Error: Network Error')).toBeInTheDocument();
  });

  scope.done();
});
