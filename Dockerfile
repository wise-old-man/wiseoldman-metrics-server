FROM node:14.16.0-alpine3.10

WORKDIR /wise-old-man/metrics

COPY package*.json ./
RUN npm install -s
RUN npm install pm2 -g

COPY . .
