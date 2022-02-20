#!/bin/bash

if [ ! -f ./.env ]; then
    cp ./.env.example ./.env
fi

export USER_ID="$(id -u)"
export GROUP_ID="$(id -g)"
export DOCKER_GROUP_ID="$(cut -d: -f3 < <(getent group docker))"

# application might store data in anonymous volumes and cache containers caching (docker refuses to run new docker-compose instance with newly built images if some running container from previous "up" still there), thus if we would need to restart the service, then we have to "down" it first:
docker-compose down

# application might store data in anonymous volumes which causes data persist among multiple runs which might clash with newly defined configuration (thus need to use --force-recreate):
docker-compose up --build --force-recreate --renew-anon-volumes --remove-orphans
docker-compose down

