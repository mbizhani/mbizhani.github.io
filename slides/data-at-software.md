---
layout: slide
caption: Data @ Software
description: Handling Data in Software
theme: blood
---

<section data-markdown data-separator="===" data-separator-vertical="^---$">
  <textarea data-template>

## Data @ Software

===
### Data Models

- Relational Model
  - Edgar Codd: "Data is organized into relations (called _tables_ in SQL),
    where each relation is an unordered collection of tuples (_rows_ in SQL)."
  - **schema-on-write**
- Document Model
  - **schema-on-read**
- Graph-based Model

===
### SQL vs NoSQL

- Drivers for NoSQL
  - Greater scalability than relational databases
  - Specialized query operations
  - Dynamic and expressive data model
- **Polyglot persistence** - use both SQL & NoSQL alongside

===
### Sample Model

- In relational model, entities are mapped to tables
- In document model, it can be contained in a JSON
  - The relations are **local** to _User_ entity
  - A user can be fetched by one query
- Any `1-to-*` relation shows a tree structure

![resume-class-diagram](/assets/images/slides/data/resume-class-diagram01.png)

---
### Sample Model

- We don't want to repeat _Industry_ & _Region_ (normalization)
- Refactor `Education` & `Position` (adding two mode `*-to-` relations)
- Now, only `Education`, `Postion`, and `ContactInfo` are _local_ to `User` 

![resume-class-diagram](/assets/images/slides/data/resume-class-diagram02.png)

---
### Sample Model
So in document model
- `*-to-1`
  - Not fit nicely
  - Need _implicit_ joins
  - Usually no join support (need multiple queries)
- `1-to-*`
  - Perfect
  - Fetched by single query

===
### Query Languages

- SQL
  - Declarative lang
  - Can be executed in parallel
- MapReduce
  - A programming model for processing large amounts of data in bulk across many machines
  - Available in MongoDB and CouchDB
  - `map` known as _collect_, and `reduce` known as _fold_ or _inject_

===
### Graph-Like Data Model

  </textarea>
</section>