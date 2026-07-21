FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM dependencies AS builder
COPY . .
ARG GLIDE_API_URL=http://127.0.0.1:5000/api/v1
ARG GLIDE_APP_URL=http://localhost:3000
ENV GLIDE_API_URL=$GLIDE_API_URL
ENV GLIDE_APP_URL=$GLIDE_APP_URL
RUN npm run build

FROM node:20-alpine AS runtime
RUN apk add --no-cache tini \
    && addgroup -S glide \
    && adduser -S -G glide glide
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder --chown=glide:glide /app/public ./public
COPY --from=builder --chown=glide:glide /app/.next/standalone ./
COPY --from=builder --chown=glide:glide /app/.next/static ./.next/static
USER glide
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
