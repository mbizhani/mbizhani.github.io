---
layout: page
title: Projects
permalink: /projects/
---
---
## Demeter [<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/Demeter)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.devocative/demeter-module/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.devocative/demeter-module)

This project is the basis for my other projects. It is a full-stack application and a container for any DModules. 
A DModule, which is a “business-level component” and is deployed besides the Demeter, has its own three tiers and just focuses on its business-core issues.
The common services for all DModules are provided by Demeter.

---

## Metis [<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/Metis)
It is a DModule to create simple search and report over any JDBC-related data stores. 
The queries are based on the data store dialect, but now it is used for SQL and EQL, which is semi-entity-based SQL where instead of table and column names, their equivalent entity and property names are used. 
It also provides OData REST for the searches out-of-the-box.

---

## Ares [<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/Ares)
It is a DModule to help operation team and make it possible for other teams to access operation severs in a web-based environment with controlled and limited commands.

For operation team:
- A center for all the information of servers, services, and system users
- Web-based terminal console for Shell and Database
- User-defined commands to handle daily jobs with ease and safety

For other teams:
- If they want special operation services such as schema backup, copy or VM-related issues, the necessary commands can be defined with access grant to do their jobs whenever they want

---

## Wickomp [<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/Wickomp)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.devocative/wickomp/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.devocative/wickomp)

This project is designated for a collection of Wicket components, widely used in Demeter and the DModules for web-tier. 
For most of components a JQuery plugin is developed. 
For WebSocket and push-data mechanism, the integration classes are also developed. 
The list and class-diagram of the components are in the project homepage.

---

## Devolcano [<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/Devolcano)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.devocative/demeter-maven-plugin/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.devocative/demeter-maven-plugin)

“Effective development needs efficient tools” is the main idea of this project. 
It tries to handle ‘just-CRUD-code generation’, ‘generated-code merge’, ‘hibernate-schema generation’, and other tools via Maven plugins.