---
layout: page
title: Misc
toc: true
---

## Cloud Fast Commands

### Docker
- `docker ps -q -f ancestor=IMAGE:TAG` - find container(s) id (`-q`) by `IMAGE:TAG`
- {% raw %}`docker image inspect -f '{{println "VOL =" .Config.Volumes}}{{println "ENV =" .Config.Env}}{{println "PORTS =" .ContainerConfig.ExposedPorts}}' IMAGE:TAG`{% endraw %} - image info

### Kubectl
- `kubectl get pod -l LABEL_KEY=LABEL_VAL -o jsonpath="{.items[0].status.phase}"`
- `kubectl get pod -l LABEL_KEY=LABEL_VAL -o jsonpath="{.items[0].metadata.name}"`