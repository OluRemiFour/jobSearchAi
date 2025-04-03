# Use Node.js 20 as the base image
FROM node:20-slim

RUN npm init -y &&  \
    npm i puppeteer \
    # Add user so we don't need --no-sandbox.
    # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
    && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /node_modules \
    && chown -R pptruser:pptruser /package.json \
    && chown -R pptruser:pptruser /package-lock.json

  # Set the working directory for Node.js app
WORKDIR /usr/src/app

# Copy package.json and npm.lock (if present)
COPY package*.json package-lock.json ./ 

# Install dependencies using npm
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm build

# Expose the application port
EXPOSE 3000

# Start the application using npm
CMD ["npm", "start"]
