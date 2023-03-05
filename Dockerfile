FROM node:16
ARG ENDPOINT
ENV ENDPOINT=${ENDPOINT}
WORKDIR /usr/src/app
COPY . .
RUN yarn install
EXPOSE 9081
CMD ["yarn", "start"]