---
layout: slide
caption: Demeter Project
description: An introduction to Demeter project
theme: night
---

<section data-markdown data-separator="===" data-separator-vertical="---">

## Demeter

An introduction to [Demeter Project](https://github.com/mbizhani/Demeter)

by

**Mehdi Bizhani**

2018/06/06

===

## Introduction

Suppose you want to develop lots of applications, such as:
- A report application
- A web-based application for operation
- ...

===

## Common Services

Whatever your application's domain is!

---

### CS - Security Management
- `User` Management & Authentication
- `Role` & `Privilege` Management & Authorization

---

### CS - Task Management
- Background and scheduled jobs
- Out-of-the-box mechanism to push data back to web via `WebSocket`
- Monitor & control running jobs

---

### CS - File Store Management
- Single point for uploaded file
- Single point for downloading file
- Selectable storage (i.e. disk, database, ...)
- Auto-remove expired files
- Monitor & control uploaded files
- Authorization

---

### CS - Page Management
- Render main site menubar
- Personalized menubar
- Page layout management
- Internationalization (I18N)
- Authorization

---

### CS - Cache Management
- Single & simple API to cache any bucket of objects
- Monitor & control buckets
</section>

<section>
<h4>Demeter Architecture</h4>

<img style="width:85%;height:85%;" src="https://github.com/mbizhani/Demeter/raw/master/doc/img/Demeter_Logical_Components_Relations.png"/>
</section>