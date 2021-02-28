---
layout: page
title: Helm
toc: true
---

## Command

- `helm create NAME`
  - Create folder `NAME` with initial templates
- `helm lint ./NAME/`
  - Runs a series of tests to verify that the chart is well-formed
- `helm template INTANCE_NAME ./NAME`
  - Render chart templates locally and display the output.
  - `--output-dir OUT`
  - `-f VALUE_FILE.yaml`
  - Examples
    - `helm template test ./NAME --output-dir OUT`
- `helm install INSTANCE_NAME ./NAME`
  - `-f VALUE_FILE.yaml`
- `helm list`
  - List instances
  - `-f STRING` - Filter instances by `NAME` matching `STRING` using regex
  - `-A` - Across all namespaces
  - `-a` - Show all releases without any filter
  - `-d` - Sort by date
  - `-r` - Reverse sort
- `helm uninstall INSTANCE_NAME`


## Repo
- `helm repo list`
- `helm repo add NAME URL [FLAGS]`
  - `helm repo add owkin https://owkin.github.io/charts`
  - `helm repo add bitnami https://charts.bitnami.com/bitnami`
  - `helm repo add rancher-stable https://releases.rancher.com/server-charts/stable`
- `helm pull REPO/NAME [--untar] [--version=VER]`
  - `helm pull rancher-stable/rancher --untar --version=2.5.5`
- `helm repo update`


## Template

- `{% raw %}{{- /* ... */}}{% endraw %}` - Comment
- `{% raw %}{{- .Values.VAR | b64enc | quote }}{% endraw %}` - Encode Base64 and Quote it
- `{% raw %}{{ printf "%s/%s-tls-cert.pem" .Values.VAR1 .Values.VAR2 | quote }}{% endraw %}` - Using `printf`
