# ---------- base: shared setup ----------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- test: runs the unit tests (build fails if a test fails) ----------
FROM base AS test
COPY src ./src
COPY test ./test
RUN npm test

# ---------- production: small image that actually gets deployed ----------
FROM base AS production
RUN npm install --omit=dev
COPY src ./src

ARG BUILD_NUMBER=local
ENV BUILD_NUMBER=${BUILD_NUMBER}
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

USER node
CMD ["npm", "start"]
