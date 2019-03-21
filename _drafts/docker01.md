---
layout: post
title: "Docker to the Point - Part 1"
categories: article tech
excerpt: Running containers by Docker
---

## Docker

### Introduction

Every process on your OS has only an **isolated memory space**. However, other resources such as storage and network are shared for all processes.
_Docker_ provides a `virtual environment` for one or more processes inside it, called a `Container`, to be isolated by
- CPU allocation
- memory space and allocation
- storage
- networking

The following class diagram illustrates the overall parts involved in Docker installed in your OS.

![DockerClassDiagram](/assets/images/docker/DockerCD.png)

By following steps, a container is started by the `docker daemon` using the `docker` client:
1. The image is downloaded from the registry if not already downloaded
2. Docker can create one or more independent containers from one image
3. For starting up the container, Docker executes the command(s) provided in it or as passed parameters
3. Docker may connect the container to one of its virtual network interfaces due to startup parameters, 
and even opening a port on the host binding it to one of its internal process
4. Docker may mount a file/directory to its internal file/directory due to startup parameters


### Installation
The installation is different due to your OS. So the best reference is the Docker site itself.
- [Debian](https://docs.docker.com/install/linux/docker-ce/debian/)
- [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
- [Windows](https://docs.docker.com/docker-for-windows/install/)

**Note**: There is a general script for Linux distributions - `sudo curl -sSL https://get.docker.com | sh`

### Docker CLI
After installing Docker, the `docker` command must be in your path and can be executed from your OS CLI app.
An image has a specific name to be addressed on a registry. The `IMAGE` reference in simple form on Hub registry is:
> `IMAGE_NAME[:TAG]`

Note that `TAG` is optional and its default value is `latest`. However, defining a specific tag is highly recommended to assure you about the specific version of an image.
Some examples are `mysql:5.7`, `openjdk:8u191-alpine`, `redis:5.0.4-stretch`, etc.

The general form of `IMAGE` on a registry server is:
> `[[HOSTNAME[:PORT]/]USERNAME/]IMAGE_NAME[:TAG]`

Following table shows some common usage of `docker` command.

Command | Description
--------|------------
`docker version` | Show version information of installed Docker client and server
`docker image ls` | List of image(s) on your host
`docker image pull IMAGE` | Download the image from Hub registry
`docker image rm IMAGE` | Remove the image from local
`docker container ls` | List only running containers
`docker container ls -a` | List all containers
`docker container stats` | Display a live stream of container(s) resource usage statistics
`docker container run IMAGE` | Download the image, if not already downloaded, and starts a container from it   
`docker container top CONTAINER` | Download the image, if not already downloaded, and starts a container from it
`docker container exec CONTAINER` | Execute a command inside the container
`docker container logs CONTAINER` | Display the standard output of the container as logs

Note: the `CONTAINER` refers to the name or id of an container

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
  `-p 3306:3306` | binding ports, the general format is `PORT_ON_HOST:PORT_IN_CONTAINER`
  `-e MYSQL_ROOT_PASSWORD=root` | setting value `root` for environment variable `MYSQL_ROOT_PASSWORD`
  `--restart=always` | on next host reboot or power-on, the container starts automatically (like services in Windows)
  `--name MySQL` | `MySQL` is assigned as the name to this container to be addressed easily
  `mysql:5.7` | the `IMAGE` reference
- **Calling _mysql_ client**
  > `docker container exec -it MySQL mysql -uroot -proot`

  --|--
  `-it` (i.e. `-i -t`) | two switches to attache a tty and standard input for executing the command
  `mysql -uroot -proot` | the command and its arguments executed inside the container
- **Watching logs of mysql server**
  > `docker container logs -f MySQL`

  --|--
  `-f` | it works like `tail -f` in Linux

#### Redis
- **Reference** [Docker Hub](https://hub.docker.com/_/redis)
- **Starting container**
  > `docker container run -d -v /opt/redis/data:/data -p 6379:6379 --restart=always --name Redis redis:5.0.4 redis-server --requirepass maxsa`
