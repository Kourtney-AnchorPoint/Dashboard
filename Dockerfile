FROM node:24-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ENV VITE_PILOT_API_URL=
RUN npm run build

FROM node:24-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/src/data ./src/data
COPY --from=build /app/src/risk ./src/risk
COPY --from=build /app/package.json ./package.json

EXPOSE 8080
CMD ["node", "server/cloud-run-dashboard.mjs"]
