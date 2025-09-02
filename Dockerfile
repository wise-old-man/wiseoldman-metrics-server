FROM node:18-alpine

WORKDIR /wise-old-man/metrics

COPY package*.json ./
RUN npm install -s
RUN npm install pm2 -g

COPY . .

CMD ["npm", "start"]
