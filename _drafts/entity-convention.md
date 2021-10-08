---
layout: post
title: "A Convention for Entities"
categories: article tech
excerpt: Conventions and hints for JPA entities, both RDBMS and Java side
---

## Introduction

It is very common and useful to define **conventions** in development for more readability and standardizing the way of coding.
In this article I tried to define conventions for entities specially in JPA with some Spring Data hints.

The reasons for these conventions are
- I have worked with multiple database tools, and they are not as smart as programming IDEs.
- Programming languages has more various data types than SQL.
- These conventions lead to easier SQL query development.
- It prevents keyword clash.


## Database Name Convention

Since SQL is case-insensitive, the first convention is using the underscore character instead of camel hop syntax.
For example, `nationalCode` is readable in case-sensitive languages. However, defining a column as `national_code` has
the equivalent readability in SQL.

Following sections introduces most conventions as prefixed names for database identifiers. 

### Database Objects Prefixes

Object                   | Prefix
-------------------------|--------
Normal Table             | `tb_` or `t_`
Audit Table <sup>*</sup> | `ad_` or `a_`
View                     | `vw_` or `v_`
Sequence                 | `sq_`
Function                 | `fn_`
Procedure                | `pr_`

(*) The changelog of records in some of `Normal Tables` are persisted in `Audit Tables`.
[Hibernate Envers](https://hibernate.org/orm/envers/) is one of the framework.

### Column Name Prefixes

Using following prefixes, the type or application of a column can be emphasized.

Column Type/Application | Prefix | Note
------------------------|--------|-------------------------------
Number                  | `n_`   | 
Date/Timestamp          | `d_`   | 
Character/String        | `c_`   | 
Boolean                 | `b_`   | it is usually **small integer** in DB
Enumeration             | `e_`   | it is usually **integer** (or string) in DB
Foreign Key             | `f_`   | it is usually **integer** (or string) in DB

### Constraints

Defining clear constraint name is crucial, specially when you want to find the constraint name
in your code and return a proper error message/code to the client.

Constraint Type | Prefix
----------------|--------
Primary Key     | `pk_` (`pk_TABLE_NAME` is recommended)
Foreign Key     | `fk_`
Unique          | `uc_`
Check           | `cc_`

## JPA Side

In this section, some conventions for defining classes in JPA are described.

### Enumeration

By default, an enumeration literal is stored in its associated column by its **name** or **order** in the class.
Using one of the default rules, prevents refactoring and modifying the enumeration class easily, 
and the predefined mapping mechanism is very error prone. 
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

Setting unique constraint name is necessary, specially when you want to handle it to generate an error message.
As you know for single column constraint you can use `@Column(unique = true)`. However, due to previous reason, it is not recommended. 
The best way is using `@UniqueConstraint` in `@Table` annotation. Let's have an example:

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

**Note**: When you define a unique constraint, RDBMSs create an associated unique index behind the scene, and if your unique
constraint includes more than one column, the order of columns defined in `columnNames` of `@UniqueConstraint` has impact on the 
performance of queries, and even on insertion and update of data.

There are two rules for this order
1. The left most columns must be the ones that has more involvement in where clauses.
2. The order of columns from left to right should be based on the column cardinality decrease.

For more information, refer to these references,
[The right column order in multi-column indexes](https://use-the-index-luke.com/sql/where-clause/the-equals-operator/concatenated-keys),
and 
[Cardinality: Not Just For The Birds](https://bertwagner.com/posts/cardinality-isnt-just-for-the-birds/).

### Foreign Key (Referential Integrity Constraint)

When a referential integrity constraint is violated, most of the time, the problem is rooted in the way of application development and code.
However, you need to log the exception, and to find the cause of error, so you need the name of the constraint. If you do not
set a specific name for your foreign key, an unreadable random name is generated, and then you must query the database metadata to find
the column and table. So let's provide proper names for the foreign keys in your associations.

Here is a `@ManyToOne` example:

```java
@Entity
@Table(name = "t_food")
public class Food {
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "f_restaurant", nullable = false, foreignKey = @ForeignKey(name = "fk_food2restaurant"))
	private Restaurant restaurant;
	
	// ...
}
```

Here is an example for `@ManyToMany`:
```java
@Entity
@Table(name = "t_book")
public class Book {
	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(name = "t_book_author",
		uniqueConstraints = {@UniqueConstraint(name = "uc_book_author_main", columnNames = {"f_book", "f_author"})},
		joinColumns = {@JoinColumn(name = "f_book", nullable = false, foreignKey = @ForeignKey(name = "fk_book_author2book"))},
		inverseJoinColumns = {@JoinColumn(name = "f_author", nullable = false, foreignKey = @ForeignKey(name = "fk_book_author2author"))}
	)
	private List<Person> authors;
	
	// ...
}
```

## Auditing the Entities

For most of your entities, you need to track by who and when it is created, and by who and when last time it is modified.
Using the following class as superclass to all your entities is the solution.

```java
@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
public abstract class Auditable {
	@CreatedDate
	@Column(name = "d_created_date", nullable = false, updatable = false)
	private Date createdDate;

	@CreatedBy
	@Column(name = "c_created_by", nullable = false, updatable = false)
	private String createdBy;

	@LastModifiedDate
	@Column(name = "d_last_modified_date", insertable = false)
	private Date lastModifiedDate;

	@LastModifiedBy
	@Column(name = "c_last_modified_by", insertable = false)
	private String lastModifiedBy;

	@Version
	@Column(name = "n_version", nullable = false)
	private Integer version;
}
```

**Note:** In the above class, the `version` property is used for optimistic locking.