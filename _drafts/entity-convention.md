---
layout: post
title: "A Convention for Entities"
categories: article tech
excerpt: A convention for entities and related notes in spring boot
---

## Introduction

It is very common and useful to define conventions in development for more readability and standardizing the way of coding.
In this article I tried to define a convention for entities specially in JPA with some Spring Boot hints.


## Database Prefix Convention

The reasons for these conventions are
- I have worked with multiple databases tools and they are not as smart as programming tools.
- Programming languages has more various data types than SQL
- This convention eases SQL query development
- It prevents keyword clash
- Since SQL is case insensitive, the underscore character is used instead of camel hop syntax.

### Database Object

Normal Table | `tb_` or `t_`
Audit Table <sup>*</sup> | `ad_` or `a_`
View         | `vw_` or `v_`
Sequence     | `sq_`
Function     | `fn_`
Procedure    | `pr_`

(*) The changelog of records in some of `Normal Tables` are persisted in `Audit Tables`.
[Hibernate Envers](https://hibernate.org/orm/envers/) is one of the framework.

### Column Name

Using following prefixes, the type or application of a column can be emphasized.

Column Type/Application | Prefix | Note
------------------------|--------|-------------------------------
Number                  | `n_`   | 
Date/Timestamp          | `d_`   | 
Character/String        | `c_`   | 
Boolean                 | `b_`   | it is usually **small integer** in DB
Enumeration             | `e_`   | it is usually **integer** (or string) in DB
Foreign Key             | `f_`   | it is usually **integer** (or string) in DB

### Constraint

Defining clear constraint name is crucial, specially when you want to find the constraint name
in your code and return a proper error message/code to the client.

Primary Key | `pk_TABLE`
Foreign Key | `fk_`
Unique      | `uc_`
Check       | `cc_`

## JPA Side

In this section, some conventions for defining classes in JPA are described.

### Enumeration

By default, an enumeration literal is stored in its associated column by its **name** or **order** in the class.
Using one of the default mechanisms prevents refactoring and modifying the enumeration class easily and it is very error prone. 
The best way is assigning specific value (integer or string) to each of literals. 
In this way you can even assign business-defined values to the literal. 

The following sample shows the way.

```java
@Getter
@RequiredArgsConstructor
public enum EUserStatus {
  Locked(-1),
  Disabled(0),
  Enabled(1);

  private final int id;
}
```
Suppose later, `Expired` literal must be added to the enum. You can easily add `Expired(-2)` in any order. 

Now you need a converter class. I prefer to define all converters in one class.

```java
public class EnumConverter {

  @Converter(autoApply = true)
  public static class UserStatusConverter implements AttributeConverter<EUserStatus, Integer> {

    @Override
    public Integer convertToDatabaseColumn(EUserStatus entry) {
      return entry != null ? entry.getId() : null;
    }

    @Override
    public EUserStatus convertToEntityAttribute(Integer id) {
      return Stream
        .of(EUserStatus.values())
        .filter(v -> v.getId().equals(id))
        .findFirst()
        .orElseThrow(() -> new RuntimeException("Invalid EUserStatus Id: " + id));
    }
  } 

  // ... other converters
}
```

### Unique Constraint

Setting unique constraint name is necessary, specially when you want to handle the specific violation to produce a validation error message.
As you know for single column constraint you can user `@Column(unique = true)`. However, due to previous reason, it is not recommended. 
The best way is using `@UniqueConstraint` in `@Table` annotation. Lets have an example:

```java
@Entity
@Table(name = "t_user", uniqueConstraints = {
	@UniqueConstraint(name = User.UC_USERNAME, columnNames = {"c_username", "f_department"}),
	@UniqueConstraint(name = User.UC_NATIONAL_CODE, columnNames = {"c_national_code"})
})
public class User {
	public static final String UQ_USERNAME = "uc_user_username";
	public static final String UC_NATIONAL_CODE = "uc_user_national_code";

    // ...
}
```  
