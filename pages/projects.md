---
layout: page
title: Projects
---

## Demeter
[<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/Demeter)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.devocative/demeter-module/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.devocative/demeter-module)

This project is the basis for my other projects. It is a _modular_ and _full-stack_ application and a **container** for any DModules. 
A `DModule`, which is a **“business-level component”** and is deployed besides the Demeter, has its own three tiers and just focuses on its business-core issues.
- The _common services_ for all DModules are provided by Demeter.
- It is an integrated stack of `Hibernate` + `Spring` + `Wicket`.
- `Demeter` & all `DMdules` are modular Maven-based projects with `JAR` packaging.
- By using the [DeployArchetype](#deployarchetype), a `WAR` archive is created composed of Demeter and other DModule(s) artifacts.


## _DModules_

### Metis
[<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/Metis)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.devocative/metis-module/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.devocative/metis-module)

It is a DModule to create simple search and report over any JDBC-related data stores. 
The queries are based on the data store dialect, but now it is used for SQL and EQL, which is semi-entity-based SQL where instead of table and column names, their equivalent entity and property names are used. 
It also provides OData REST for the searches out-of-the-box.

### Ares
[<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/Ares)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.devocative/ares-module/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.devocative/ares-module)

It is a DModule to help operation team and make it possible for other teams to access operation severs in a web-based environment with controlled and limited commands.

For operation team:
- A center for all the information of servers, services, and system users
- Web-based terminal console for Shell and Database
- User-defined commands to handle daily jobs with ease and safety

For other teams:
- If they want special operation services such as schema backup, copy or VM-related issues, the necessary commands can be defined with access grant to do their jobs whenever they want


## _Components & Common Classes_

### Wickomp
[<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/Wickomp)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.devocative/wickomp/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.devocative/wickomp)

This project is designated for a collection of Wicket components, widely used in Demeter and the DModules for web-tier. 
For most of components a JQuery plugin is developed. 
For WebSocket and push-data mechanism, the integration classes are also developed. 
The list and class-diagram of the components are in the project homepage.

### Adroit
[<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/Adroit)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.devocative/adroit/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.devocative/adroit)
The Adroit project is a collection of common and utility classes, specially used in `Demeter` project.


## _Tools_

### Devolcano
[<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/Devolcano)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.devocative/demeter-maven-plugin/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.devocative/demeter-maven-plugin)

“Effective development needs efficient tools” is the main idea of this project. 
It tries to handle ‘just-CRUD-code generation’, ‘generated-code merge’, ‘hibernate-schema generation’, and other tools via Maven plugins.

### DModuleArchetype
[<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/DModuleArchetype)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.devocative/dmodule-archetype/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.devocative/dmodule-archetype)

A `Maven Archetype` to create an initial project for a `DModule`.

### DeployArchetype
[<svg class="svg-icon"><use xlink:href="/assets/minima-social-icons.svg#github"></use></svg>](https://github.com/mbizhani/DeployArchetype)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.devocative/deploy-archetype/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.devocative/deploy-archetype)

A `Maven Archetype` to create a project for deploying `Demeter` & other `DModules` via a `WAR`.