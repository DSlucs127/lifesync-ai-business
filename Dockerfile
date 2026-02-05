# Build Stage
FROM node:18-alpine as build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine
WORKDIR /app

# Setup backend
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install --production
COPY backend ./

# Setup frontend assets
WORKDIR /app
COPY --from=build /app/dist ./dist

# Run
WORKDIR /app/backend
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
