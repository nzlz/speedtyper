FROM node:20

# Install Python and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install vcstool for repository management
RUN pip3 install --break-system-packages git+https://github.com/dirk-thomas/vcstool.git

# Install global dependencies
RUN npm install -g rimraf @nestjs/cli

EXPOSE 1337

# For development (hot reload)
CMD [ "yarn", "start:dev" ]

# For production (uncomment for prod)
# CMD [ "node", "dist/main.js" ]
