---
layout: slide
caption: Design Patterns
description: Design Patterns
theme: blood
---

<section data-markdown data-separator="===" data-separator-vertical="^---$">
  <textarea data-template>

## Design Patterns
#### Design _reusable_ and _extensible_ object oriented software


===
### Introduction 

- OO Principles
  - Encapsulation
  - Abstraction
  - Inheritance
  - Polymorphism
- Interface - a contract specifying the **capabilities** that a class should provide

---
### Problems with Inheritance

- It is all about behavior!
- The changes to superclass may affect all subclasses.
- Adding an `abstract` method to the superclass forces all subclasses to implement it.
  - Taking those methods to separate interface(s) is the same problem!
  - Altering the hierarchy and inserting an abstract class in the middle may solve the problem for **some** behaviors. 


===
### Design Principles (1/4)

- Identify the aspects of your application that vary and separate them from what stays the same.
  - Take the parts that vary and "encapsulate" them, so that later you can alter or extend the parts that vary without affecting those that don’t.
  - All patterns provide a way to let _some part of a system vary independently of all other parts_.

---
### Design Principles (2/4)

- Program to an interface (_supertype_), not an implementation
  - Use an interface to represent each behavior
  - Define a behavior represented by an interface
  - Delegate the behavior to an implementation
- Instead of calling a _set of behaviors_, we’ll start thinking as a _family of algorithms_.

---
### Design Principles (3/4)

- **Favor composition over inheritance.**
  - `HAS-A` can be better than `IS-A`
  - The class **has** behaviors A and B
  - You can change behavior at runtime

---
### Design Principles (4/4)

![Ducks Behaviors](/assets/images/slides/design-patterns/ducks-behaviors.png)


===
### Categories

| Creational | Structural  | Behavioral |
|------------|-------------|------------|
| Singleton  | Composition | Strategy   |


===
### References

- Head First Design Patterns, O'Reilly, 2021


</textarea>
</section>