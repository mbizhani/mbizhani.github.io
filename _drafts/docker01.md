---
layout: post
title: "Docker to the Point - Part 1"
categories: article tech
excerpt: Running containers by Docker
---

## Docker

### Introduction

Every process on your OS is executed from an application and it has only an **isolated memory space**.
However, other resources such as storage and network are shared for all processes.

_Docker_ provides a layered archive file of the application(s), called an _Image_, 
and a _virtual environment_, called a _Container_, for running process(s) of the application(s). This _virtual environment_ is isolated by
- memory
- **storage** (similar to a _hypervisor_)
- **network** (similar to a _hypervisor_)

The following class diagram illustrates the overall parts involved in Docker installed in your host.

![DockerClassDiagram](/assets/images/docker/DockerCD.png)

In a simple story, a container is started by the `docker daemon` using the `docker` client:
- At first, the image is downloaded from the registry if not already downloaded
- Docker can create one or another independent container from one image
- During container startup, Docker executes the command(s) provided in its image or passed as input parameters
- Docker may connect the container to one of its virtual network interfaces due to startup parameters, 
and even open a port on the host binding it to one of its internal process
- Docker may mount a file/directory to its internal file/directory due to startup parameters

Container(s) can be started via following ways
- Single host, some and unrelated containers - using the `docker` command
- Single host, multiple and related containers - using `docker-compose` command
- Multiple host, lots of containers - using Docker Swarm and Kubernetes 

### Installation
Docker is presented in two editions: CE (community edition) and EE (enterprise edition). Most of the time, people use its CE and in the case of this tutorial.

The installation is different due to your OS. So the best reference is the Docker site itself.
- [Debian](https://docs.docker.com/install/linux/docker-ce/debian/)
- [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
- [Windows](https://docs.docker.com/docker-for-windows/install/)

**Note**: There is a general script for Linux distributions - `sudo curl -sSL https://get.docker.com | sh`

### Docker CLI
After installing Docker, the `docker` command must be in your path and can be executed from your OS CLI app.

Following table shows some common usages of `docker` command.

Command | Description
--------|------------
`docker version` | Show version information of installed Docker client and server
`docker image ls` | List of image(s) on your host
`docker image inspect IMAGE` | Display detailed information on the image
`docker image pull IMAGE` | Download the image from Hub registry
`docker image rm IMAGE` | Remove the image from local
`docker container ls` | List only running containers
`docker container ls -a` | List all containers
`docker container stats` | Display a live stream of container(s) resource usage statistics
`docker container run IMAGE` | Download the image, if not already downloaded, and start a container from it   
`docker container top CONTAINER` | Download the image, if not already downloaded, and starts a container from it
`docker container exec CONTAINER` | Execute a command inside the container
`docker container logs CONTAINER` | Display the standard output of the container as logs

- `IMAGE` - Each image has a specific name to be addressed on a registry. The `IMAGE` reference in simple form on Hub registry is:
  > `IMAGE_NAME[:TAG]`

  `TAG` is optional and its default value is `latest`. However, defining a specific tag is highly recommended to assure you about the version of the used image.
  Some examples are `mysql:5.7`, `openjdk:8u191-alpine`, `redis:5.0.4-stretch`, etc.
  
  The general form of `IMAGE` on a registry server is:
  > `[[HOSTNAME[:PORT]/]USERNAME/]IMAGE_NAME[:TAG]`

- `CONTAINER` refers to the name or id of an container

**Note:** as stated in the previous table, the following command shows three most popular information of referred `IMAGE`.
In [MySQL](#mysql) section, details of the following command is described by an example.
> {% raw %}`docker image inspect -f '{{println "VOL =" .Config.Volumes}}{{println "ENV =" .Config.Env}}{{println "PORTS =" .ContainerConfig.ExposedPorts}}' IMAGE`{% endraw %}


### Real Examples
Lets start real and practical examples.

#### MySQL
- **Reference** [Docker Hub](https://hub.docker.com/_/mysql)
- **Image Information**
  > {% raw %}`docker image inspect -f '{{println "VOL =" .Config.Volumes}}{{println "ENV =" .Config.Env}}{{println "PORTS =" .ContainerConfig.ExposedPorts}}' mysql:5.7`{% endraw %}
  
  --|--
  `VOL = map[/var/lib/mysql:{}]` | it has a volume entry on `/var/lib/mysql` inside the container
  `ENV = [...]` | list of defined environment variables
  `PORTS = map[3306/tcp:{} 33060/tcp:{}]` | exposed ports to be bound on the host
- **Starting container**
  > `docker container run -d -v /opt/mysql/data:/var/lib/mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root --restart=always --name MySQL mysql:5.7`

  --|--
  `-d` | the container is detached and executed in background
  `-v /opt/mysql/data:/var/lib/mysql` | the volume `/var/lib/mysql` inside the container is mapped on the `/opt/mysql/data` in the host
  `-p 3306:3306` | binding ports, the general format is _PORT_ON_HOST_`:`_PORT_IN_CONTAINER_
  `-e MYSQL_ROOT_PASSWORD=root` | setting value `root` for environment variable `MYSQL_ROOT_PASSWORD`
  `--restart=always` | on next host reboot or power-on, the container starts automatically (like services in Windows)
  `--name MySQL` | `MySQL` is assigned as the name to this container to be addressed easily, and such a value that can replace `CONTAINER` in above table.
  `mysql:5.7` | the `IMAGE` reference
- **Calling _mysql_ client CLI**
  > `docker container exec -it MySQL mysql -uroot -proot`

  --|--
  `-it` (i.e. `-i -t`) | `-i`: Keep STDIN open even if not attached `-t`: Allocate a pseudo-TTY
  `mysql -uroot -proot` | the command and its arguments executed inside the container
  
  <!-- TODO: mysql client tutorial -->
- **Watching logs of mysql server**
  > `docker container logs -f MySQL`

  --|--
  `-f` | it works like `tail -f` in Linux

#### Redis
- **Reference** [Docker Hub](https://hub.docker.com/_/redis)
- **Starting container**
  > `docker container run -d -v /opt/redis/data:/data -p 6379:6379 --restart=always --name Redis redis:5.0.4 redis-server --requirepass PASSWORD`
  
  --|--
  `redis-server --requirepass PASSWORD` | passing custom command to be executed on container startup instead of its default one
- **Calling _redis-cli_ client**
  > `docker container exec -it Redis redis-cli -a PASSWORD`

  <!-- TODO: redis-cli tutorial -->
