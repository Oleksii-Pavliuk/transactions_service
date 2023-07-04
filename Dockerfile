FROM node:19.3.0-bullseye-slim

WORKDIR /app

COPY /app/package*.json /app

RUN npm install

COPY /app /app


CMD [ "node","--import","./opentelemetry-tracing.mjs","index.mjs" ]

