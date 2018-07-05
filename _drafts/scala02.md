---
layout: post
title: "Driving Scala - 02"
categories: article scala
excerpt: A Summary for Scala Language, Part 02
---

## Class
- A class is not declared as `public` (no modifier means public)
- Source file can contain multiple classes with public visibility
- Call a parameterless method _with_ or _without_ parentheses
  - Use () for a **mutator** method
  - Drop the () for an **accessor** method. To enforce this style, declare the method without `()`
- If a `var` field is declared as public, Scala generates a JVM class having that filed as private with its public accessors.
  - In the case of private field, accessors become private too.
  - Note: Simple getters and setters are preferred over public fields. They can be evolved as needed.
- Defining a filed as `val` results in a read-only property


- Parameters of the primary constructor turn into fields, initialized by the passed parameters
- In Scala, you can nest just about anything inside anything. You can define functions inside other functions, and classes inside other classes.