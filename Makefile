install: 
	npm install

publish:
	npm publish --dry-run

lint:
	npx eslint .

jest:
	npx --node-arg --experimental-vm-modules jest --watch

test-coverage:
	npm test -- --coverage --coverageProvider=v8
