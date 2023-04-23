FROM node:19.3.0-bullseye-slim

WORKDIR /app

COPY /app/package*.json /app

RUN npm install

COPY /app /app

# Set the command to run the compiled JavaScript code
CMD [ "node","--require ./opentelemetry-tracing.mjs" "index.mjs" ]

