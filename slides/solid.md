---
layout: slide
caption: SOLID Principles 
description: SOLID Principles
theme: blood
---

<section data-markdown data-separator="===" data-separator-vertical="^---$">
  <textarea data-template>

## SOLID Principles

===
### Principles

|       |                           |
|-------|---------------------------|
| **S** | Single Responsibility     |
| **O** | Open/Closed (OCP)         |
| **L** | Liskov Substitution (LSP) |
| **I** | Interface Segregation     |
| **D** | Dependency Inversion      |

===
### Single Responsibility

- A class should only have one responsibility
  - Only one reason to change
- Advantages
  - Testing - fewer test cases
  - Lower Coupling - fewer dependencies

===
### Open/Closed (OCP)

- Classes
  - Open for extension
  - Closed for modification
- Solutions
  - `inheritance` as a mechanism to inherit existing code, and add extra functionality in the subclass
  - `decorator design pattern` by applying composition on existing code, and add extra functionality in the `wrapper` class

===
### Liskov Substitution (LSP)

<table>
<tr>
<td colspan="2" style="border:0">
<ul>
  <li>
  If class <code>Child</code> is a subtype of class <code>Parent</code>, it should be possible to replace <code>Parent</code>
  with any <code>Child</code> without disrupting the behavior of the program.
  </li>
  <li>
   If <code>test(Parent)</code> passed => both <code>test(Child1)</code> and <code>test(Child2)</code> should pass!
  </li>
</ul>
</td>
</tr>

<tr>
<td>
<ul>
  <li>It ensures conformity in all classes in the entire hierarchy.</li>
</ul>
</td>
<td>
  <img width="1000" src="/assets/images/slides/solid/liskov-class-diagram.png"/>
</td>
</tr>
</table>

---
#### Sample

![liskov-sample](/assets/images/slides/solid/liskov-sample.png)

===
### Interface Segregation

- Larger interfaces should be split into smaller ones
  - Implementing classes only need to be concerned about the methods that are of interest to them

===
### Dependency Inversion

- For decoupling of software modules, both high-level and low-level modules should depend on abstractions:
  - High-level modules/classes should not depend on low-level modules/classes. Both should depend upon abstractions.
  - Abstractions should not depend upon details. Details should depend upon abstractions.
- Different from `dependency injection`

===
### References
- [A Solid Guide to SOLID Principles](https://www.baeldung.com/solid-principles)
- [The Liskov Substitution Principle (LSP)](https://www.linkedin.com/pulse/liskov-substitution-principle-lsp-paul-gichure-ctfl/)
- [SOLID Principle in Programming: Understand With Real Life Examples](https://www.geeksforgeeks.org/solid-principle-in-programming-understand-with-real-life-examples/)

  </textarea>
</section>