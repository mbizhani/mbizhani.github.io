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