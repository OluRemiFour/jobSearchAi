# # Use Node.js 20 as the base image
# FROM node:20-slim

# RUN npm init -y &&  \
#     npm i puppeteer \
#     # Add user so we don't need --no-sandbox.
#     # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
#     && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
#     && mkdir -p /home/pptruser/Downloads \
#     && chown -R pptruser:pptruser /home/pptruser \
#     && chown -R pptruser:pptruser /node_modules \
#     && chown -R pptruser:pptruser /package.json \
#     && chown -R pptruser:pptruser /package-lock.json

#   # Set the working directory for Node.js app
# WORKDIR /usr/src/app

# # Copy package.json and npm.lock (if present)
# COPY package*.json package-lock.json ./ 

# # Install dependencies using npm
# RUN npm install

# # Copy the rest of the application
# COPY . .

# # Build the application
# RUN npm build

# # Expose the application port
# EXPOSE 3000

# # Start the application using npm
# CMD ["npm", "start"]


# Use Node.js 20 as the base image
FROM node:20-slim

# Set the working directory for your app
WORKDIR /usr/src/app

# Install required libraries for Puppeteer to work
RUN apt-get update && apt-get install -y \
  libglib2.0-0 \
  libnss3 \
  libx11-dev \
  libx264-dev \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libgdk-pixbuf2.0-0 \
  libgbm-dev \
  libasound2 \
  libxcomposite1 \
  libxrandr2 \
  libxdamage1 \
  libappindicator3-1 \
  libnspr4 \
  libudev-dev \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libsecret-1-0 \
  && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --unsafe-perm=true

# Create a non-root user for Puppeteer
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser

# Ensure 'pptruser' has access to all files and cache directories
RUN chown -R pptruser:pptruser /usr/src/app && \
    mkdir -p /home/pptruser && \
    chown -R pptruser:pptruser /home/pptruser && \
    mkdir -p /home/pptruser/.npm && \
    chown -R pptruser:pptruser /home/pptruser/.npm

# Switch to the non-root user
USER pptruser

# Copy the rest of the application files
COPY . .

# Clean up unnecessary files and logs
RUN rm -rf /usr/src/app/node_modules/puppeteer/lib/cjs/puppeteer/node/install.js && \
    rm -rf /usr/src/app/node_modules/puppeteer/lib/esm/puppeteer/node/install.js && \
    rm -rf /usr/src/app/.npmrc && \
    rm -rf /usr/src/app/package-lock.json && \
    rm -rf /usr/src/app/node_modules/puppeteer && \
    rm -rf /home/pptruser/.npm/_logs

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
