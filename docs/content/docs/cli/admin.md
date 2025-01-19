---
title: 'Admin Guide'
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