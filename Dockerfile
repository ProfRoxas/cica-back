FROM node as builder
ENV NODE_ENV=production

WORKDIR /app
COPY ["src", "package.json", "entrypoint.sh", "tsconfig.json", "/app/"]

RUN npm install
RUN npx tsc --build
RUN chmod a+x entrypoint.sh

FROM node as installer
RUN npm install --omit-dev

FROM node as final
ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app
COPY --from=builder ["/app/build", "/app/node_modules", "/app/"]
COPY ["entrypoint.sh", "package.json", "/app/"]

RUN chmod a+x entrypoint.sh

ENTRYPOINT ["/bin/sh" ]