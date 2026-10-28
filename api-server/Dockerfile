FROM node:20-bookworm-slim
WORKDIR /app
COPY package.json ./
RUN npm install 2>&1 | tail -5
COPY src/ ./src/
EXPOSE 8080
CMD ["node", "src/index.js"]
