FROM mhart/alpine-node

RUN apk update \
    && apk add coreutils
