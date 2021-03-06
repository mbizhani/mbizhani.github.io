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

## Concurrency
- **Visibility Problem**: a variable is cached in CPU's cache and its change is not _visible_ to other thread(s) running by other cores
  - Results in _instruction reordering_!
  - Solutions
    - Use `volatile` modifier ([REF](http://tutorials.jenkov.com/java-concurrency/volatile.html))
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

## JDBC

Driver Class | JDBC URL | Hibernate Dialect | Maven Artifact
-------------|----------|-------------------|---------------
`org.h2.Driver` | `jdbc:h2:mem:test[;Mode=Oracle]` <br/> `jdbc:h2:~/test[;Mode=Oracle]` | `H2Dialect` | [![Maven Central](https://maven-badges.herokuapp.com/maven-central/com.h2database/h2/badge.svg)](https://maven-badges.herokuapp.com/maven-central/com.h2database/h2)
`org.hsqldb.jdbc.JDBCDriver` | `jdbc:hsqldb:mem:test[;sql.syntax_ora=true]` | `HSQLDialect` | [![Maven Central](https://maven-badges.herokuapp.com/maven-central/org.hsqldb/hsqldb/badge.svg)](https://maven-badges.herokuapp.com/maven-central/org.hsqldb/hsqldb)
`oracle.jdbc.driver.OracleDriver` | `jdbc:oracle:thin:@//SERVER:1521/SERVICE` <br/> `jdbc:oracle:thin:@SERVER:1521:SID` | `Oracle12cDialect` | [![Maven Central](https://maven-badges.herokuapp.com/maven-central/com.oracle.database.jdbc/ojdbc8/badge.svg)](https://maven-badges.herokuapp.com/maven-central/com.oracle.database.jdbc/ojdbc8) <br/> [[ojbc8](https://search.maven.org/artifact/com.oracle.database.jdbc/ojdbc8)]
`com.mysql.cj.jdbc.Driver` | `jdbc:mysql://SERVER:3306/DATABSE[?useUnicode=true&characterEncoding=UTF-8]` | `MySQL57Dialect` or `MySQL8Dialect` | [![Maven Central](https://maven-badges.herokuapp.com/maven-central/mysql/mysql-connector-java/badge.svg)](https://maven-badges.herokuapp.com/maven-central/mysql/mysql-connector-java) <br/> [[All](https://search.maven.org/artifact/mysql/mysql-connector-java)]

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
