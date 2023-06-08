FROM node as builder
ENV NODE_ENV=production

WORKDIR /app
COPY ["src", "package.json", "entrypoint.sh", "tsconfig.json", "/app/"]

RUN mkdir /cache
RUN --mount=type=cache,target=/cache npm install --cache /cache/
RUN npx tsc --build
RUN chmod a+x entrypoint.sh

FROM node as installer
WORKDIR /app
COPY --from=builder ["/cache/", "/cache/"]
COPY ["package.json", "/app/"]
RUN --mount=type=cache,target=/cache npm install --prefer-offline --omit-dev --cache /cache/

FROM node:slim as final
ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app
COPY --from=builder ["/app/build", "/app/build"]
COPY --from=installer ["/app/node_modules", "/app/node_modules"]
COPY ["entrypoint.sh", "package.json", "/app/"]

RUN chmod a+x entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["/app/entrypoint.sh" ]