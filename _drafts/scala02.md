---
layout: post
title: "Driving Scala - 02"
categories: article scala
excerpt: A Summary for Scala Language, Part 02
---

## Class
- **No need for public modifier**: A class is not declared as `public` (non-modifier class means public)
- **Multiple classes in a source file** with public visibility
- Call a parameterless method **_with_ or _without_ parentheses**
  - Use () for a **mutator** method
  - Drop the () for an **accessor** method. To enforce this style, declare the method without `()`
- **No need to define accessors for a `var` field**
  - For a `var` field, a private field with its public accessors are generated in bytecode
  - In the case of private field, accessors become private too.
  - Note: Simple getters and setters are preferred over public fields. They can be evolved as needed. So custom getter/setter without changing the client of a class is possible. 
  That is called the **uniform access principle**
  - Defining a filed as `val` results in a read-only property
  - In the case of custom accessors, there should not be identical var name 


- Parameters of the primary constructor turn into `var` fields, initialized by the passed arguments
- **Nest anything inside anything**: functions inside other functions, and classes inside other classes

Define custom getter
> def PROP: TYPE = ...

Define custom setter
> def PROP_=(VARIABLE: TYPE) ...

**Note**: both `_=` are required without space between and before!

In the following class, important points of a class in Scala is illustrated.

```scala
import java.util.{Calendar, Date}

import scala.beans.BeanProperty

// although following class is not declared public, it is public
class Person { outer => //-----------------------alias 'outer' = 'Person.this', useful for inner classes

  var name: String = _ //------------------------field must be initialized, '_' means null

  private[this] var birth_date: Date = _ //------object-private field

  @BeanProperty //-------------------------------generating getX & setX for Java interoperability
  var weight: Int = 0 //-------------------------it can't be private!

  var address: Person#Address = _ //-------------type projection, i.e. Address for any Person


  // --------------- A U X   C O N S T R U C T O R S

  def this(name: String, birthDate: Date) {
    this() //------------------------------------calling default primary constructor is mandatory

    this.name = name // -------------------------also outer.name = name
    this.birthDate = birthDate
  }

  def this(birthDate: Date) { // ----------------this must be declared after the above one!
    this(null, birthDate) // --------------------refer to the above one
  }


  // --------------- A C C E S S O R S

  def age = { //---------------------------------age is an accessor, preferred to declare without ()
    val bd: Calendar = Calendar.getInstance
    bd.setTime(birth_date)

    Calendar.getInstance.get(Calendar.YEAR) - bd.get(Calendar.YEAR)
  }


  def birthDate: Date = birth_date

  def birthDate_=(date: Date) {
    if (date != null && date.compareTo(new Date) <= 0)
      birth_date = date
    else
      throw new IllegalAccessException("Invalid ‌Birth Date")
  }


  // --------------- F U C T I O N S  &  P R O C E D U R E S

  // since 'birth_date' is an object-private field, can't access other.birth_date
  def >(other: Person) = birth_date != null && birth_date.compareTo(other.birthDate) < 0

  def sendMsg() {
    println(s"Hi $name, You are $age years old, and your weight is $getWeight")
  }

  // --------------- I N N E R   C L A S S

  class Address(val province: String, val city: String) { // class with primary constructor
    override def toString: String = s"${outer.name} lives at $city, $province"
  }
}
```