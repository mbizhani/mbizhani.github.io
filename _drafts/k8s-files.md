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

Kind                  | API Version | Short Name
----------------------|-------------|-------------
Pod                   | v1          | po
ReplicationController | v1          | rc
ReplicaSet            | apps/v1     | rs
Deployment            | apps/v1     | deploy
Service               | v1          | svc
PersistentVolume      | v1          | pv
PersistentVolumeClaim | v1          | pvc
Namespace             | v1          | ns
ConfigMap             | v1          | cm
Secret                | v1          | -

- [[Short.Name.REF](https://blog.heptio.com/kubectl-resource-short-names-heptioprotip-c8eff9fb7202)]

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
- EXPOSE as SERVICE - `kubectl expose pod sample-pod --name=sample-srv --port=8080 --target-port=80`

**Note:** `kubectl run redis --image=redis --restart=Never --dry-run -o yamle > redis-pod.yml`


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
- **FORMAT** `SERVICE_NAME.NAMESPACE.svc.DOMAIN`
- Now copy deployment and service as `sample-dep2` and `sample-srv-cip2`, and apply them.
  - You can `ping` and `wget` other services from the pods.

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
[[REF](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)]
> - A PersistentVolume (PV) is a piece of storage in the cluster that has been provisioned by an administrator or dynamically provisioned using Storage Classes.
> - Independent lifecycle of any Pod that uses the PV
> - Two types of provisioning
>   - Static
>   - Dynamic
>     - No match for user's PVC request
>     - Based on `StorageClass`, the PVC request must refer a storage class
>     - Administrator must have created and configured that class for dynamic provisioning
>     - Claims that request the class `""` effectively disable dynamic provisioning for themselves.
> - A PVC to PV binding is a **one-to-one mapping**, using a ClaimRef which is a bi-directional binding between the PV and the PVC
> - Reserve a PV
>   - Specifying a PV inside PVC
>   - Semi-Reserve: using `labels` in PV and `selectors` in PVC (not in the REF) 
> - PVC
>   - Request for storage by a user and consume PV resources
>   - Setting `label` on PV can be ignored for matching, however the `selector` is considered during matching

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


## Configuration Data

### Config Map
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: sample-cm
data:
  K1: V1
  K2: V2
  other.txt: |
    This is a text content, stored in file via ConfigMap volume!

---

apiVersion: v1 
kind: Pod
metadata:
  name: sample-pod-cm
spec:
  containers:
    - name: busybox
      image: busybox:1.32
      tty: true
      envFrom:
        - configMapRef:
            name: sample-cm     # INCLUDE ALL KEYS
      env:
        - name: K11
          valueFrom:
            configMapKeyRef:
              name: sample-cm
              key: K1           # JUST GET THE KEY
  volumes:
    - name: cmdata
      configMap:
        name: sample-cm
```

- `kubectl exec -it sample-pod-cm -- env`
  ```
  PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
  HOSTNAME=sample-pod-cm
  TERM=xterm
  K1=V1
  K2=V2
  K11=V1
  KUBERNETES_PORT_443_TCP_ADDR=10.43.0.1
  KUBERNETES_SERVICE_HOST=10.43.0.1
  KUBERNETES_SERVICE_PORT=443
  KUBERNETES_SERVICE_PORT_HTTPS=443
  KUBERNETES_PORT=tcp://10.43.0.1:443
  KUBERNETES_PORT_443_TCP=tcp://10.43.0.1:443
  KUBERNETES_PORT_443_TCP_PROTO=tcp
  KUBERNETES_PORT_443_TCP_PORT=443
  HOME=/root
  ```

- `kubectl exec -it sample-pod-cm -- sh`
  ```
  # ls -l /opt/config-map
  total 0
  lrwxrwxrwx    1 root     root             9 Dec 14 09:12 K1 -> ..data/K1
  lrwxrwxrwx    1 root     root             9 Dec 14 09:12 K2 -> ..data/K2
  lrwxrwxrwx    1 root     root            16 Dec 14 09:12 other.txt -> ..data/other.txt

  # cat /opt/config-map/other.txt
  This is a text content, stored in file via ConfigMap volume!
  ```

### Secret
- Store and manage sensitive information
- Secret vs ConfigMap [[Ref1](https://medium.com/google-cloud/kubernetes-configmaps-and-secrets-68d061f7ab5b), [Ref2](https://stackoverflow.com/questions/36912372/kubernetes-secrets-vs-configmaps)]
> The big difference between Secrets and ConfigMaps are that Secrets are obfuscated with a Base64 encoding. 
> There may be more differences in the future, but it is good practice to use Secrets for confidential data 
> (like API keys) and ConfigMaps for non-confidential data (like port numbers).

- Secret can simply be created by CLI or file:
  - CLI (imperative)
    - `echo 'Sample File for Secret' > myfile.txt`
    - `kubectl create secret generic sample-sec --from-file=message.txt=myfile.txt --from-literal=K1=V1`
  - File
  ```yaml
  apiVersion: v1
  kind: Secret
  metadata:
    name: sample-sec
  type: Opaque  # DEFAULT
  data:
    K1: V1
    message.txt: |
      Sample File for Secret
  ```

```yaml
apiVersion: v1 
kind: Pod
metadata:
  name: sample-pod-sec
spec:
  containers:
    - name: busybox
      image: busybox:1.32
      tty: true
      env:
        - name: KEY1
          valueFrom:
            secretKeyRef:
              name: sample-sec
              key: K1
      volumeMounts:
        - name: secdata
          mountPath: "/etc/sec-data"
  volumes:
    - name: secdata
      secret:
        secretName: sample-sec
        items:
          - key: message.txt
            path: message.txt 
```

- `kubectl exec -it sample-pod-sec -- sh`
  ```text
  / # ls -l /etc/sec-data/
  total 0
  lrwxrwxrwx    1 root     root            18 Dec 24 10:08 message.txt -> ..data/message.txt

  / # env
  KEY1=V1
  KUBERNETES_PORT=tcp://10.43.0.1:443
  ...
  ```

{% comment %}
## PodPreset
Inject information like Secrets, volume mounts, and environment variables into Pods at creation time [[REF](https://kubernetes.io/docs/tasks/inject-data-application/podpreset/)].

**Note:** It must be enabled in the cluster!

```yaml
apiVersion: settings.k8s.io/v1alpha1
kind: PodPreset
metadata:
  name: sample-pp
spec:
  selector:
    matchLabels:
      app: busybox
  env:
    - name: K1
      value: V1
  volumeMounts:
    - name: words
      mountPath: /etc/dict/words
      readOnly: true      
  volumes:
    - name: words
      hostPath:
        path: /usr/share/dict/words
        type: File
```
and
```yaml
apiVersion: v1 
kind: Pod
metadata:
  name: sample-pod-sec
  labels:
    app: busybox
spec:
  containers:
    - name: busybox
      image: busybox:1.32
      tty: true
```
{% endcomment %}

## Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: sample-ns
```
- OR `kubectl create namespace smaple-ns`
- `kubectl config set-context $(kubectl config current-context) --namespace=sample-ns` - Update default namesapce for `kubectl`

### Resource Quota
- Provides constraints that limit **aggregate** resource consumption per namespace
- Pod resource must be specified on enabled compute resources quota like `cpu` and `memory`
- [[REF](https://kubernetes.io/docs/concepts/policy/resource-quotas/)]
 
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: sample-rq
  namespace: sample-ns
spec:
  hard:
    pods: "10"
    requests.cpu: "4"
    requests.memory: 5Gi
    limits.cpu: "4"
    limits.memory: 5Gi
```