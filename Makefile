BIN = ./node_modules/.bin
PATH := $(BIN):$(PATH)

test:
	@mocha --reporter dot --ui tdd --bail --recursive

.PHONY: test

lint:
	@jshint index.js lib locales

install link:
	@npm $@

release-patch: test lint
	@$(call release,patch)

release-minor: test lint
	@$(call release,minor)

release-major: test lint
	@$(call release,major)

publish:
	git push --tags origin HEAD:master
	npm publish

define release
	npm version $(1) -m 'release %s'
endef
