develop:
	npx webpack serve

install:
	npm install

build:
	rm -rf dist &&	NODE_ENV=production npx webpack

lint:
	npx eslint .

test:
	npm run test

test-coverage:
	npm test -- --coverage --coverageProvider=v8
