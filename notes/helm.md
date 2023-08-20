---
layout: page
title: Helm
toc: true
---

## Command

### General
- `helm create NAME`
  - Create folder `NAME` with initial templates
- `helm lint ./CHART_DIR/`
  - Runs a series of tests to verify that the chart is well-formed
- `[CHART]` can be
  - `./DIR` - local chart
  - `CHART --repo URL` - remote chart from specific repo
- `helm template [NAME] [CHART]`
  - Render chart templates locally and display the output.
  - `--output-dir OUT`
  - `-f VALUE_FILE.yaml`
  - Examples
    - `helm template test ./CHART_DIR --output-dir OUT`
- `helm install [NAME] [CHART]`
  - `-f VALUE_FILE.yaml`
- `helm list`
  - List instances
  - `-f STRING` - Filter instances by `NAME` matching `STRING` using regex
  - `-A` - Across all namespaces
  - `-a` - Show all releases without any filter
  - `-d` - Sort by date
  - `-r` - Reverse sort
- `helm uninstall RELEASE_NAME`

### Repo
- `helm repo list`
- `helm repo add NAME URL [FLAGS]`
  - `helm repo add owkin https://owkin.github.io/charts`
  - `helm repo add bitnami https://charts.bitnami.com/bitnami`
  - `helm repo add rancher-stable https://releases.rancher.com/server-charts/stable`
- `helm search repo KEYWORD [--devel] [-l] [-- version VER]`
  - `-l` - show the long listing with all versions
- `helm repo update` - update repo(s) metadata (i.e `apt update`)
- `helm pull REPO/NAME [--untar] [--version=VER]`
  - `helm pull rancher-stable/rancher --untar --version=2.5.5`
- `helm pull CHART --repo URL [--untar] [--version=VER]`
  - `helm pull rook-ceph --repo https://charts.rook.io/release --version v1.12.2`


## Template

- `{% raw %}{{- /* ... */}}{% endraw %}` - Multiline comment
- `{% raw %}{{ printf "%s/%s-tls-cert.pem" .Values.VAR1 .Values.VAR2 | quote }}{% endraw %}` - Using `printf`
- `{% raw %}{{- .Values.VAR | b64enc | quote }}{% endraw %}` - Encode Base64 and Quote it
- `{% raw %}{{- .Values.VAR | default "\"\"" }}{% endraw %}` - If no value for `.Value.VAR`, use the default value
- Conditions - `{% raw %}{{- if CONDITION }}{% endraw %}`, and samples are
  - `eq .Values.VAR "STR"`
  - `empty .Values.VAR`
  - `and (BOOL_EXPR1) (BOOL_EXPR2)`
  - `not BOOL_EXPR`


## Examples

### Create List, Append, and Join

```text
{% raw %}{{- $cmps := list }}
{{- range .orderers }}
    {{- $cmps = append $cmps (printf "{\"type\":\"orderer\",\"name\":\"%s\",\"fqdn\":\"%s\"}" .name .fqdn) }}
{{- end }}
export CMPS='{{ printf "[%s]" (join "," $cmps) }}'{% endraw %}
```

### Upgrade Script
```shell
#!/bin/bash

RELEASE=$1
CHART=$2
VERSION=$3

NS=""
REPO=""

if [[ "${RELEASE}" && "${CHART}" && "${VERSION}" ]]; then
  helm upgrade -n ${NS} ${RELEASE} ${CHART} \
    --atomic \
    --reuse-values \
    --version ${VERSION} \
    --repo ${REPO} \
    --set-string podAnnotations."timestamp"=$(date +'%Y-%m-%d_%H-%M-%S')
else
  echo "$0 <RELEASE> <CHART> <VERSION>"
  echo "------ RELEASE & CHARTS ------"
  helm -n ${NS} list
fi
```


