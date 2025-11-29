# ui/Dockerfile

FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

