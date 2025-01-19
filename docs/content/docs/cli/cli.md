---
date: '2025-01-19T20:14:37+03:00'
draft: true
title: 'CLI'
toc: true
---
## Demo
## Quickstart
```mermaid
stateDiagram
 direction LR
    User --> UI
    UI --> Api
    Api --> Kubernetes
    Kubernetes --> Tenant
    UI --> Tenant
```