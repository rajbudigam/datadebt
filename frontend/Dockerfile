FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
COPY next.config.mjs ./
COPY postcss.config.mjs ./
COPY tailwind.config.ts ./
RUN npm install
COPY app ./app
COPY .env.example ./
RUN npx tailwindcss -i app/globals.css -o /dev/null || true
EXPOSE 3000
CMD ["npm","run","dev"]
