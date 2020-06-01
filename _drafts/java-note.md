---
layout: page
title: Java
toc: true
---

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
  - `-U`
  - `-ntp`

- Some plugins
  -  