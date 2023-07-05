.PHONY: build clean nuke

# build assets
build: clean
	yarn install
	yarn run build
	yarn run build-www

# clean dist directories
clean:
	rm -rf ./dist/
	find ./@xyzmaps -maxdepth 2 -type d -name dist -exec rm -rf {} \;

# kill node_packages and yarn.lock
nuke: clean
	rm -rf yarn.lock
	find . -maxdepth 3 -type d -name node_modules -exec rm -rf {} \;
