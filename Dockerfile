FROM node:8.15.0-alpine

COPY ./package.json /opt/app/package.json
COPY ./yarn.lock /opt/app/yarn.lock
COPY ./src /opt/app/src
COPY ./public /opt/app/public
COPY ./tsconfig.json /opt/app/tsconfig.json
COPY ./rollup.config.js /opt/app/rollup.config.js

WORKDIR /opt/app

RUN yarn global add rollup@1.0.0 http-server@0.11.1 && \
    yarn install && \
    rollup -c --silent && \
    rm -rf node_modules