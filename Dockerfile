# Use an official Node.js image as a base
# Vite 8 requires Node.js ^20.19.0 || >=22.12.0
FROM node:22-alpine as build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application to the working directory
COPY . .

# Build the React app
RUN npm run build

# Use nginx as a lightweight web server to serve the static files
FROM nginx:alpine

# Copy the build output from the previous stage to nginx's default public directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
