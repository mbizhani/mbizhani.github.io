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

## Replace text by Pattern

Suppose in a payment system, we have some nested JSONs with its signatures. We want to log received messages, however the
security team has forced you to mask following fields before writing to log files: `srcCardId`, `destCardId`, `trx`, and `refNo`.

Following code is just a simulation for single message, and you want to log received `serverSignedJson`.

```java
final var mapper = new ObjectMapper();

final var trxUser = new TransferUserData("c123-1-9870", "c345-1-9871", 1210L, 23874623L, 1000001L, null);
final var trxUserJson = mapper.writeValueAsString(trxUser);
System.out.println("trxUser = " + trxUserJson);

final var userSigned = new SignedData(trxUserJson, signByUser(trxUserJson));
final var userSignedJson = mapper.writeValueAsString(userSigned);
System.out.println("userSigned = " + userSignedJson);

final var serverData = new ServerData("1000", userSignedJson);
final var serverDataJson = mapper.writeValueAsString(serverData);
System.out.println("serverData = " + serverDataJson);

final var serverSigned = new SignedData(serverDataJson, signByServer(serverDataJson));
final var serverSignedJson = mapper.writeValueAsString(serverSigned);
System.out.println("serverSigned = " + serverSignedJson);
```

The output is something like this:

```text
trxUser = {"srcCardId":"c123-1-9870","destCardId":"c345-1-9871","amount":1210,"trxId":23874623,"refNo":1000001,"trx":null}
userSigned = {"raw":"{\"srcCardId\":\"c123-1-9870\",\"destCardId\":\"c345-1-9871\",\"amount\":1210,\"trxId\":23874623,\"refNo\":1000001,\"trx\":null}","signed":"SIGNED_BY_USER"}
serverData = {"serverId":"1000","signedUserData":"{\"raw\":\"{\\\"srcCardId\\\":\\\"c123-1-9870\\\",\\\"destCardId\\\":\\\"c345-1-9871\\\",\\\"amount\\\":1210,\\\"trxId\\\":23874623,\\\"refNo\\\":1000001,\\\"trx\\\":null}\",\"signed\":\"SIGNED_BY_USER\"}"}
serverSigned = {"raw":"{\"serverId\":\"1000\",\"signedUserData\":\"{\\\"raw\\\":\\\"{\\\\\\\"srcCardId\\\\\\\":\\\\\\\"c123-1-9870\\\\\\\",\\\\\\\"destCardId\\\\\\\":\\\\\\\"c345-1-9871\\\\\\\",\\\\\\\"amount\\\\\\\":1210,\\\\\\\"trxId\\\\\\\":23874623,\\\\\\\"refNo\\\\\\\":1000001,\\\\\\\"trx\\\\\\\":null}\\\",\\\"signed\\\":\\\"SIGNED_BY_USER\\\"}\"}","signed":"SIGNED_BY_SERVER"}
```

The `mask()` method tries to find the fields' value and replace it via using regex:

```java
String mask(String json) {
  final var pattern = Pattern.compile(
	  "\"(srcCardId|destCardId|trx|refNo)\\\\*?\":.*?(null|\"(?<STRVAL>.*?)\\\\*?\"|(?<NUMVAL>\\d+))");

  final Matcher matcher = pattern.matcher(json);

  final StringBuilder builder = new StringBuilder();

  while (matcher.find()) {
    final String expr = matcher.group(0);

    if (matcher.group("STRVAL") != null || matcher.group("NUMVAL") != null) {

      final String replacement = matcher.group("STRVAL") != null ?
        matcher.group("STRVAL") :
        matcher.group("NUMVAL");

      final String newStr = replacement.length() > 2 ?
        "*".repeat(replacement.length() - 2) + replacement.substring(replacement.length() - 2) :
        replacement;

      final String newExpr = expr.replace(replacement, newStr);
      matcher.appendReplacement(builder, Matcher.quoteReplacement(newExpr));
    } else {
      matcher.appendReplacement(builder, Matcher.quoteReplacement(expr));
    }
  }
  matcher.appendTail(builder);
  return builder.toString();
}
```

The output is this:

```text
serverSignedJson = {"raw":"{\"serverId\":\"1000\",\"signedUserData\":\"{\\\"raw\\\":\\\"{\\\\\\\"srcCardId\\\\\\\":\\\\\\\"*********70\\\\\\\",\\\\\\\"destCardId\\\\\\\":\\\\\\\"*********71\\\\\\\",\\\\\\\"amount\\\\\\\":1210,\\\\\\\"trxId\\\\\\\":23874623,\\\\\\\"refNo\\\\\\\":*****01,\\\\\\\"trx\\\\\\\":null}\\\",\\\"signed\\\":\\\"SIGNED_BY_USER\\\"}\"}","signed":"SIGNED_BY_SERVER"}
```