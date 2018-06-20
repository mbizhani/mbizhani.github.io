---
layout: post
title: "Java Bond 008 - Mission: Stream"
categories: article tech
excerpt: An introduction to Java 8, Stream
---

In this part, a summary of `Stream` API in Java 8 is introduced. Although there are various tutorials in the Web, 
this text attempts to highlight the important points. The previous part, [Functional Programming](/article/tech/java8-fp), 
addressed functional programming and Lambda paradigm in Java 8. 

## Stream
`Stream` class, itself, is a Java interface with some static methods to create a stream. Some other classes
like collections has a specific method to return a Stream. The following sample demonstrates some of Stream API, 
and the following sections describe those APIs.

The APIs can be divided into three groups
- Creating a Stream ([Creation](#creation))
- Applying an intermediate processing operation on the elements and returning a new Stream ([Transformation & Resizing](#transformation-&-resizing))
- Returning a proper result, also called _terminal operations_ ([Reduction & Collection](#reduction-&-collection))


```java
import org.junit.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.LongStream;
import java.util.stream.Stream;

import static org.junit.Assert.assertEquals;

public class TestStream {

  @Test
  public void testFibonacci() {
    Stream<int[]> iterate;

    iterate = Stream.iterate(new int[]{1, 1}, n -> new int[]{n[1], n[0] + n[1]});
    int nth = iterate
      .peek(n -> System.out.printf("Debug: %s \n", Arrays.toString(n)))
      .limit(5)
      .reduce((a, b) -> b)
      .get()[1];
    assertEquals(8, nth);

    iterate = Stream.iterate(new int[]{1, 1}, n -> new int[]{n[1], n[0] + n[1]});
    List<Integer> list = iterate
      .limit(5)
      .map(n -> n[1])
      //.collect(ArrayList::new, ArrayList::add, ArrayList::addAll)
      .collect(Collectors.toList());
    assertEquals(list, Arrays.asList(1, 2, 3, 5, 8));
  }

  @Test
  public void test_Files_FlatMap_Distinct_Sorted_Reduction() throws IOException {
    final String content = "test01 passed\ntest02 passed\ntest11 failed";
    final String grepped = "test01 passed\ntest11 failed";

    final List<String> words =
      Arrays.asList("test01", "passed", "test02", "passed", "test11", "failed");

    final List<String> distinctWords =
      Arrays.asList("test01", "passed", "test02", "test11", "failed");

    final List<String> sortedDistinctWords =
      Arrays.asList("test11", "test02", "test01", "passed", "failed");

    final Path file = Files.createTempFile("__", "__");
    Files.write(file, content.getBytes());

    // Grepping lines containing '1'
    try (Stream<String> lines = Files.lines(file)) {
      String result = lines
        .filter(line -> line.contains("1"))
        .collect(Collectors.joining("\n"));
      assertEquals(grepped, result);
    }

    // List of words
    try (Stream<String> lines = Files.lines(file)) {
      List<String> result = lines
        .flatMap(line -> Stream.of(line.split("\\s")))
        .collect(Collectors.toList());
      assertEquals(words, result);
    }

    // List of distinct words
    try (Stream<String> lines = Files.lines(file)) {
      List<String> result = lines
        .flatMap(line -> Stream.of(line.split("\\s")))
        .distinct()
        .collect(Collectors.toList());
      assertEquals(distinctWords, result);
    }

    // List of distinct & descending-sorted words
    try (Stream<String> lines = Files.lines(file)) {
      List<String> result = lines
        .flatMap(line -> Stream.of(line.split("\\s")))
        .distinct()
        .sorted(Comparator.reverseOrder())
        .collect(Collectors.toList());
      assertEquals(sortedDistinctWords, result);
    }

    // List of distinct & descending-sorted words
    try (Stream<String> lines = Files.lines(file)) {
      String result = lines
        .flatMap(line -> Stream.of(line.split("\\s")))
        .distinct()
        .sorted(Comparator.reverseOrder())
        .findFirst() // min(Comparator.reverseOrder()) instead of sorted() & findFirst()
        .get();
      assertEquals("test11", result);
    }

    // Count number of words
    try (Stream<String> lines = Files.lines(file)) {
      long result = lines
        .flatMap(line -> Stream.of(line.split("\\s")))
        .count();
      assertEquals(words.size(), result);
    }

    // Count number of characters of words (1/2)
    String fileAsStr = new String(Files.readAllBytes(file));
    long result = Pattern.compile("\\s")
      .splitAsStream(fileAsStr)
      .mapToLong(String::length)
      .sum();
    assertEquals(36, result);

    // Count number of characters of words (2/2)
    fileAsStr = new String(Files.readAllBytes(file));
    result = Pattern.compile("\\s")
      .splitAsStream(fileAsStr)
      .reduce(0L,
        (total, word) -> total + word.length(),
        (total1, total2) -> total1 + total2);
    assertEquals(36, result);
  }

  @Test
  public void testFactorial() {
    long result = LongStream
      //.range(1, 5)        [1, 5)
      .rangeClosed(1, 5) // [1, 5]
      .reduce((left, right) -> left * right)
      .getAsLong();

    assertEquals(120, result);

    result = LongStream
      //.range(1, 5)        [1, 5)
      .rangeClosed(1, 5) // [1, 5]
      .reduce(1, (left, right) -> left * right);

    assertEquals(120, result);
  }

  @Test
  public void testCollectors() {
    List<Employee> list = Arrays.asList(
      new Employee("John", 5000),
      new Employee("Jack", 6000),
      new Employee("Jack", 7000),
      new Employee("Bill", 3000));

    Map<String, Employee> name2employee = list.stream()
      .collect(Collectors.toMap(Employee::getName, Function.identity(), (curV, newV) -> newV));

    assertEquals(3, name2employee.size());
    assertEquals(7000, name2employee.get("Jack").getSalary().intValue());


    final Map<String, List<Employee>> name2employees = list.stream()
      .collect(Collectors.groupingBy(Employee::getName, LinkedHashMap::new, Collectors.toList()));

    assertEquals("John", name2employees.keySet().stream().findFirst().get());
    assertEquals(3, name2employees.size());
    assertEquals(1, name2employees.get("Bill").size());
    assertEquals(2, name2employees.get("Jack").size());


    final int averageSalary = (int) list.stream()
      .mapToInt(Employee::getSalary)
      .average()
      .getAsDouble();
    assertEquals(5250, averageSalary);

    final Map<Boolean, List<Employee>> highSalaryEmployees = list.stream()
      .collect(Collectors.partitioningBy(emp-> emp.getSalary() > averageSalary));

    assertEquals(2, highSalaryEmployees.get(true).size());
    assertEquals(2, highSalaryEmployees.get(false).size());
  }

  // ------------------------------

  class Employee {
    private String name;
    private Integer salary;

    Employee(String name, Integer salary) {
      this.name = name;
      this.salary = salary;
    }

    String getName() {
      return name;
    }

    Integer getSalary() {
      return salary;
    }

    @Override
    public String toString() {
      return getName() + ", " + getSalary();
    }
  }
}
```

### Creation
The following methods return a `Stream` object.

<table>
	<tr>
		<th>API</th>
		<th>Description</th>
	</tr>
	
	<tr>
		<td colspan="2" align="center" style="background-color:#aaaa00">
			<i>
				Interface Static Methods (also valid for <em>IntStream</em>, <em>LongStream</em> and <em>DoubleStream</em>)
			</i>
		</td>
	</tr>
	
	<tr>
		<td>
			<code>Stream.of(T... varg)</code>
		</td>
		<td>
			<code>Stream&lt;String&gt; stream = Stream.of("1", "5", "7")</code>
		</td>
	</tr>
	
	<tr>
		<td>
			<code>Stream.generate(Supplier)</code>
		</td>
		<td>
			<p><code>Stream&lt;Double&gt; randoms = Stream.generate(Math::random)</code></p>
			
			<ul>
				<li>Returns an infinite sequential unordered stream</li>
				<li>Each element is generated by the provided <code>Supplier</code></li>
				<li>Suitable for generating constant streams, streams of random elements, etc</li>
			</ul>
		</td>
	</tr>
	
	<tr>
		<td>
			<pre>
Stream.iterate(
  T seed,
  UnaryOperator&lt;T&gt;)</pre>
		</td>
		<td>
			<ul>
				<li>Returns an infinite sequential ordered Stream</li>
				<li>Produced by iterative application of a function <code>f</code> to an initial element <code>seed</code></li>
				<li>Consisting of <code>seed</code>, <code>f(seed)</code>, <code>f(f(seed))</code>, etc.</li>
			</ul>
		</td>
	</tr>

	<tr>
		<td colspan="2" align="center" style="background-color:#aaaa00">
			<i>Object's Method Returning a Stream</i>
		</td>
	</tr>
	
	<tr>
		<td colspan="2">
			<code>COLLECTION_VAR.stream()</code> or 
			<code>COLLECTION_VAR.parallelStream()</code><br/>
		</td>
	</tr>
	
	<tr>
		<td colspan="2">
			<code>Stream&lt;String&gt; words = Pattern.compile("\\s").splitAsStream(CONTENT_VAR)</code>
		</td>
	</tr>
	
	<tr>
		<td colspan="2">
			<code>Stream&lt;String&gt; lines = Files.lines(PATH_VAR)</code>
		</td>
	</tr>
</table>

### Transformation & Resizing
The following methods return an `Stream` or Stream-based object.

<table>
	<tr>
		<th>API</th>
		<th>Description</th>
	</tr>
	
	<tr>
		<td><code>filter(Predicate&lt;? super T&gt; p)</code></td>
		<td>
<pre>
// T t -&gt; boolean
public interface Predicate&lt;T&gt; {
  boolean test(T t);
}</pre>
so
<code>filter(n -&gt; n > 12)</code>
		</td>
	</tr>
	
	<tr>
		<td><code>map(Function&lt;? super T, ? extends R&gt; mapper)</code></td>
		<td>
<pre>
// T t -&gt; R
public interface Function&lt;T, R&gt; {
  R apply(T t);
}</pre>
so
<code>map(s -&gt; s.length())</code>
		</td>
	</tr>
	
	<tr>
		<td><code>mapToInt(ToIntFunction&lt;? super T&gt; mapper): <b>IntStream</b></code></td>
		<td>
<pre>
// T t -&gt; int
public interface ToIntFunction&lt;T&gt; {
  int applyAsInt(T value);
}</pre>
so
<code>mapToInt(s -&gt; s.length())</code>
		</td>
	</tr>
	
	<tr>
		<td colspan="2">
			<code>mapToLong()</code> and <code>mapToDouble()</code> are similar to the above.
		</td>
	</tr>	
	
	<tr>
		<td>
<pre>
flatMap(Function&lt;? super T,
  ? extends Stream&lt;? extends R&gt;&gt; mapper)</pre>
		</td>
		<td>
<pre>
Stream&lt;String&gt; lines = Files.lines(path)
Stream&lt;String&gt; words = lines.flatMap(
  line -&gt; Stream.of(line.split(" +")))</pre>
		</td>
	</tr>

	<tr>
		<td><code>limit(long n)</code></td>
		<td>
	    	Returns a stream consisting of the <em>first n</em> elements in the encounter order, 
	    	so it can be quite expensive on ordered parallel pipelines.
	    	<br/>
	    	<blockquote>
				<b>Note</b>: If ordered elements is required, and there is poor performance or memory utilization with
				limit() in parallel pipelines, switching to sequential execution with sequential() may improve performance.
			</blockquote>
		</td>
	</tr>

	<tr>
		<td><code>skip(long n)</code></td>
		<td>
	    	Returns a stream remaining of the elements after discarding the <em>first n</em> elements in the encounter order, 
	    	so it can be quite expensive on ordered parallel pipelines.
	    	<br/>
	    	If this stream contains fewer than <em>n</em> elements then an empty stream will be returned.
	    	<br/>
	    	<b>Note</b>: the note in limit()
		</td>
	</tr>

	<tr>
		<td><code>distinct()</code></td>
		<td>
			Returns a stream consisting of the distinct elements (according to equals()).
			<br/>
			For ordered streams, the selection of distinct elements is stable, however for unordered streams no stability guarantees are made.
	    	<br/>
	    	<b>Note</b>: the note in limit()
		</td>
	</tr>

	<tr>
		<td>
			<code>sorted()</code>
			<br/>
			<code>sorted(Comparator&lt;? super T&gt; comparator)</code>
		</td>
		<td>
			Returns a stream of sorted elements according to natural order or given <em>comparator</em>.
			<br/>
			For ordered streams, the sort is stable, however for unordered streams no stability guarantees are made.
		</td>
	</tr>
</table>

### Reduction & Collection
- These methods are _terminal operations_ and get the final answer from a `Stream`.
- Reduction ones mostly return an `Optional` object
- Collection ones mostly return a `Collection`
- After calling these methods, the `Stream` object is closed

 <table>
 	<tr>
 		<th>API</th>
 		<th>Description</th>
 	</tr>
 	
	<tr>
		<td colspan="2" align="center" style="background-color:#aaaa00">
			<i>
				Reduction
			</i>
		</td>
	</tr>
 	
 	<tr>
 		<td><code>findFirst(): Optional</code></td>
 		<td>
 			Returns an Optional describing the first element
 		</td>
 	</tr>
 	
 	<tr>
 		<td><code>findAny(): Optional</code></td>
 		<td>
			Returns an Optional element of the stream.
			<br/>
			The behavior is nondeterministic, so it is effective when you parallelize the stream 
			and the first match in any of the examined segments will complete the computation.
 		</td>
 	</tr>
 	
 	<tr>
 		<td><code>anyMatch(Predicate): boolean</code></td>
 		<td>
			Returns whenever any elements of this stream match the provided predicate
 		</td>
 	</tr>
 	
 	<tr>
 		<td colspan="2">There are <code>allMatch()</code> and <code>noneMatch()</code>, the same syntax as above, 
 		that return true if all or no elements match a predicate</td>
 	</tr>
 	
 	<tr>
 		<td><code>reduce(BinaryOperator&lt;T&gt; accumulator): Optional</code></td>
 		<td>
<pre>
// T t, T t -> T
public interface BinaryOperator&lt;T&gt; {
  T apply(T t, T t);
}</pre>
Performs a reduction on the elements of this stream, using an <b>associative accumulation function</b> (e.g. 
sum and product, string concatenation, maximum and minimum, set union and intersection), 
and returns an Optional describing the reduced value.
<br/>
<b>Note</b>: in fact <code>BinaryOperator&lt;T&gt; extends BiFunction&lt;T, T, T&gt;</code>
    	</td>
 	</tr>
 	
 	<tr>
 		<td><code>count(): long</code></td>
 		<td>
			Count the elements in this stream.
			<br/>
			This is a special case of reduction equivalent to:
			<br/>
			<code>return mapToLong(e -> 1L).sum();</code>
 		</td>
 	</tr>
 	
 	<tr>
 		<td>
 			<code>max()</code>
 			<code>min()</code>
 			<code>sum()</code>
 			<code>average()</code>
 			<code>summaryStatistics()</code>
 		</td>
 		<td>
 			The related mathematical function is applied on the numerical elements of the Stream.
 			So the stream must be <code>IntStream</code>, <code>LongStream</code>, or <code>DoubleStream</code>.  
 		</td>
 	</tr>

	<tr>
		<td colspan="2" align="center" style="background-color:#aaaa00">
			<i>
				Collection
			</i>
		</td>
	</tr>
	
 	<tr>
 		<td>
<pre>
&lt;R&gt; R collect(
  Supplier&lt;R&gt; supplier,
  BiConsumer&lt;R, ? super T&gt; accumulator,
  BiConsumer&lt;R, R&gt; combiner)</pre>
 		</td>
 		<td>
<pre>stream.collect(
  ArrayList::new,
  ArrayList::add,
  ArrayList::addAll)</pre>
 		</td>
 	</tr>

 	<tr>
 		<td>
			<code>collect(Collector collector)</code>
 		</td>
 		<td>
			<code>collect(Collectors.asList())</code> 			
			<br/>
			<code>collect(Collectors.asSet())</code> 			
			<br/>
			<code>collect(Collectors.toCollection(LinkedHashSet::new))</code>
			<br/>
			<br/>
			<code>collect(Collectors.joining())</code> 			
			<br/>
			<code>collect(Collectors.joining(","))</code> 			
			<br/>
			If your stream contains objects other than strings, you need to first convert them to strings, like this:
            <code>stream.map(Object::toString).collect(Collectors.joining(","))</code>
            <br/>
            <br/>
<pre>
// map name to salary
collect(Collectors.toMap(
  Employee::getName, 
  Employee::getSalary))</pre>
<pre>
// map name to employee
collect(Collectors.toMap(
  Employee::getName,
  Function.identity()))</pre>
Note: Duplicate key results in exception in previous two toMap(), however the following trie to handle it!
<pre>
// map name to employee, on duplicate key use first one
collect(Collectors.toMap(
  Employee::getName,
  Function.identity(), 
  (curVal, newVal) -> curVal))</pre>
            <br/>
<pre>collect(Collectors.groupingBy(
  Employee::getName): Map&lt;String, List&lt;Employee&gt;&gt;</pre>
<pre>collect(Collectors.groupingBy(
  Employee::getName, 
  LinkedHashMap::new, 
  Collectors.toList())): Map&lt;String, List&lt;Employee&gt;&gt;</pre>
 		</td>
 	</tr>

 	<tr>
 		<td>
 			<code>&lt;A&gt; A[] toArray(IntFunction&lt;A[]&gt; generator)</code>
 		</td>
 		
 		<td>
<pre>
// int v -&gt; R
public interface IntFunction&lt;R&gt; {
  R apply(int value);
}</pre>
The most common call is <code>toArray(TYPE[]::new)</code> (constructor reference)
 		</td>
 	</tr>
</table>

### Another Example
This a simplified version of a real example. Suppose there are two entities: `Report` & `Group`. These two entities has a 
many-to-many association, navigable from `Report` to `Group` (following code). Now, when a list of `Report` objects is 
fetched from database, each `Report` knows its `Group`, but for presentation, a reverse relation is needed, 
and it is required to group `Report`s by `Group`. The following code shows the solution:

```java
import org.junit.Test;

import java.util.*;
import java.util.stream.Collectors;

import static org.junit.Assert.assertEquals;

public class TestManyToMany {

  @Test
  public void test() {
    Group scm = new Group("SCM");
    Group mtc = new Group("MTC");
    Group hse = new Group("HSE");

    Report stock = new Report("Stock Inventory", scm, mtc);
    Report incid = new Report("Incidents", hse);
    Report artcl = new Report("Accounting Articles", scm, mtc, hse);
    Report mttr = new Report("MTTR", mtc);

    List<Report> reports = Arrays.asList(stock, incid, artcl, mttr);

    Map<Group, List<Report>> expected = new TreeMap<>();
    expected.put(scm, Arrays.asList(stock, artcl));
    expected.put(mtc, Arrays.asList(stock, artcl, mttr));
    expected.put(hse, Arrays.asList(incid, artcl));


    Map<Group, List<Report>> result = reports.stream()
      .flatMap(report ->
        report.getGroups().stream().map(dataGroup ->
          new AbstractMap.SimpleEntry<>(dataGroup, report)
        )
      )
      .collect(Collectors.groupingBy(
        AbstractMap.SimpleEntry::getKey,
        TreeMap::new,
        Collectors.mapping(
          AbstractMap.SimpleEntry::getValue,
          Collectors.toList()))
      );

    assertEquals(expected, result);
  }

  // ------------------------------

  private class Report {
    private String name;
    private List<Group> groups;

    Report(String name, Group... groups) {
      this.name = name;
      this.groups = Arrays.asList(groups);
    }

    String getName() {
      return name;
    }

    List<Group> getGroups() {
      return groups;
    }

    @Override
    public String toString() {
      return getName();
    }
  }

  // ------------------------------

  private class Group implements Comparable<Group> {
    private String name;

    Group(String name) {
      this.name = name;
    }

    String getName() {
      return name;
    }

    @Override
    public String toString() {
      return getName();
    }

    @Override
    public int compareTo(Group o) {
      return getName().compareTo(o.getName());
    }
  }
}
```
- Lines 30 to 34 act like a `Cartesian Product` and the result is tuples of `(Group, Report)`
- `AbstractMap.SimpleEntry` is used as the data structure for tuple
- Lines 38 to 40 create a `mapping` from `AbstractMap.SimpleEntry<Group, Report>` to `Report`