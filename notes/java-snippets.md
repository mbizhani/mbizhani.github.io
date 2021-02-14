---
layout: page
title: Java Snippets
toc: true
---

## List files in a folder inside classpath

```java
final var dir = "/com/";

final var uri = getClass().getResource(dir).toURI();
System.out.println("uri = " + uri);

final var pathInCP = "jar".equals(uri.getScheme()) ?
  FileSystems.newFileSystem(uri, Collections.emptyMap()).getPath(dir) :
  Paths.get(uri);

Files.list(pathInCP).forEach(path -> {
  final var fileName = path.getFileName().toString();
  final var type = Files.isRegularFile(path) ? "file" : Files.isDirectory(path) ? "dir" : "?";
  System.out.println("File: '" + fileName + "' - type: " + type);
});
```

## ExecutorService & invokeAll()

```java
final var callables = IntStream
  .range(1, 5)
  .mapToObj(operand -> (Callable<Integer>) () -> {
      Thread.sleep(operand * 1000);
      System.out.printf("callable[%s]: operand=%s\n", Thread.currentThread().getName(), operand);
      return operand;
  })
  .collect(Collectors.toList());

final var service = Executors.newFixedThreadPool(callables.size());
final var futures = service.invokeAll(callables, 3, TimeUnit.SECONDS);
service.shutdown();

System.out.printf("\nfutures.size() = %s\n\n", futures.size());
for (int i = 0; i < futures.size(); i++) {
  final var future = futures.get(i);
  if (future.isCancelled()) {
    System.err.printf("%s: canceled\n", i + 1);
  } else {
    final Integer rs = future.get();
    System.out.printf("%s: result = %s\n", i + 1, rs);
  }
}
```

Output is:
```text
callable[pool-1-thread-1]: operand=1
callable[pool-1-thread-2]: operand=2

futures.size() = 4

1: result = 1
2: result = 2
3: canceled
4: canceled
```