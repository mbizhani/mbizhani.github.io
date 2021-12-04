---
layout: page
title: Spring Boot
toc: true
---

**Note: Spring Boot - Version 2.4**

## General
- From Spring 4.3 onward, a class with a single constructor does not require the annotation for autowired parameters.

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
    // ...
  }
  ```
- In case of a simple POJO to be used as configuration (e.g. third-party code), define a method like the following one
  ```java
  @SpringBootApplication
  public class MyApp {
    // ...
  
    @Bean
    @ConfigurationProperties(prefix = "my.prefix")
    public TheProperties createProperties() {
      return new TheProperties();
    }
  }
  ```

**Note:** use `@Component` over each class or apply `@ConfigurationPropertiesScan` to scan base package. 

## Configuration
- [Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- Enable autoconfiguration report, **_conditions evaluation report_** consists of multiple sections 
  such as **_positive matches_**, **_negative matches_**, **_exclusions_**, **_unconditional classes_**, etc via
  - `java -jar APP.jar --debug`
  - `java -Ddebug=true -jar APP.jar`
  - `debug=true` - in `application.properties`
  - `export DEBUG=true` - as OS env
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

### Actuator
- Add dependency [![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.springframework.boot/spring-boot-starter-actuator/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.springframework.boot/spring-boot-starter-actuator)
- Define policy on `/actuator/**` if security is enabled
- `management.endpoints.web.exposure.include=*` - show all endpoints
- Instead of `*`, a comma-separated list can be used such as
  - `env` - environment variables
  - `configprops` - config properties
  - `metrics` - some components specific metrics such as `jvm`, `hikaricp`, `tomcat`, ...
  - `mappings` - list all request endpoints mappings to associated controller classes
  - `heapdump`
  - `threaddump`
- `management.endpoint.health.show-details=never|when_authorized|always` - show detailed health info such as `db`, `diskSpace`, ...

## Security
- Disable default security password in case of applying other options such as JWT [[REF](https://stackoverflow.com/a/51948296)]
  ```java
  @SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
  public class MyApp {
    // ...
  }
  ```
