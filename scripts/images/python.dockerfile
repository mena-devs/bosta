FROM frolvlad/alpine-python2

RUN apk update \
    && apk add coreutils
