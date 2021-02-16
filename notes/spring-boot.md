---
layout: page
title: Spring Boot
toc: true
---

**Note: Spring Boot - Version 2.4**

## Web
- Class
  - `@RestController`
  - `@RequestMapping("/PATH")`
- Method
  - `@GetMapping("/PATH")`, `@PostMapping("/PATH")`
  - Path Var
    ```java
    @GetMapping("/PATH/{VAR1}/{VAR2}")
    public ResponseEntity<?> get(@PathVariable("VAR1") String v1, @PathVariable("VAR2") String v2) {
    }
    ```


## Concurrency

### Scheduling
- `@EnableScheduling`
- `private final TaskScheduler taskScheduler` - Inject Scheduler
- `@Scheduled(initialDelayString="", fixedDelayString="")` - On Method(s)


## Custom Properties
- Add dependency [![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.springframework.boot/spring-boot-configuration-processor/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.springframework.boot/spring-boot-configuration-processor)
- The class
  ```java
  @Component
  @ConfigurationProperties(prefix = "my.prefix")
  public class TheProperties {
  }
  ```


## Configuration
- `pom.xml`

```xml
<properties>
  <java.version>11</java.version>
</properties>
```

- `application.yml` - Simple Sample

```yaml
server:
  shutdown: graceful
  
spring:
  profiles:
    active: prod
  lifecycle:
    timeout-per-shutdown-phase: 20s
  
---
  
spring:
  config:
    activate:
      on-profile: dev
  
logging:
  level:
    org.x.y.z: debug
```