FROM matriphe/alpine-php:cli

RUN apk update \
    && apk add coreutils
