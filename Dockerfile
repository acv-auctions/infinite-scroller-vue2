FROM node:16.15.1-alpine AS install
RUN mkdir /app
WORKDIR /app

RUN apk update
RUN apk add expect
RUN apk add git

COPY package*.json ./
RUN npm install
COPY . .

FROM install AS build-lib
RUN  npm run build
