FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=www --prod /prod/www
RUN pnpm deploy --filter=stream --prod /prod/stream

FROM base AS www
COPY --from=build /usr/src/app/packages/www /prod/www
WORKDIR /prod/www
EXPOSE 3000
CMD [ "pnpm", "start" ]

FROM base AS stream
COPY --from=build /prod/stream /prod/stream
WORKDIR /prod/stream
EXPOSE 8080
CMD [ "pnpm", "start" ]
