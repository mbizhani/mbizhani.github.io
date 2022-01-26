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

|       |                       |
|-------|-----------------------|
| **S** | Single Responsibility |
| **O** | Open-Closed (OCP)     |
| **L** | Liskov Substitutions  |
| **I** | Interface Segregation |
| **D** | Dependency Inversion  |

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
- Stop ourselves from modifying existing code 
  - => fewer bugs

===
### Liskov Substitutions

<table><tr>
<td>
If class <code>Child</code> is a subtype of class <code>Parent</code>, it should be possible to replace <code>Parent</code>
with any <code>Child</code> without disrupting the behavior of the program.
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