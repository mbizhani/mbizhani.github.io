---
layout: post
title: "Docker to the Point - Part 3"
categories: article tech
excerpt: Using Docker to Create a DevOps Environment
---

## Introduction

In this post, a DevOps environment is created using Compose. The following picture shows the participating components in 
this post:

1. **Git Server** - At its core, a git server is required for developers to push/merge their code. Then, the git server can 
call a CI/CD server/agent to execute a `pipeline` based on the defined event/hook. 
For git server, in this post [`GitLab CE`](https://hub.docker.com/r/gitlab/gitlab-ce) is used.

2. **CI/CD Server** - Jenkins is one of the most famous CI/CD applications. However, [`GitLab Runner`](https://hub.docker.com/r/gitlab/gitlab-runner)
is more convenient as it is the integrated and default CI/CD tool for GitLab server.

3. **Artifact/Image Repository** - After source code build, the output artifact must be shipped to the server. 
Since Docker is used to run applications on servers, the final package must be deployed as Docker image. 
So a registry is required in this case to mediate images between servers. [`Sonatype Nexus 3`](https://hub.docker.com/r/sonatype/nexus3) is 
a professional repository management tool and it supports various development/build tools such as maven, npm, and so on.

4. **Deployment Servers/Cluster** - At the end of a CD pipeline, a server or cluster is required for executing the container(s). 
The CD can be translated into following paradigms:
  - `Continuous Delivery` - it targets a pre-production environment, called development/test, to evaluate the release by QA users or customers.
  - `Continuous Deployment` - after QA/customer validation and verification cycles, in another pipeline, the final release can be deployed in production. 

<img alt="DevOps" src="/assets/images/docker/DevOps-blueprint.png" class="mx-auto d-block img-thumbnail"/>

## Installation

The DevOps environment is installed via Docker Compose. So it is the prerequisite, and you can learn about it in [Docker to the Point - Part 2]({% post_url 2020-02-13-docker02 %}). 
It is also highly recommended to setup all the containers on the Linux box without any graphical desktop and `NetworkManager` must be disabled. 
You can use a virtual machine software. 

**_Note_**
> During evaluation of this example, some unexpected network issues are encountered. 
After some search, due to this [[Ref](https://success.docker.com/article/should-you-use-networkmanager)], 
Docker strongly recommends that `NetworkManager` must be disabled.

Now, create the directory `DevOps` containing the following files:
1. `.env` - a key-value file for defined variables in other files
2. `init.sh` - an initialization script
3. `docker-compose.yml` - main Compose file
4. `register-runner.sh` - a script to register `gitlab-runner` container in GitLab server

Then, follow the below steps (commands should be executed in `DevOps` directory):
1. `chmod +x init.sh && sudo ./init.sh`
2. `docker-compose up -d`
3. Config [GitLab Server](#gitlab)
4. Register [GitLab Runner](#gitlab-runner)
5. Config [Nexus](#sonatype-nexus-3)

### `.env`

```sh
EXT_NET=mynet
VOL_BASE_DIR=/opt/docker_vols

TRAEFIK_VER=2.1.3

GITLAB_VER=12.1.0-ce.0
GITLAB_DOMAIN=devops.ir
GITLAB_RUNNER_VER=alpine-v12.7.1

NEXUS_VER=3.20.1
```

**Note**: the `GITLAB_DOMAIN` is assigned to GitLab's container hostname and it is only useful for GilLab to generate the clone link 
as shown in the following picture:

<img alt="git prj" src="/assets/images/docker/DevOps-gitlab-project.png" class="mx-auto d-block img-thumbnail w-75"/>

### `init.sh`

```sh
#! /bin/bash

CUR_DIR="$(dirname "$0")"
source "${CUR_DIR}/.env"

NEXUS_VOL_DIR="${VOL_BASE_DIR}/nexus"
mkdir -p "${NEXUS_VOL_DIR}"
chown 200:200 "${NEXUS_VOL_DIR}"

docker network create ${EXT_NET} || true
```

### `docker-compose.yml`

```yaml
version: '3.6'

services:

  gitlab:
    image: gitlab/gitlab-ce:${GITLAB_VER:?err}
    hostname: ${GITLAB_DOMAIN:?err}
    restart: always
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        gitlab_rails['registry_enabled'] = false
        registry['enable'] = false
        gitlab_rails['backup_keep_time'] = 604800
    labels:
      - "traefik.enable=true"
      - "traefik.http.services.gitlab.loadbalancer.server.port=80"
      - "traefik.http.routers.gitlab.service=gitlab"
      - "traefik.http.routers.gitlab.entrypoints=http"
      - "traefik.http.routers.gitlab.rule=PathPrefix(`/`)"
    volumes:
      - ${VOL_BASE_DIR:?err}/gitlab/config:/etc/gitlab
      - ${VOL_BASE_DIR:?err}/gitlab/logs:/var/log/gitlab
      - ${VOL_BASE_DIR:?err}/gitlab/data:/var/opt/gitlab
    networks:
      - net

  gitlab-runner:
    image: gitlab/gitlab-runner:${GITLAB_RUNNER_VER:?err}
    restart: always
    privileged: true
    volumes:
      - ${VOL_BASE_DIR:?err}/gitlab-runner/config:/etc/gitlab-runner
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - net

  nexus:
    image: sonatype/nexus3:${NEXUS_VER:?err}
    restart: always
    environment:
      NEXUS_CONTEXT: nexus
    labels:
      - "traefik.enable=true"

      - "traefik.http.services.nexus.loadbalancer.server.port=8081"
      - "traefik.http.routers.nexus.entrypoints=http"
      - "traefik.http.routers.nexus.service=nexus"
      - "traefik.http.routers.nexus.rule=PathPrefix(`/nexus`)"

      - "traefik.http.services.nexusDocker.loadbalancer.server.port=8082"
      - "traefik.http.routers.nexusDocker.service=nexusDocker"
      - "traefik.http.routers.nexusDocker.entrypoints=http"
      - "traefik.http.routers.nexusDocker.rule=PathPrefix(`/v2`)"
    ports:
      # Docker Group Repo
      - 8082:8082
      # Docker Private Repo
      - 8083:8083
    volumes:
      - ${VOL_BASE_DIR:?err}/nexus:/nexus-data
    networks:
      - net

  traefik:
    image: traefik:${TRAEFIK_VER:?err}
    command:
      - "--providers.docker"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.http.address=:80"
      # Dashboard
      - "--api"
      - "--entrypoints.traefik.address=:8080"
    restart: always
    labels:
      # Dashboard
      - "traefik.enable=true"
      - "traefik.http.routers.api.entrypoints=traefik"
      - "traefik.http.routers.api.rule=PathPrefix(`/`)"
      - "traefik.http.routers.api.service=api@internal"
      - "traefik.http.routers.api.middlewares=dashAuth,dashRdir"
      - "traefik.http.middlewares.dashAuth.basicauth.users=admin:$$apr1$$PSIlVhdx$$Np60QsO9D2zneaUjWdaqA0"
      - "traefik.http.middlewares.dashRdir.redirectregex.regex=^(http://[^:/]+(:\\d+)?)(/|/dashboard)$$"
      - "traefik.http.middlewares.dashRdir.redirectregex.replacement=$${1}/dashboard/"
    ports:
      - 80:80
      - 8080:8080
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - net

networks:
  net:
    external: true
    name: ${EXT_NET:?err}
```

### `register-runner.sh`

```sh
#! /bin/bash

CUR_DIR="$(dirname "$0")"
source "$CUR_DIR/.env"

if [ "$1" ]; then

	echo "Token=[${1}], Domain=[${GITLAB_DOMAIN}], VolBaseDir=[${VOL_BASE_DIR}]"

	docker run --rm -it \
	  -v ${VOL_BASE_DIR}/gitlab-runner/config:/etc/gitlab-runner \
	  --network ${EXT_NET} \
	  gitlab/gitlab-runner:${GITLAB_RUNNER_VER} register \
	  --non-interactive \
	  --executor "docker" \
	  --docker-image docker:stable \
	  --url "http://${GITLAB_DOMAIN}/" \
	  --docker-network-mode ${EXT_NET} \
	  --docker-privileged \
	  --registration-token "${1}" \
	  --description "docker-gitlab-runner" \
	  --tag-list "default" \
	  --run-untagged="true" \
	  --locked="false" \
	  --access-level="not_protected" \
	  --docker-volumes /var/run/docker.sock:/var/run/docker.sock
else
	echo "ERROR: $0 TOKEN"
fi
```

## Applications

Now execute `docker-compose ps` and you must see all containers state `Up` (GitLab may take some time to be become `healthy`).
The following sections describe each application.

**Note**: the `HOST` refers to the host running these containers.

### Traefik

The Traefik reverse proxy is setup due to previous article [Docker to the Point - Part 2]({% post_url 2020-02-13-docker02 %}/#traefik):

- `http://HOST:8080` - Traefik dashboard with basic auth `admin:admin`

<img alt="traefik01" src="/assets/images/docker/DevOps-traefik01.png" class="mx-auto d-block img-thumbnail w-75"/>

<img alt="traefik02" src="/assets/images/docker/DevOps-traefik02.png" class="mx-auto d-block img-thumbnail w-75"/>

### GitLab

The GitLab server is accessible via `http://HOST`. At first, it asks you the password for user `root`. 
Then you can login via user `root` and the entered password:

- GitLab references for Docker ([GitLab Docker](https://docs.gitlab.com/omnibus/docker/))
- In `docker-compose.yml` lines 10-12, a default config is passed to container via `GITLAB_OMNIBUS_CONFIG`:
  - `gitlab_rails['registry_enabled'] = false` and `registry['enable'] = false` - default GitLab registry for Docker is disabled
  - `gitlab_rails['backup_keep_time'] = 604800` - for backup, 7-days retention window is set
- Disable `Auto DevOps` - Goto `Admin Area > Settings > CI/CD`
- Create a group for all of your projects and set CI/CD variables in that group
- The runner container must be added to GitLab server and you need the token in `registry-runner.sh` script.
The token is in `Admin Area > Overview > Runners` in the following picture:

<img alt="gitlab-runner-token" src="/assets/images/docker/DevOps-gitlab-runner-token.png" class="mx-auto d-block img-thumbnail w-75"/>

### GitLab Runner

The GitLab Runner is the agent for CI/CD of GitLab server. You can register multiple runners for a single GitLab server, 
and in this way the CI/CD processes can be spread over multiple nodes and CI/CD becomes scalable.

- GitLab Runner reference for registration via Docker ([Registering Runners](https://docs.gitlab.com/runner/register/index.html#docker)) 
- In the previous image copy the token and execute `./register-runner.sh TOKEN`. 
The `gitlab-runner` container is registered as a runner as depicted in the following picture:

<img alt="runner" src="/assets/images/docker/DevOps-gitlab-runner.png" class="mx-auto d-block img-thumbnail w-75"/> 

### Sonatype Nexus 3

Sonatype Nexus is one of the greatest open source repository management software. It supports various repository types such as
_Docker registry_, _Maven_, _NPM_, and so on. This post only presents its Docker registry feature.

**Note**: In spite of Docker registry feature in GitLab, Nexus 3 is still the favorite repository management application for
supporting other types of repository such as maven, npm, and so on. If you only need a Docker registry, then GitLab may be more convenient.

- `http://HOST/nexux` - First page of Nexus
- Login with user `admin` and the password is in `${VOL_BASE_DIR}/nexus/admin.password` temp file.
- Create a blob store called `docker` 
- Create a **hosted** Docker repository on HTTP port `8083`
- Create a **group** Docker repository on HTTP port `8082` and add previous one to this
- Enable `Docker Bearer Token Realm`
- To push an image to hosted repo
  - `docker login -u USER -p PASS HOST:8083`
  - `docker push HOST:8083/NAME:VER`
- To pull from group repo
  - `docker pull HOST/NAME:VER`
  - Default port is enabled in Traefik for Nexus with `/v2` router (`docker-compose.yml` lines 50-53)

**Note**: The `HOST` and `HOST:8083` must be added as `insecure-registries` in `/etc/docker/daemon.json` config file for
any Docker daemon to push to/pull from the Nexus server.