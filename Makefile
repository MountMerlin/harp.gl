.PHONY: build clean dev nuke

# build assets
build: clean
	yarn install
	yarn run build
	yarn run build-www
	yarn run typedoc

dev:
	yarn run start


# clean dist directories
clean:
	rm -rf ./dist/
	find ./@xyzmaps -maxdepth 2 -type d -name dist -exec rm -rf {} \;

# kill node_packages and yarn.lock
nuke: clean
	rm -rf yarn.lock
	rm -rf ./node_modules
	find ./@xyzmaps -maxdepth 2 -type d -name node_modules -exec rm -rf {} \;
