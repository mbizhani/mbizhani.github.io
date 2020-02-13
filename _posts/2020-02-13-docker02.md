---
layout: post
title: "Docker to the Point - Part 2"
categories: article tech
excerpt: Using Docker Compose to run multiple containers
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

TRAEFIK_VER=2.1.3
PORTAINER_VER=1.23.0

BUSYBOX_VER=1.31.1-glibc
NGINX_VER=1.17.2

CONFLUENT_VER=5.3.1-1
KAFDROP_VER=3.23.0

REDIS_VER=5.0.7
REDIS_PASSWD=ReDis

MYSQL_VER=8.0.19
MYSQL_PASSWS=rOOt
ADMINER_VER=4.7.6-standalone
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
  - **Note**: relative volume is only possible in `docker-compose` and later it is translated into absolute directory 
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
- Lines 8 enables dashboard and lines 9 create an `entrypoint` for the dashboard on port `8080`
- Lines 13-20 configure dashboard with basic-auth and redirection to `/dashbiard`
  - Line 18 defines basic-auth middleware with user `admin` ([REF](https://docs.traefik.io/v2.0/middlewares/basicauth/))
    - Using `echo $(htpasswd -nb user password) | sed -e s/\\$/\\$\\$/g` command to generate the expression
    - **Note**: `htpasswd` is installed via `apache2-utils` package on Debian
  - Lines 19 and 20 enables the redirection to `/dashboard`
    - In line 20, the `${1}` refers to the group defined in the regex in previous line  

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
```yaml
version: '3.6'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:${CONFLUENT_VER:-latest}
    restart: always
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    volumes:
      - ${VOL_BASE_DIR:-.}/zookeeper/data:/var/lib/zookeeper/data
      - ${VOL_BASE_DIR:-.}/zookeeper/log:/var/lib/zookeeper/log
    networks:
      - net

  kafka:
    image: confluentinc/cp-kafka:${CONFLUENT_VER:-latest}
    restart: always
    depends_on:
      - zookeeper
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

      # Multi-Net Config
      KAFKA_LISTENERS: INSIDE://:9092,OUTSIDE://:29092
      KAFKA_ADVERTISED_LISTENERS: INSIDE://kafka:9092,OUTSIDE://localhost:29092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: INSIDE:PLAINTEXT,OUTSIDE:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: INSIDE

      # All-Same-Net Simple Config
      # KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
    volumes:
      - ${VOL_BASE_DIR:-.}/kafka/data:/var/lib/kafka/data
    ports:
      - 29092:29092
    networks:
      - net

  kafdrop:
    image: obsidiandynamics/kafdrop:${KAFDROP_VER:-latest}
    restart: always
    depends_on:
      - kafka
    environment:
      JVM_OPTS: "-Xms16M -Xmx48M"
      KAFKA_BROKERCONNECT: kafka:9092
      SERVER_PORT: 9090
      SERVER_SERVLET_CONTEXTPATH: "/"
    ports:
      - 9090:9090
    networks:
      - net
```
- Kafka Networking Config ([REF](https://docs.confluent.io/current/kafka/multi-node.html)):
  - All containers attached to `net` network can connect to `kafka` server via port `9092` through `INSIDE://:9092` listener advertised by `INSIDE://kafka:9092`, such as `kafdrop`
  - Other clients on the host (localhost) can connect to kafka server via port `29092` through `OUTSIDE://:29092` listener advertised by `OUTSIDE://localhost:29092`
- `docker-compose exec kafka bash` - Check Kafka Server
  - Topic commands
    - `kafka-topics --zookeeper zookeeper:2181 --list`
    - `kafka-topics --zookeeper zookeeper:2181 --create --partitions 3 --replication-factor 1 --if-not-exists --topic bar`
    - `kafka-topics --zookeeper zookeeper:2181 --describe --topic bar`
  - Messaging commands
    - `seq -f "MSG_ID: %03g" 20 | kafka-console-producer --broker-list localhost:9092 --topic bar && echo 'Messages Are Sent'`
    - `kafka-console-consumer --bootstrap-server localhost:9092 --from-beginning --topic bar --max-messages 10`
    - Note: the order of messages are based on partitions 
- For Clustered Deployment on Docker check [[REF](https://docs.confluent.io/5.0.0/installation/docker/docs/installation/clustered-deployment.html)]

### Redis
```yaml
  redis:
    image: redis:${REDIS_VER:-latest}
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWD:-redis} --appendonly yes
    ports:
      - 6379:6379
    volumes:
      - ${VOL_BASE_DIR:-.}/redis:/data
    networks:
      - net
```
- `docker-compose exec redis redis-cli -a ReDis` - Interactive Redis CLI
- Syntax: `redis-cli [-h HOST] [-p PORT] [-a PASSWORD]`
-Commands
  - `ping`
  - `keys *` - return all keys
  - `type KEY` - check type of value
  - `del KEY`
  - Getting values - Redis supports multiple types of data ([REF](https://redis.io/topics/data-types-intro))
    - `get KEY` - string
    - `smembers KEY` - set
    - `lrange KEY START END` - list
- `docker-compose exec redis redis-cli -a ReDis --stat [-i INTERVAL]` - Continuous stats mode

### MySQL
```yaml
  mysql:
    image: mysql:${MYSQL_VER:-latest}
    restart: always
    ports:
      - 3306:3306
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWS:-root}
    volumes:
      - ${VOL_BASE_DIR:-.}/mysql:/var/lib/mysql
    networks:
      - net

  adminer:
    image: adminer:${ADMINER_VER:-latest}
    restart: always
    ports:
      - 8080:8080
    environment:
      ADMINER_DESIGN: ng9
    networks:
      - net
```
- [What’s New in MySQL 8.0?](https://mysqlserverteam.com/whats-new-in-mysql-8-0-generally-available/) 
- `docker-compose exec mysql -uroot -prOOt` - Run MySql CLI
  - Syntax: `mysql -uUSER -pPASSWORD` (no space!)
  - `show databases;`
  - `create database DB;`
  - `use DB`
  - `show tables;`
  - `desc TABLE;`
  - `create user USER identified by 'PASSWORD';`
  - `grant all privileges on DB.* to USER;`
- `docker-compose exec mysql mysqldump -uUSER -pPASSWORD DB | grep -v Warning | gzip > DB_$(date +'%Y-%m-%d_%H-%M-%S').sql.gz`
- `zcat DB.sql.gz | docker-compose exec -T mysql mysql -uUSER -pPASSWORD DB`
  - **Note**: By default `docker-compose exec` allocates a tty, so `-T` disables pseudo-tty allocation. 