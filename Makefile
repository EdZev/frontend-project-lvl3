install:
	npm install

publish:
	npm publish --dry-run

build:
	rm -rf dist &&	NODE_ENV=production npx webpack

develop:
	npx webpack serve

lint:
	npx eslint .

test:
	npm run test

test-coverage:
	npm test -- --coverage --coverageProvider=v8
