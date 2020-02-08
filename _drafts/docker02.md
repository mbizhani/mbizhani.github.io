---
layout: post
title: "Docker to the Point - Part 2"
categories: article tech
excerpt: Running multiple containers by docker-compose
---

## Introduction

`docker-compose` is a tool for defining and running multi-container Docker applications on a single node/host. 
With Compose, you use a YAML file to configure your application’s services. Then, with a single command, 
you create and start all the services from your configuration ([REF](https://docs.docker.com/compose)).

For installation, some linux distributions such as Debian has a proper package. 
Another solution is to download the single command-file from its GitHub using the following command ([REF](https://docs.docker.com/compose/install/)):

```sh
sudo curl -L \
  "https://github.com/docker/compose/releases/download/1.25.3/docker-compose-$(uname -s)-$(uname -m)" \ 
  -o /usr/local/bin/docker-compose
suso chmod +x /usr/local/bin/docker-compose
```

**Note**: To install a different version of Compose, substitute `1.25.3` with the version of Compose you want to use.

### Compose Features

- **Multiple isolated environments on a single host**
  - Uses a project name to isolate environments from each other
  - The default project name is the basename of the project directory
- **Preserve volume data when containers are created**
  - When `docker-compose up` runs, if it finds any containers from previous runs, it copies the volumes from the old container to the new container
- **Only recreate containers that have changed**
  - Compose caches the configuration used to create a container. When you restart a service that has not changed, Compose re-uses the existing containers. Re-using containers means that you can make changes to your environment very quickly.
- **Variables and moving a composition between environments**
  - Variables can be used in the Compose file
  - Variables from the shell environment such as `${USER}` can be addressed
  - Variables also can be defined in a `.env` file beside the Compose file in `key=value` format
  - Variables can be used in the following formats
    - `${VARIABLE}` or `$VARIABLE` - simple
    - `${VARIABLE:-default}` evaluates to `default` if `VARIABLE` is _unset_ or _empty_ in the environment.
    - `${VARIABLE-default}` evaluates to `default` only if `VARIABLE` is _unset_ in the environment.
    - `${VARIABLE:?err}` exits with an error message showing `err` if `VARIABLE` is _unset_ or _empty_ in the environment.
    - `${VARIABLE?err}` exits with an error message showing `err` if `VARIABLE` is _unset_ in the environment.

## The `.env` file

```sh
VOL_BASE_DIR=/opt/docker_vols
BUSYBOX_VER=1.31.1-glibc
NGINX_VER=1.17.2
PORTAINER_VER=1.23.0
TRAEFIK_VER=2.1.3
```

## First Sample

In the following `yml`, some images are used to illustrate various `docker-compose` features alongside the above `.env` file. 
Before execution, run `docker network create main_net`.

```yaml
version: '3.6'

services:

  traefik:
    image: traefik:${TRAEFIK_VER:?ver}
    command:
      - "--api.insecure"
      - "--providers.docker"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.http.address=:80"
    restart: always
    ports:
      - 80:80
      - 8080:8080
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - web

  portainer:
    image: portainer/portainer:${PORTAINER_VER:-latest}
    command: -H unix:///var/run/docker.sock
    restart: always
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=PathPrefix(`/portainer`)"
      - "traefik.http.routers.portainer.middlewares=portainerRedir,portainerPStrip"
      - "traefik.http.middlewares.portainerPStrip.stripprefix.prefixes=/portainer"
      - "traefik.http.middlewares.portainerRedir.redirectregex.regex=^(.*)/portainer$$"
      - "traefik.http.middlewares.portainerRedir.redirectregex.replacement=$${1}/portainer/"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ${VOL_BASE_DIR:-.}/Portainer:/data
    networks:
      - web

  nginx:
    image: nginx:${NGINX_VER:-latest}
    restart: always
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nginx.rule=PathPrefix(`/web`)"
      - "traefik.http.routers.nginx.middlewares=nginxPStrip"
      - "traefik.http.middlewares.nginxPStrip.stripprefix.prefixes=/web"
    networks:
      - web

  busybox:
    image: busybox:${BUSYBOX_VER:-latest}
    hostname: busybox
    restart: always
    tty: true
    networks:
      - ext
      - web

networks:
  web:
  ext:
    external: true
    name: main_net
```

Copy sample in `docker-compose.yml` and save it in a directory called `Example` (just to simplify the sample), so the `example` is the project name.
Also create `.env` in this directory. Now run `docker-compose up -d`:

- `example_web` docker network is created
- `docker-compose ps` - four containers are created
  - `example_busybox_1`
  - `example_nginx_1`
  - `example_portainer_1`
  - `example_traefik_1`
- `docker-compose logs -f traefik` - watch the `traefik` service log
- `docker-compose exec busybox sh` - the `sh` program is executed in the `busybox` service. Now execute following commands:
  - `hostname` - result: `busybox` (line 51)
  - `ip a` - result: 3 interfaces - `lo`, one for `web` and the other for `ext`
  - `ping traefik` and `ping example_traefik_1` show the same result. The `traefik` is set as alias for container `example_traefik_1`
  ({% raw %}`docker container inspect -f '{{ .NetworkSettings.Networks.example_web.Aliases }}' example_traefik_1`{% endraw %})
  - `telnet traefik 80`, `telnet nginx 80`, and `telnet portainer 9000` - you can telnet the services
- Traefik is the reverse proxy. Access the following URLs:
  - [http://localhost:8080](http://localhost:8080) - Traefik dashboard (enabled by `--api.insecure=true`)
  - [http://localhost/web](http://localhost/web) - Nginx default page
  - [http://localhost/portainer](http://localhost/portainer) - Portainer application
- For volumes, `./DIR` can be used to create a `DIR` in current directory on host (line 34 if `VOL_BASE_DIR` is undefined).
  - Note: relative volume is only possible in `docker-compose` and later it is translated into absolute directory 
  ({% raw %}`docker container inspect -f '{{ .HostConfig.Binds }}' example_portainer_1`{% endraw %})
- `docker-compose stop` - stop all running containers
- `docker-compose start` - start all stopped containers
- `docker-compose down` - stop and remove all containers and then remove `web` network (owned networks by the compose file)

## Services

### Traefik

```yaml
  traefik:
    image: traefik:${TRAEFIK_VER:?ver}
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
```

### Portainer

```yaml
  portainer:
    image: portainer/portainer:${PORTAINER_VER:-latest}
    command: -H unix:///var/run/docker.sock
    restart: always
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=PathPrefix(`/portainer`)"
      - "traefik.http.routers.portainer.middlewares=portainerRedir,portainerPStrip"
      - "traefik.http.middlewares.portainerPStrip.stripprefix.prefixes=/portainer"
      - "traefik.http.middlewares.portainerRedir.redirectregex.regex=^(.*)/portainer$$"
      - "traefik.http.middlewares.portainerRedir.redirectregex.replacement=$${1}/portainer/"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ${VOL_BASE_DIR:-.}/Portainer:/data
    networks:
      - net
```

### Kafka

### Redis

### MySQL

### DevOps

#### GitLab & GitLab Runner

#### Nexus

#### Grafana

#### Prometheus & Alert Manager

#### Node Exporter

#### CAdvisor