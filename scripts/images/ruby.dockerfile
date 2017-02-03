FROM frolvlad/alpine-ruby

RUN apk update \
    && apk add coreutils
