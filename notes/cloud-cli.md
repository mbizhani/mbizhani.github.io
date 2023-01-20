---
layout: page
title: Cloud CLI
---

## Kubectl
- `kubectl get pod -l LABEL_KEY=LABEL_VAL -o jsonpath="{.items[0].metadata.name}"`

  - ```shell
    kubectl get pod \
      -n ${NAMESPACE} \
      -l app.kubernetes.io/instance=${CHART} \
      -o jsonpath="{.items[0].metadata.name}"
    ```

- `kubectl get pod -l LABEL_KEY=LABEL_VAL -o jsonpath="{.items[0].status.phase}"`

  - ```shell
    function waitForChart() {
      CHART=$1
      while [ "$(kubectl get pod -n ${NAMESPACE} -l app.kubernetes.io/instance="${CHART}" | wc -l )" == "0" ] ||
          [ "$(kubectl get pod -n ${NAMESPACE} -l app.kubernetes.io/instance="${CHART}" -o jsonpath="{.items[0].status.phase}")" != "Running" ];
      do
        echo "Waiting for ${CHART} ..."
        sleep 2
      done
    }
    ```

- ```shell
  kubectl get events \
    -n ${NAMESPACE} \
    --sort-by=.metadata.creationTimestamp \
    --watch
  ```


## Docker
- `docker ps -q -f ancestor=IMAGE:TAG` - find container(s) id (`-q`) by `IMAGE:TAG`
- {% raw %}`docker image inspect -f '{{println "VOL =" .Config.Volumes}}{{println "ENV =" .Config.Env}}{{println "PORTS =" .ContainerConfig.ExposedPorts}}' IMAGE:TAG`{% endraw %}
