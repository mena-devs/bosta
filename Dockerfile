FROM node:6.11.0-alpine

RUN apk update \
    && apk add build-base \
    && apk add python

RUN mkdir /app
WORKDIR /app

ADD package.json /app/package.json
RUN npm install

ADD . /app

CMD ["npm", "start"]
