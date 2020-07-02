FROM node:12.18.2-alpine3.12 AS base
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install


FROM node:12.18.2-alpine3.12 
COPY --from=base /usr/src/app /usr/src/app
EXPOSE 80
WORKDIR /usr/src/app
ENTRYPOINT [ "node" ]
CMD ["server.js" ]