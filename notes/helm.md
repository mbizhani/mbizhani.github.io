---
layout: page
title: Helm
toc: true
---

## Command

- `helm create NAME`
  - create folder `NAME` with initial templates
- `helm lint ./NAME/`
  - runs a series of tests to verify that the chart is well-formed
- `helm template INTANCE_NAME ./NAME`
  - render chart templates locally and display the output.
  - `--output-dir OUT`
  - examples
    - `helm template test ./NAME --output-dir OUT`
- `helm install INSTANCE_NAME ./NAME`
  - `-f VALUE_FILE`
- `helm list`
  - list instances
  - `-f STRING` - filter instances by `NAME` matching `STRING` using regex
  - `-a` - show all
  - `-d` - sort by date
  - `-r` - reverse sort
- `helm uninstall INSTANCE_NAME`

## Template

- `{% raw %}{{- /* ... */}}{% endraw %}` - Comment
- `{% raw %}{{- .Values.VAR | b64enc | quote }}{% endraw %}` - Encode Base64 and Quote it
- `{% raw %}{{ printf "%s/%s-tls-cert.pem" .Values.VAR1 .Values.VAR2 | quote }}{% endraw %}` - Using `printf`
