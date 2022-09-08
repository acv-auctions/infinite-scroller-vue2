CONTAINER_NAME := infinite-scroller-vue2
# ----------------------------------------------

# ===========================================================================
# Local Development Commands
# ===========================================================================


.PHONY: build-container
build-container: 
	docker build --target build-lib -t $(CONTAINER_NAME) .

.PHONY: lint
lint: 
	docker run -i $(CONTAINER_NAME) npm run lint

.PHONY: build-lib
build-lib: 
	docker run -i $(CONTAINER_NAME) npm run build

.PHONY: test
test: 
	docker run -i $(CONTAINER_NAME) npm run test

.PHONY: lint-fix
lint-fix: 
	docker run -i $(CONTAINER_NAME) npm run lint:fix

.PHONY: lint-css
lint-css: 
	docker run -i $(CONTAINER_NAME) npm run lint:css

.PHONY: test-coverage
test-coverage: 
	docker run -i $(CONTAINER_NAME) npm run test:coverage

.PHONY: semantic-release
semantic-release: 
	docker run -i -e NPM_TOKEN="$(NPM_PUBLISH_TOKEN)" -e GH_TOKEN="$(GITHUB_TOKEN)" '$(CONTAINER_NAME)' npx semantic-release