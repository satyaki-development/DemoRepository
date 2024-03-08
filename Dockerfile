FROM node:18-alpine
RUN apk add --no-cache g++ make
WORKDIR /app
COPY package.json ./
# COPY package-lock.json ./
RUN yarn
RUN npm i -g nodemon
COPY ./ ./
EXPOSE 5000
CMD ["nodemon", "./server.js"]
