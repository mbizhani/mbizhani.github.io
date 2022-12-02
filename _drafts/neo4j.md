# Neo4J

- [Video - Complete Introduction to Databases](https://btholt.github.io/complete-intro-to-databases/neo4j)
- [Neo4J - Docker](https://neo4j.com/docs/operations-manual/current/docker/)
- [Neo4J - Spring Data](https://neo4j.com/developer/spring-data-neo4j/)

## Start

```yaml
version: "3.8"

services:
  neo4j:
    image: neo4j:5.2.0-community
    hostname: tw-neo4j
    container_name: tw-neo4j
    user: "1000:1000"
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: "neo4j/test"
    volumes:
      - ./vols/neo4j/data:/data
      - ./vols/neo4j/logs:/logs
    networks:
      - ext

networks:
  ext:
    external: true
    name: ext_net
```

- `mkdir -p vols/neo4j/{data,logs}` - SHELL! before start
- `http://localhost:7474/` - Web Console
- `docker-compose exec neo4j cypher-shell -u neo4j -p test` - CLI

## Concepts

- Nodes:
  - Represents entities or discrete objects that can be classified with zero or more labels.
  - Data is stored as properties of the nodes.
  - Properties are simple key-value pairs.
  - Similar nodes can have different properties.
  - Properties can hold different data types, such as `number`, `string`, or `boolean`.
  - Properties can also be a homogeneous list (array) containing strings, numbers, or boolean values.
- Relationships:
  - Always have a direction.
  - Always have a type.
  - Form patterns of data, the structure of the graph.

## Web Console

- `:play start`
- `:help`, `:help keys`
- `CREATE (ee:Person {name: 'Emil', from: 'Sweden', kloutScore: 99})`
- `MATCH (p:Person) where ID(p)=1 delete p`
- `MATCH (ee:Person) WHERE ee.name = 'Emil' RETURN ee`
- Add more nodes with relations
```text
MATCH (ee:Person) WHERE ee.name = 'Emil'
CREATE (js:Person { name: 'Johan', from: 'Sweden', learn: 'surfing' }),
(ir:Person { name: 'Ian', from: 'England', title: 'author' }),
(rvb:Person { name: 'Rik', from: 'Belgium', pet: 'Orval' }),
(ally:Person { name: 'Allison', from: 'California', hobby: 'surfing' }),
(ee)-[:KNOWS {since: 2001}]->(js),
(ee)-[:KNOWS {rating: 5}]->(ir),
(js)-[:KNOWS]->(ir),
(js)-[:KNOWS]->(rvb),
(ir)-[:KNOWS]->(js),
(ir)-[:KNOWS]->(ally),
(rvb)-[:KNOWS]->(ally)
```
- `MATCH (ee:Person)-[:KNOWS]-(friends) WHERE ee.name = 'Emil' RETURN ee, friends`
- `CREATE CONSTRAINT FOR (n:Person) REQUIRE (n.name) IS UNIQUE`
- `CREATE INDEX FOR (m:Movie) ON (m.released)`
- `MATCH (p:Person) WHERE p.name=~'Tom.*' RETURN p`
- `MATCH (p:Person) WHERE p.name contains 'Tom' RETURN p`
- `MATCH (tom:Person)-[:ACTED_IN]->(tomHanksMovies) WHERE tom.name='Tom Hanks' RETURN tom,tomHanksMovies.title`
- `MATCH (people:Person)-[relatedTo]-(:Movie {title: "Cloud Atlas"}) RETURN people.name, Type(relatedTo), relatedTo.roles`
- Kevin Bacon
    - `MATCH (bacon:Person {name:"Kevin Bacon"})-[*0..4]-(hollywood) RETURN DISTINCT hollywood`
    - `MATCH p=shortestPath((bacon:Person {name:"Kevin Bacon"})-[*]-(meg:Person {name:"Meg Ryan"})) RETURN p`
- Recommend new co-actors
  - First find potential co-actors who have not worked with 'Tom Hanks'
```cypher
MATCH
  (tom:Person {name:"Tom Hanks"})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors),
  (coActors)-[:ACTED_IN]->(m2)<-[:ACTED_IN]-(cocoActors)
WHERE 
  NOT (tom)-[:ACTED_IN]->()<-[:ACTED_IN]-(cocoActors) 
  AND tom <> cocoActors
RETURN cocoActors.name AS Recommended, count(*) AS Strength ORDER BY Strength DESC
```
  - Second, find someone in middle who can introduce 'Tom Cruise' to 'Tom Hanks'
```cypher
MATCH
  (tom:Person {name:"Tom Hanks"})-[:ACTED_IN]->(m)<-[:ACTED_IN]-(coActors),
  (coActors)-[:ACTED_IN]->(m2)<-[:ACTED_IN]-(cruise:Person {name:"Tom Cruise"})
RETURN
  tom.name, m.title, coActors.name, m2.title, cruise.name
```

- Clean Up
  - `MATCH (n) DETACH DELETE n`

### Northwind

- Load data from CSV

```cypher

## LOADING Supplier <- Product -> Category

LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/northwind/products.csv" AS row
CREATE (n:Product) SET n = row,
  n.unitPrice = toFloat(row.unitPrice),
  n.unitsInStock = toInteger(row.unitsInStock), 
  n.unitsOnOrder = toInteger(row.unitsOnOrder),
  n.reorderLevel = toInteger(row.reorderLevel), 
  n.discontinued = (row.discontinued <> "0");

LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/northwind/categories.csv" AS row
CREATE (n:Category) SET n = row;

LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/northwind/suppliers.csv" AS row
CREATE (n:Supplier) SET n = row;


## LOADING Customer <- Order <- OrderDetail -> Product

LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/northwind/customers.csv" AS row
CREATE (n:Customer) SET n = row;

LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/northwind/orders.csv" AS row
CREATE (n:Order) SET n = row;

LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/northwind/order-details.csv" AS row
MATCH
  (p:Product), (o:Order)
WHERE
  p.productID = row.productID 
  AND o.orderID = row.orderID
CREATE 
  (o)-[details:ORDERS]->(p) 
  SET
    details = row, 
    details.quantity = toInteger(row.quantity);
```

- Create indices

```cypher
CREATE INDEX FOR (p:Product) ON (p.productID);
CREATE INDEX FOR (p:Product) ON (p.productName);
CREATE INDEX FOR (c:Category) ON (c.categoryID);
CREATE INDEX FOR (s:Supplier) ON (s.supplierID);

CREATE INDEX FOR (n:Customer) ON (n.customerID);
CREATE INDEX FOR (o:Order) ON (o.orderID);
```

- Create Relations

```cypher
MATCH (p:Product),(c:Category)
WHERE p.categoryID = c.categoryID
CREATE (p)-[:PART_OF]->(c);

MATCH (p:Product),(s:Supplier)
WHERE p.supplierID = s.supplierID
CREATE (s)-[:SUPPLIES]->(p);

MATCH (n:Customer),(o:Order)
WHERE n.customerID = o.customerID
CREATE (n)-[:PURCHASED]->(o);
```

- Queries

  - categories per supplier (just node navigation, skipping relation names)
```cypher
MATCH
  (s:Supplier)-->(:Product)-->(c:Category)
RETURN
  s.companyName as Company,
  collect(distinct c.categoryName) as Categories
```
  - suppliers have product with 'Produce' category
```cypher
MATCH 
  (c:Category {categoryName:"Produce"})<--(:Product)<--(s:Supplier)
RETURN 
  DISTINCT s.companyName as ProduceSuppliers;

MATCH
  (s:Supplier)-->(:Product)-->(c:Category {categoryName:"Produce"})
RETURN 
  DISTINCT s.companyName as ProduceSuppliers;
```
  - number of products for each customer
```cypher
MATCH
  (cust:Customer)-[:PURCHASED]->(:Order)-[o:ORDERS]->(p:Product),
  (p)-[:PART_OF]->(c:Category {categoryName:"Produce"})
RETURN DISTINCT cust.contactName as CustomerName, SUM(o.quantity) AS TotalProductsPurchased;

# OR #

MATCH
  (cust:Customer)-[:PURCHASED]->(:Order)-[o:ORDERS]->(p:Product)-[:PART_OF]->(c:Category {categoryName:"Produce"})
RETURN DISTINCT cust.contactName as CustomerName, SUM(o.quantity) AS TotalProductsPurchased;
```

