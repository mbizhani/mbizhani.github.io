---
layout: slide
caption: SOLID Principles 
description: SOLID Principles
theme: moon
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
### Open-Closed

- Classes
  - Open for extension
  - Closed for modification
- Solutions
  - `inheritance` as a mechanism to inherit existing code, and add extra functionality in the subclass
  - `decorator design pattern` by applying composition on existing code, and add extra functionality in the `wrapper` class

===
### Liskov Substitution

<table><tr>
<td>
<ul>
  <li>
  If class <code>Child</code> is a subtype of class <code>Parent</code>, it should be possible to replace <code>Parent</code>
  with any <code>Child</code> without disrupting the behavior of the program.
  </li>

  <li>
   If <code>test(Parent)</code> passed => <code>test(Child1)</code> and <code>test(Child2)</code> should pass!
  </li>
  <li>It ensures conformity in all classes in the entire hierarchy</li>
</ul>
</td>
<td>
  <img width="1500" src="/assets/images/slides/solid/liskov-class-diagram.png"/>
</td>
</tr></table>

===
### Interface Segregation

- Larger interfaces should be split into smaller ones
  - Implementing classes only need to be concerned about the methods that are of interest to them

===
### Dependency Inversion

The principle of dependency inversion refers to the decoupling of software modules. This way, instead of high-level modules depending on low-level modules, both will depend on abstractions.

  </textarea>
</section>