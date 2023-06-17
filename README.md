[![Quality](https://github.com/690pmb/NgMusic/actions/workflows/quality.yml/badge.svg)](https://github.com/690pmb/NgMusic/actions/workflows/quality.yml)
[![Deploy](https://github.com/690pmb/NgMusic/actions/workflows/deploy.yml/badge.svg)](https://github.com/690pmb/NgMusic/actions/workflows/deploy.yml)

# :musical_note: NgMusic :musical_note:

## :soccer: Goal

The goal of this app is to provide an web interface to the [AllMusic project](https://github.com/69pmb/AllMusic).  
_AllMusic_ is more like a back office to import and compile top music lists.  
And with _NgMusic_ the data can be available on the internet with a better visual.

## :whale: How to use it locally

To build a _Docker_ image:

```
docker build \
  --build-arg GITHUB_DIR=69pmb \
  --build-arg GITHUB_PROJECT=NgMusic \
  --build-arg GITHUB_HASH=main \
  --build-arg NODE_VERSION=16.20.0-alpine3.17 \
  --build-arg NG_NGINX_VERSION=latest -t ngmusic.main \
  https://raw.githubusercontent.com/69pmb/Deploy/main/docker/ng-build/Dockerfile
```

To run it:

```
docker run --name ngmusic --restart unless-stopped -d -p 7575:8080 -t ngmusic.main:latest
```
