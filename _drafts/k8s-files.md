---
layout: post
title: "Kubernetes Files in a Nutshell"
categories: article tech
excerpt: Simple notes on Kubernetes files
---

## Basic
Common root elements of all K8S config files:

```yaml
apiVersion:
kind:
metadata:
  name:

spec:
```

**`apiVersion` ~ `kind` mapping**

Kind                  | API Version
----------------------|------------
Pod                   | v1
ReplicationController | v1
ReplicaSet            | apps/v1
Deployment            | apps/v1
Service               | v1

## Pod
```yaml
apiVersion: v1 
kind: Pod
metadata:
  name: sample-pod
  labels:
    app: test-pod

spec:
  containers:
    - name: busybox
      image: busybox:1.32
      tty: true
    - name: nginx
      image: nginx:1.18.0
```
- `kubectl describe pod sample-pod`
- `kubectl exec          -it sample-pod -- sh` (busybox)
- `kubectl exec -c nginx -it sample-pod -- bash` (nginx)
- All containers in the same Pod have access each other on `localhost`
```sh
user$ kubectl exec -c busybox sample-pod -- netstat -lntp
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      -
tcp        0      0 :::80                   :::*                    LISTEN      -
```

## Replication Controller
```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name: sample-rc

spec:
  replicas: 2
  template: # POD DEFINITION vvv
    metadata:
      # 'name' here is IGNORED
      labels: # REQUIRED for its implicit selector
        app: test-rc
    spec:
      containers:
        - name: busybox
          image: busybox:1.32
          tty: true
        - name: nginx
          image: nginx:1.18.0
          ports:
            - containerPort: 80
```

## ReplicaSet
```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: sample-rs

spec:
  replicas: 2
  selector: # REQUIRED
    matchLabels:
      app: test-rs
  template: # POD DEFINITION vvv
    metadata:
      labels:
        app: test-rs
    spec:
      containers:
        - name: busybox
          image: busybox:1.32
          tty: true
        - name: nginx
          image: nginx:1.18.0
          ports:
            - containerPort: 80
```
- Change Replicas:
  - Update file with new `replicas` value and `kubectl replace -f FILE` (`apply` works the same)
  - `kubectl scale --replicas=3 -f FILE`
  - `kubectl scale --replicas=3 replicaset sample-rs`
- Non-Template Pod acquisitions [[REF](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/#non-template-pod-acquisitions)]
> While you can create bare Pods with no problems, it is strongly recommended to make sure that 
> the bare Pods do not have labels which match the selector of one of your ReplicaSets.
> The reason for this is because a ReplicaSet is not limited to owning Pods specified by its template-- 
> it can acquire other Pods in the manner specified in the previous sections.

## Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-dep
spec:
  replicas: 2
  selector:
     matchLabels:
       app: test-dep
  template:
    metadata:
      labels:
        app: test-dep
    spec:
      containers:
        - name: busybox
          image: busybox:1.32
          tty: true
        - name: nginx
          image: nginx:1.18.0
```
- Mostly similar to ReplicaSet!
- Deployment Strategy - **Recreate** and **Rolling Update** (default)
- Rolling
  - `kubectl rollout status deployment sample-dep` - shows current deployment status
  - `kubectl rollout history deployment sample-dep` - shows all revisions
  - `kubectl rollout history deployment sample-dep --revision=NUM` - shows specific revision detail
  - `kubectl rollout undo deployment sample-dep` - rollbacks to previous deployment
  - `kubectl set image deployment sample-dep busybox=1.32-glibc`
- `kubectl run nginx --image=nginx` - creates a deployment

## Service
Kubernetes networking addresses four concerns [[REF](https://kubernetes.io/docs/concepts/services-networking/)]:
- Containers within a **Pod** use networking to communicate via **loopback**.
- The **Service** resource lets you expose an application running in Pods to be reachable from **outside your cluster**.
- You can also use **Services** to publish services only for consumption **inside your cluster**.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: sample-srv
spec:
  selector:
    app: test-dep
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```
