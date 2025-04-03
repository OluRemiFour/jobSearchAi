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

# Copy package.json and package-lock.json
COPY package*.json ./

# Initialize npm (this step will create the package-lock.json if it doesn't exist)
RUN npm init -y

# Install dependencies (including Puppeteer)
RUN npm install puppeteer

# Create a non-root user for Puppeteer
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser

# Ensure that 'pptruser' has access to all files
RUN chown -R pptruser:pptruser /usr/src/app

# Switch to the non-root user
USER pptruser

# Copy the rest of the application files
COPY . .

# Build the application (if applicable)
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
