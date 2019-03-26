---
layout: post
title: "Docker to the Point - Part 1"
categories: article tech
excerpt: Running containers by Docker
---

## Introduction

Every process on your OS is executed from an application code and each process can interfere in other process's resources. 
The OS or the VM (if there is any) can provide some security and isolation mechanisms, 
however it can be different for each OS type and impose difficult configuration. 

_Docker_ provides a layered archive file of the application(s), called an _Image_, 
and a _virtual environment_, called a _Container_, for running process(s) of the application(s). This _virtual environment_ is isolated by
- memory
- **storage** (similar to a _hypervisor_)
- **network** (similar to a _hypervisor_)

The image has a layered architecture, each layer contains the differences between the preceding layer and the current layer, and
on top of the layers, there is a writable layer (the current one) which is called the _container layer_[^docker_layer].

As mentioned above, there are some similarities between Docker and a hypervisor in providing isolated resources. 
The most important difference is their focus and application. If you want a **full-fledged OS**, the hypervisor
is the solution, and if you want a **light-weight isolated virtual environment for your process(s)**, Docker is the answer. 
For example, if you want to run a [MySQL](#mysql) server, Docker is the best choice, and if you want to execute a simulation app with
GUI, virtualization is the only choice. 

The following class diagram illustrates the overall parts involved in Docker installed in your host.

![DockerClassDiagram](/assets/images/docker/DockerCD.png)

In a simple story, a container is started by the `docker daemon`, called by the `docker` client (command):
- At first, the image is downloaded from the registry if not already downloaded
- Docker can create one or another independent container from one image
- During container startup, Docker executes the command(s) provided in its image or passed as input parameters
- Docker initializes the container's network interface and may attach it to one of its virtual network subnet due to startup parameters, 
and even open a port on the host binding it to one of its internal process
- Docker may mount a file/directory to its internal file/directory due to startup parameters

Container(s) can be started via one of following ways
- `docker` command - single host, various unrelated containers
- `docker-compose` command - single host, multiple related containers
- Docker Swarm and Kubernetes - Multiple hosts with lots of containers 

## Installation
Docker is presented in two editions: CE (community edition) and EE (enterprise edition). Most of the time, people use its CE and in the case of this tutorial.

The installation is different due to your OS. So the best reference is the Docker site.
- [Debian](https://docs.docker.com/install/linux/docker-ce/debian/)
- [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
- [Windows](https://docs.docker.com/docker-for-windows/install/)

**Note**: There is a general installation script for Linux distributions - `sudo curl -sSL https://get.docker.com | sh`

## Docker CLI
After installing Docker, the `docker` command must be in your path and can be executed from your OS CLI app.

Following table shows some common usages of `docker` command.

Command | Description
--------|------------
`docker version` | Show version information of installed Docker client and server
`docker image ls` | List of image(s) on your host
`docker image inspect IMAGE` | Display detailed information on the image
`docker image pull IMAGE` | Download the image from a registry
`docker image rm IMAGE` | Remove the image from local
`docker container ls` | List running containers
`docker container ls -a` | List all containers
`docker container stats` | Display a live stream of container(s) resource usage statistics
`docker container run IMAGE` | Download the image, if not already downloaded, and start a container from it   
`docker container top CONTAINER` | Display the running processes of a container
`docker container exec CONTAINER` | Execute a command inside the container
`docker container logs CONTAINER` | Display the standard output of the container as logs

- `IMAGE` - Each image has a specific name to be addressed on a registry. The `IMAGE` reference in simple form on Docker Hub registry is:
  > `IMAGE_NAME[:TAG]`

  `TAG` is optional and its default value is `latest`. However, defining a specific tag is highly recommended to assure you about the version of the used image.
  Some examples are `mysql:5.7`, `openjdk:8u191-alpine`, `redis:5.0.4-stretch`, and etc.
  
  The general form of `IMAGE` on a registry server is:
  > `[[HOSTNAME[:PORT]/]USERNAME/]IMAGE_NAME[:TAG]`

- `CONTAINER` refers to the name or id of a container

**Note:** as stated in the previous table, the following command shows three most popular information of an `IMAGE`.
In [MySQL](#mysql) section, details of the following command is described as an example.
> {% raw %}`docker image inspect -f '{{println "VOL =" .Config.Volumes}}{{println "ENV =" .Config.Env}}{{println "PORTS =" .ContainerConfig.ExposedPorts}}' IMAGE`{% endraw %}


## Real Examples
Lets start real and practical examples.

### MySQL
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
  `-v /opt/mysql/data:/var/lib/mysql` | _HOST_`:`_CONTAINER_ for mapping volume <br/> `/var/lib/mysql` of container is mapped on `/opt/mysql/data` of host
  `-p 3306:3306` | _HOST_`:`_CONTAINER_ for binding ports
  `-e MYSQL_ROOT_PASSWORD=root` | assigning value `root` for environment variable `MYSQL_ROOT_PASSWORD`
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

### Redis
- **Reference** [Docker Hub](https://hub.docker.com/_/redis)
- **Starting container**
  > `docker container run -d -v /opt/redis/data:/data -p 6379:6379 --restart=always --name Redis redis:5.0.4 redis-server --requirepass PASSWORD`
  
  --|--
  `redis-server --requirepass PASSWORD` | passing custom command to be executed on container startup instead of its default one
- **Calling _redis-cli_ client**
  > `docker container exec -it Redis redis-cli -a PASSWORD`

  <!-- TODO: redis-cli tutorial -->

## References
[^docker_layer]: [Docker Layers Explained](https://dzone.com/articles/docker-layers-explained)