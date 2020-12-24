---
layout: page
title: Helm
toc: true
---

## Command

- `helm create NAME`
  - Create folder `NAME` with initial templates
- `helm lint ./NAME/`
  - runs a series of tests to verify that the chart is well-formed
- `helm template INTANCE_NAME ./NAME`
  - Render chart templates locally and display the output.
  - `--output-dir OUT`
  - EXAMPLES
    - `helm template test ./NAME --output-dir OUT`
- `helm install INSTANCE_NAME ./NAME`
  - `-f VALUE_FILE`
- `helm uninstall INSTANCE_NAME`

## Template

- `{% raw %}{{- /* ... */}}{% endraw %}` - Comment
