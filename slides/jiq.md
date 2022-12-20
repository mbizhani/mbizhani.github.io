---
layout: slide
caption: Java Interview Questions
description: Java Interview Questions
theme: blood
---

<section data-markdown data-separator="===" data-separator-vertical="^---$">
  <textarea data-template> 

## Java Interview Questions

===
### Integer Cache

```java
Integer num1 = 128, num2 = 128;
System.out.println(num1 == num2); // false
Integer num3 = 127, num4 = 127;
System.out.println(num3 == num4); // true
```

===
### String Pool

- Using the `new` operator for `String`, ensures that it is created in the heap (not into the string pool). 
- Using literal `String` ensures that the string is created in the string pool. 
  - String pool exists as part of the perm area in the heap.
  


===
### References
- [Java Interview Questions for 5 years Experience](https://www.interviewbit.com/java-interview-questions-for-5-years-experience/)


  </textarea>
</section>