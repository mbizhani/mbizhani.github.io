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
  namespace: # OPTIONAL
  labels:    # OPTIONAL

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
PersistentVolume      | v1
PersistentVolumeClaim | v1

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
          ports: # OPTIONAL (nginx is on port 80 by default)
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
> Kubernetes networking addresses four concerns [[REF](https://kubernetes.io/docs/concepts/services-networking/)]:
> - Containers within a **Pod** use networking to communicate via **loopback**.
> - Cluster networking provides communication between different Pods.
> - The **Service** resource lets you expose an application running in Pods to be reachable from **outside your cluster**.
> - You can also use **Services** to publish services only for consumption **inside your cluster**.

Four Types [[REF](https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types)]
- **ClusterIP**
  - Default Value
  - Makes the Service only reachable from within the cluster

- **NodePort**
  - Exposes the Service on each Node's IP at a static port
  - A `ClusterIP` Service, to which the `NodePort` Service routes, is automatically created

- **LoadBalancer**
  - Exposes the Service externally using a cloud provider's load balancer
  - `NodePort` and `ClusterIP` Services, to which the external load balancer routes, are automatically created

- **ExternalName**
  - Maps the Service to the contents of the externalName field (e.g. foo.bar.example.com), by returning a `CNAME` record with its value
  - No proxying of any kind is set up

### Cluster IP
```yaml
apiVersion: v1
kind: Service
metadata:
  name: sample-srv-cip
spec:
  # type: ClusterIP # NOT REQUIRED, AS DEFAULT
  selector:
    app: test-dep
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

- `kubectl exec -it sample-dep-XXXXXXXX -- sh`
  - `wget -qO - http://sample-srv-cip`
  - Search DNS
    ```
    # nslookup sample-srv-cip
    Server:         10.43.0.10
    Address:        10.43.0.10:53
    
    Name:   sample-srv-cip.default.svc.cluster.local
    Address: 10.43.110.139
    ```
    So `sample-srv-cip` has all alternative names:
    - `sample-srv-cip.default`
    - `sample-srv-cip.default.svc`
    - `sample-srv-cip.default.svc.cluster.local`
- Now copy deployment and service as `sample-dep2` and `sample-srv-cip2`, and apply them.
  - You can `ping` and `wget` each other's services from the pods. 

### Node Port
```yaml
apiVersion: v1
kind: Service
metadata:
  name: sample-srv-np
spec:
  type: NodePort
  selector:
    app: test-dep
  ports:
    - protocol: TCP
      port: 80         # REQUIRED
      targetPort: 80   # if not set, same as port
      nodePort: 31111  # DEFAULT RANGE [30000, 32767]. If not set, get randomly from the range  
```
- Access `http://NODE:31111`


## Volume
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-dep
spec:
  replicas: 1
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
          volumeMounts:
            - name: data-dir
              mountPath: /data
        - name: nginx
          image: nginx:1.18.0
          volumeMounts:
            - name: html-dir
              mountPath: /usr/share/nginx/html
              readOnly: true

      volumes:
        - name: data-dir
          hostPath:
            path: /opt/test-pod
            type: DirectoryOrCreate
        - name: html-dir
          hostPath:
            path: /opt/test-pod
            type: DirectoryOrCreate
```

## Storage

### PV
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: sample-pv
  labels:
    type: nfs
    target: sample
spec:
  accessModes:                             # REQUIRED
    - ReadWriteOnce
    - ReadWriteMany
  capacity:                                # REQUIRED
    storage: 1Gi                           # UNITS: Gi
  #volumeMode: Filesystem|Block            # DEFAULT 
  #persistentVolumeReclaimPolicy: Retain   # DEFAULT
  nfs:
    path: /opt/sharedNFS/
    server: 192.168.1.129
```
- `kubectl get pv`
```
NAME        CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
sample-pv   1Gi        RWO,RWX        Retain           Available                                   65s
```

### PVC
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: sample-pvc
spec:
  accessModes:          # REQUIRED
    - ReadWriteOnce
  resources:            # REQUIRED
    requests:
      storage: 1Gi
```
- `kubectl get pvc`
```
NAME         STATUS   VOLUME      CAPACITY   ACCESS MODES   STORAGECLASS   AGE
sample-pvc   Bound    sample-pv   1Gi        RWO,RWX                       16s
```

### Deployment
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
          volumeMounts:
            - name: html-dir
              mountPath: /html
              subPath: nginx
        - name: nginx
          image: nginx:1.18.0
          volumeMounts:
            - name: html-dir
              mountPath: /usr/share/nginx/html
              subPath: nginx

      volumes:
        - name: html-dir
          persistentVolumeClaim:
            claimName: sample-pvc
```
- It seems a PVC can only be used once in a Pod(?)