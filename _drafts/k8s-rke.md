---
layout: post
title: "Kubernetes Recipe - RKE"
categories: article tech
excerpt: Config a Kubernetes cluster with RKE
---

## Installing a K8S Cluster

**Note:** in this text, _laptop_ means your working _workstation_ or _computer_, which is used to set up k8s on the node(s).

### On Laptop
- Create SSH key
  - `ssh-keygen -t rsa -b 4096 -f ~/.ssh/rke` 
    - `$HOME/.ssh/rke` - SSH private key, keep this secure
    - `$HOME/.ssh/rke.pub` - SSH public key, copy this to nodes
    - Setting passphrase is optional.
- Install `kubectl` (and add it to the `PATH`) [Ref](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
  - `apt-get update && sudo apt-get install -y apt-transport-https gnupg2 curl`
  - `curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -`
  - `echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" > /etc/apt/sources.list.d/kubernetes.list`
  - `apt-get update`
  - `apt-get install -y kubectl`

### Prepare your Node(s)
On each node
- Check your hostname and assert `/etc/hosts`
- Disable Swap
  - `swapoff -a`
  - Remove any `swap` entry from `/etc/fstab`
- Install SSH server
- Install Docker CE
- Create user `rke`
  - `adduser rke`
  - `usermod -aG docker rke`
- Install your laptop's public ssh key (`rke.pub`)
  - `cat ~/.ssh/rke.pub | ssh rke@NODE "mkdir ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys"`
- `rke config -s` - list all images

### Run RKE
On the laptop:
- [Optional] If you have set the passphrase, install `ssh-agent` and run it
  - `eval $(ssh-agent)`
  - `ssh-add`, and enter your passphrase
- Test your SSH connection to your node(s)
  - `ssh -i ~/.ssh/rke rke@NODE_IP` - SSH login without asking `rke`'s password
- Download [RKE Release](https://github.com/rancher/rke/releases/latest), rename it to `rke`, and set it in `PATH`
- `rke config` - ask the questions to setup your k8s cluster
  - It creates a `cluster.yml`
  - Modify `cluster.yml`
    - [Optional] Set `ssh_agent_auth` to `true` if you set passphrase
    - [Optional] Prepend all `system_images` with your private registry
- `rke up`
  - It'll show `Finished building Kubernetes cluster successfully`
  - A `kube_config_cluster.yml` is created which is `kubectl` config file
  - `kubectl --kubeconfig=kube_config_cluster.yml cluster-info`
  
**Note:** you can exec `export KUBECONFIG=$(pwd)/kube_config_cluster.yml` to run `kubectl` without `--kubeconfig`.

Here is a simple `rke config` questionnaire:
```
(*) [+] Cluster Level SSH Private Key Path [~/.ssh/id_rsa]: ~/.ssh/rke
    [+] Number of Hosts [1]: 
(*) [+] SSH Address of host (1) [none]: r1
    [+] SSH Port of host (1) [22]: 
    [+] SSH Private Key Path of host (r1) [none]: 
    [-] You have entered empty SSH key path, trying fetch from SSH key parameter
    [+] SSH Private Key of host (r1) [none]: 
    [-] You have entered empty SSH key, defaulting to cluster level SSH key: ~/.ssh/rke
(*) [+] SSH User of host (r1) [ubuntu]: rke
    [+] Is host (r1) a Control Plane host (y/n)? [y]: 
(*) [+] Is host (r1) a Worker host (y/n)? [n]: y
(*) [+] Is host (r1) an etcd host (y/n)? [n]: y
    [+] Override Hostname of host (r1) [none]: 
    [+] Internal IP of host (r1) [none]: 
    [+] Docker socket path on host (r1) [/var/run/docker.sock]: 
    [+] Network Plugin Type (flannel, calico, weave, canal) [canal]: 
    [+] Authentication Strategy [x509]: 
    [+] Authorization Mode (rbac, none) [rbac]: 
    [+] Kubernetes Docker image [rancher/hyperkube:v1.19.3-rancher1]: 
    [+] Cluster domain [cluster.local]: 
    [+] Service Cluster IP Range [10.43.0.0/16]: 
    [+] Enable PodSecurityPolicy [n]: 
    [+] Cluster Network CIDR [10.42.0.0/16]: 
    [+] Cluster DNS Service IP [10.43.0.10]: 
    [+] Add addon manifest URLs or YAML files [no]: 
```
**Note:** only questions with `(*)` mark are answered, others are passed with default.

Now, some parts of a single-node `cluster.yml`
```yaml
nodes:
- address: r1
  port: "22"
  internal_address: ""
  role:
  - controlplane
  - worker
  - etcd
  hostname_override: ""
  user: rke
  docker_socket: /var/run/docker.sock
  ssh_key: ""
  ssh_key_path: ~/.ssh/rke
  ssh_cert: ""
  ssh_cert_path: ""
  labels: {}
  taints: []
services:
  ...
network:
  plugin: canal
  ...
...
ssh_key_path: ~/.ssh/rke
ssh_cert_path: ""
ssh_agent_auth: false 
...
```

### Test Cluster
- Create file `rancher-demo-deployment.yml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rancher-demo-dpl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rancher-demo
  template:
    metadata:
      labels:
        app: rancher-demo
    spec:
      containers:
        - name: rancher-demo
          image: superseb/rancher-demo

---

apiVersion: v1
kind: Service
metadata:
  name: rancher-demo-srv
spec:
  selector:
    app: rancher-demo
  ports:
    - name: rancher-demo
      protocol: TCP
      port: 8080
      targetPort: 8080

---

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: rancher-demo-ingress
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: rancher-demo-srv
                port: 
                  number: 8080
```
- `kubectl --kubeconfig=kube_config_cluster.yml apply -f rancher-demo-deployment.yml`
- Open [http://r1/](http://r1/)

## References
- [Setup a basic Kubernetes cluster with ease using RKE](https://itnext.io/setup-a-basic-kubernetes-cluster-with-ease-using-rke-a5f3cc44f26f)
- [Setting up a High-availability RKE Kubernetes Cluster](https://rancher.com/docs/rancher/v2.x/en/installation/resources/k8s-tutorials/ha-rke/)
- [Install Rancher on a Kubernetes Cluster](https://rancher.com/docs/rancher/v2.x/en/installation/install-rancher-on-k8s/)