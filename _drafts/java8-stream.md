---
layout: post
title: "Java Bond 008 - Mission: Stream"
categories: article tech
excerpt: An introduction to Java 8, Stream
---

This part tries to summarise `Stream` API in Java 8.

## Stream
`Stream` class, itself, is an Java interface, but it has some static methods to create a stream. Some other classes
like collections has a specific method to return a Stream.

### Creation

<table>
	<tr>
		<th>API</th>
		<th>Description</th>
	</tr>
	
	<tr>
		<td><code>Stream.empty()</code></td>
		<td></td>
	</tr>
	
	<tr>
		<td><code>Stream.of(T... varg)</code></td>
		<td>
			<code>Stream&lt;Integer&gt; stream = Stream.of(1, 5, 7)</code>
		</td>
	</tr>
	
	<tr>
		<td><code>Stream.generate(Supplier)</code></td>
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
		<td colspan="2">
			<code>Stream&lt;String&gt; words = Pattern.compile("[\\P{L}]+").splitAsStream(content)</code>
		</td>
	</tr>
	
	<tr>
		<td colspan="2">
			<code>try (Stream&lt;String&gt; lines = Files.lines(path)) { ... }</code>
		</td>
	</tr>
</table>

### Transformation
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
		<td><code>map(Function&lt;? super T, ? extends R&gt; mapper</code></td>
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
		<td>
<pre>
flatMap(Function&lt;? super T,
  ? extends Stream&lt;? extends R&gt;&gt; mapper</pre>
		</td>
		<td>
<pre>
Stream&lt;String&gt; lines = Files.lines(path)
Stream&lt;String&gt; words = lines.flatMap(
  line -&gt; Stream.of(line.split(" +")))</pre>
		</td>
	</tr>

</table>

```java
import org.junit.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.Assert.assertEquals;

public class TestStream {
  @Test
  public void testFibonacci() {
    Stream<int[]> iterate;

    iterate = Stream.iterate(new int[]{1, 1}, n -> new int[]{n[1], n[0] + n[1]});
    int nth = iterate
      .limit(5)
      .reduce((a, b) -> b)
      .get()[1];
    assertEquals(8, nth);

    iterate = Stream.iterate(new int[]{1, 1}, n -> new int[]{n[1], n[0] + n[1]});
    List<Integer> list = iterate
      .limit(5)
      .map(n -> n[1])
      .collect(Collectors.toList());
    assertEquals(list, Arrays.asList(1, 2, 3, 5, 8));
  }

  @Test
  public void testFileAndFlatMap() throws IOException {
    final String content = "test01 passed\ntest02 passed\ntest11 failed";
    final String grepped = "test01 passed\ntest11 failed";
    final List<String> words = Arrays.asList("test01", "passed",
      "test02", "passed", "test11", "failed");

    final Path file = Files.createTempFile("__", "__");
    Files.write(file, content.getBytes());

    try (Stream<String> stream = Files.lines(file)) {
      String result = stream
        .filter(line -> line.contains("1"))
        .collect(Collectors.joining("\n"));
      assertEquals(grepped, result);
    }

    try (Stream<String> stream = Files.lines(file)) {
      List<String> result = stream
        .flatMap(line -> Stream.of(line.split("\\s")))
        .collect(Collectors.toList());
      assertEquals(words, result);
    }
  }
}
```