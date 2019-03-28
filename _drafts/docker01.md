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

As mentioned above, there are some similarities between **Docker and a hypervisor** in providing isolated resources. 
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
- Docker initializes the container's network interface and may attach it to one of its virtual networks due to startup parameters, 
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
  
  The general form of `IMAGE` on a registry server is[^docker_fqn]:
  > `[[HOSTNAME[:PORT]]/USERNAME]/REPONAME[:TAG]`

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
  
### Oracle Database
- **Reference** [Docker Hub](https://hub.docker.com/_/oracle-database-enterprise-edition)
  - Click on "Proceed to Checkout"
- Some official images, like Oracle DB, is available through Docker Store, and they need an account on [Docker Hub](https://hub.docker.com/)
- **Starting container**
  - `docker login` - you need to login to access this image
  > `docker run -d -it -p 1521:1521 -v /opt/oradb/data:/ORCL --name OracleDB store/oracle/database-enterprise:12.2.0.1`
  
  note: the container for Oracle DB needs the `-it` switches, even if it is detached
- **Calling _sqlplus_ client**
  - Oracle 12c introduces a new architecture called **multitenant**. In this new architecture, a database instance consists of two main component
    - A **container**, called _CDB_, which is the basis environment of the instance
    - One or more **pluggable DBs**, called _PDB_, which is an end-user database for the application (this image has only one PDB)
  - SqlPlus for `sys@CDB`
  > `docker exec -it OracleDB /bin/bash -c "source /home/oracle/.bashrc; sqlplus '/ as sysdba'"`
  - SqlPlus for `sys@PDB` - as default, the PDB's name is `ORCLPDB1` and the `sys` password is `Oradoc_db1`
  > `docker exec -it OracleDB /bin/bash -c "source /home/oracle/.bashrc; sqlplus sys/Oradoc_db1@ORCLPDB1 as sysdba"`
  
  <!-- TODO: sqlplus tutorial -->
  
### Sonatype Nexus
- **Reference** [Docker Hub](https://hub.docker.com/r/sonatype/nexus3)
- **Starting container**
    > `mkdir -p /opt/nexus/data` <br/>
    > `chown -R 200:200 /opt/nexus` <br/>
    > `docker run -d -v /opt/nexus/data:/nexus-data -p 8081:8081 -e NEXUS_CONTEXT=nexus --restart=always --name Nexus sonatype/nexus3:3.15.2`

    --|--
    `-e NEXUS_CONTEXT=nexus` | Start the server with `/nexus` context path (useful for Nginx forwarding)

    - Test the server - `curl -u admin:admin123 http://localhost:8081/nexus/service/metrics/ping`
    - Visit [localhost:8081/nexus](http://localhost:8081/nexus), and login with default username `admin` and password `admin123`

### Jenkins Blue Ocean
- **Reference** [Docker Hub](https://hub.docker.com/r/jenkinsci/blueocean)
- **Starting container**
  > `docker run -u root -d -v /opt/jenkins:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock -p 8080:8080 -e JENKINS_OPTS="--prefix=/jenkins" --restart=always --name Jenkins jenkinsci/blueocean:1.14.0`

    --|--
    `-u root` | Username or UID (format: <name\|uid>\[:<group\|gid>\]) <br/>Set `root` user as the starter and owner of the process
    `-v /var/run/docker.sock:/var/run/docker.sock` | Allow jenkins to create a container by calling Docker on your host (**Docker-in-Docker**)
    `-e JENKINS_OPTS="--prefix=/jenkins"` | Start the server with `/jenkins` context path (useful for Nginx forwarding)
    
    - Visit [localhost:8080/jenkins](http://localhost:8080/jenkins)

## References
[^docker_layer]: [Docker Layers Explained](https://dzone.com/articles/docker-layers-explained)
[^docker_fqn]: [Referencing Docker Images](https://windsock.io/referencing-docker-images/)