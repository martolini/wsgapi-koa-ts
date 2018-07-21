FROM node:9

RUN mkdir /app

ENV port 8001

ADD package.json /app/package.json
ADD yarn.lock /app/yarn.lock

RUN cd /app && yarn

ADD . /app
WORKDIR /app

EXPOSE 8001

RUN yarn build-server

CMD ["yarn", "start"]
