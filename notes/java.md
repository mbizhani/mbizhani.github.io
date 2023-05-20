---
layout: page
title: Java
toc: true
---

## API

### String
- `str.repeate(count): String` (J11)
- `str.isBlank(): Boolean` (J11)
- `str.lines(): Stream<String>` (J11)

### I/O
- **`Files`** (J7)
  - `Files.readAllBytes(Path): byte[]`
  - `Files.readAllLines(Path, Charset): List<String>`
  - `try(Stream<String> lines = Files.lines(Path)) { ... } ` (J8)
  - `Files.createDirectories(Path)`
  - `Files.copy(src:Path, dst:Path, StandardCopyOption.REPLACE_EXISTING)`
  - `Files.move(src:Path, dst:Path, StandardCopyOption.REPLACE_EXISTING)`
  - `Files.newBufferedReader(Path, Charset): BufferedReader`
  - `Files.newBufferedWriter(Path, Charset): BufferedWriter`
  - `Files.newInputStream(Path): InputStream`
  - `Files.newOutputStream(Path [, CREATE, APPEND]): OutputStream`
  - `Files.write(Path, byte[])`
  - `Files.list(Path): Stream<Path>` (J8)
  - `Files.walk(path).filter(path-> ).forEach(path-> )` (J8)
  - `Files.setPosixFilePermissions(Path, PosixFilePermissions.fromString("rw-------"))`
{% comment %}
- **`Path`** (J7)
  - `path.resolve(path2)` - returns path2 based on path
  - `path.relativise(path2)` - returns path2 address relative to path
  - `path.normalize()` - remove `./`, `/../` and other redundancies
  - `for (Path p : path) { ... }` - iterate over components
{% endcomment %}

### RegEx
- `(...)` group with index
- `(?<GRPNAME>...)` group with `GRPNAME` identifier (no space!)
- `var alert = "12:23".replaceAll("(?<H>[0-2]\\d):(?<M>[0-5]\\d)", "it happened at hour=${H} & minute=${M}")`

### Java 8 Time

| Java 8 Class                         | Function                                             |
|--------------------------------------|------------------------------------------------------|
| `java.time.Instant`                  | Moment in UTC                                        |
| `java.time.ZonedDate`                | Moment with time zone                                |
| `java.time.OffsetDateTime`           | Moment with offset-from-UTC                          |
| `java.time.LocalDateTime`            | Date & Time of day (no offset, no zone)              |
| `java.time.LocalDate`                | Date only (no offset, no zone)                       |
| `java.time.LocalTime`                | Time of day only (no offset, no zone)                |
| `java.time.format.DateTimeFormatter` | Formatter for printing and parsing date-time objects |

Following graph shows `java.util.Date`, and other `java.time.*` classes conversions.

<div style="text-align: center; padding-bottom: 10px;">
<img style="border: 1px solid #e8e8e8" alt="Java8DateTime" src="/assets/images/java/java-date-time.png"/>
</div>

## Concurrency

- **Visibility Problem** ([Jenkov](http://tutorials.jenkov.com/java-concurrency/volatile.html) & [Baeldung](https://www.baeldung.com/java-volatile))
  - A variable is cached in CPU's cache and its change is not _visible_ to other thread(s) running by other cores.
  - With non-volatile variables there are no guarantees about when the JVM reads data from main memory into CPU caches, or writes data from CPU caches to main memory.
  - Solutions
    - Use `volatile` modifier
      - mark a variable as "being stored in main memory", not from the CPU cache
      - every write will be written to main memory
      - guarantees _visibility_ of changes to variables across threads without providing mutual exclusion
    - Use `Atomic*` type for primitive types (they have `volatile` variable inside!)
    - Variables in `synchronized` blocks or methods

- **Race Condition**: updating shared variable by concurrent threads. Solutions
  - _Confinement_: Don't share
  - _Immutability_: Immutable data structures
  - _Locking_: Block other tasks to alter shared variables

A demonstration for `volatile` [[REF](https://stackoverflow.com/questions/2787094/how-to-demonstrate-java-multithreading-visibility-problems)]
```java
static boolean simple = true;
static volatile boolean vol = true;

public static void main(String[] args) throws Exception {
  var volTh = new Thread(() -> {
    while (vol) {}
  });

  var simpleTh = new Thread(() -> {
    while (simple) {}
  });

  volTh.start();
  simpleTh.start();

  Thread.sleep(1000);

  vol = false;
  simple = false;

  volTh.join();
  System.out.println("'vol' is false");    // This line is printed

  simpleTh.join();
  System.out.println("'simple' is false"); // This line may not be printed!
}
```

### Thread-safe Singleton

- [[REF](https://www.baeldung.com/spring-boot-singleton-vs-beans)]
- Lazy initialization
- Using `synchronized` block to prevent race condition
- Using _double-checked locking_ to prevent recreation by different threads

```java
public final class ThreadSafeSingleInstance {

    private static volatile ThreadSafeSingleInstance INSTANCE = null;

    private ThreadSafeSingleInstance() {}

    public static ThreadSafeSingleInstance getInstance() {
        if (INSTANCE == null) {
            synchronized(ThreadSafeSingleInstance.class) {
                if (INSTANCE == null) {
	                INSTANCE = new ThreadSafeSingleInstance();
                }
            }
        }
        return instance;
    }
}
```

## JDBC

| Driver Class                      | JDBC URL                                                                            | Hibernate Dialect                   | Maven Artifact                                                                                                                                                                                                                                                                      |
|-----------------------------------|-------------------------------------------------------------------------------------|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `org.h2.Driver`                   | `jdbc:h2:mem:test[;Mode=Oracle]` <br/> `jdbc:h2:~/test[;Mode=Oracle]`               | `H2Dialect`                         | [![Maven Central](https://maven-badges.herokuapp.com/maven-central/com.h2database/h2/badge.svg)](https://maven-badges.herokuapp.com/maven-central/com.h2database/h2)                                                                                                                |
| `org.hsqldb.jdbc.JDBCDriver`      | `jdbc:hsqldb:mem:test[;sql.syntax_ora=true]`                                        | `HSQLDialect`                       | [![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.hsqldb/hsqldb/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.hsqldb/hsqldb)                                                                                                                |
| `oracle.jdbc.driver.OracleDriver` | `jdbc:oracle:thin:@//SERVER:1521/SERVICE` <br/> `jdbc:oracle:thin:@SERVER:1521:SID` | `Oracle12cDialect`                  | [![Maven Central](https://maven-badges.herokuapp.com/maven-central/com.oracle.database.jdbc/ojdbc8/badge.svg)](https://maven-badges.herokuapp.com/maven-central/com.oracle.database.jdbc/ojdbc8) <br/> [[ojbc8](https://search.maven.org/artifact/com.oracle.database.jdbc/ojdbc8)] |
| `com.mysql.cj.jdbc.Driver`        | `jdbc:mysql://SERVER:3306/DATABSE[?useUnicode=true&characterEncoding=UTF-8]`        | `MySQL57Dialect` or `MySQL8Dialect` | [![Maven Central](https://maven-badges.herokuapp.com/maven-central/mysql/mysql-connector-java/badge.svg)](https://maven-badges.herokuapp.com/maven-central/mysql/mysql-connector-java) <br/> [[All](https://search.maven.org/artifact/mysql/mysql-connector-java)]                  |

Note: `org.hibernate.dialect` is Hibernate package for dialects.

## Maven
- Some options
  - `-P PROFILE1[,PROFILE2,...]`
  - `-U` - Forces a check for missing releases and updated snapshots on remote repositories
  - `-ntp` - Do not display transfer progress when downloading or uploading
- Use a private registry, create/modify `$HOME/.m2/settings.xml`:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <settings xmlns="http://maven.apache.org/SETTINGS/1.1.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.1.0 http://maven.apache.org/xsd/settings-1.1.0.xsd">
  
    <mirrors>
      <mirror>
        <id>central</id>
        <name>central</name>
        <url>http://NEXUS/repository/maven-public/</url>
        <mirrorOf>*</mirrorOf>
      </mirror>
    </mirrors>
  
  </settings>
  ```
- Java version (e.g. `1.8`, `11`), and other properties
  ```xml
  <properties>
      <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
      <maven.compiler.source>11</maven.compiler.source>
      <maven.compiler.target>11</maven.compiler.target>
  </properties>
  ```