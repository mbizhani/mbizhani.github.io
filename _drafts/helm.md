---
layout: page
title: Helm
toc: true
---

- `helm create NAME`
  - create folder `NAME`
- inside folder `NAME`
  - `helm lint` - runs a series of tests to verify that the chart is well-formed
- `helm template NAME CHART`
  - `--output-dir OUT`
  
  - EXAMPLES
    - `helm template NAME . --output-dir OUT` (inside `NAME`)