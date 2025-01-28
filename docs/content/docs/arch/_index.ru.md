---
title: Архитектура
weight: 6
prev: cli
next: faq
sidebar:
  open: true
---

## Architecture Overview

```mermaid
stateDiagram
 direction LR
    User --> LearOps
    LearOps --> Api
    Api --> Kubernetes
    Kubernetes --> Tenant
    LearOps --> Ingress
    Ingress --> Tenant
```

## Authentication  

## Multi-tenancy