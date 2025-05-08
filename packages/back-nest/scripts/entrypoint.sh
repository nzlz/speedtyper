
#!/bin/bash

cd /app

./scripts/clone-repos.sh

yarn install

yarn start:dev