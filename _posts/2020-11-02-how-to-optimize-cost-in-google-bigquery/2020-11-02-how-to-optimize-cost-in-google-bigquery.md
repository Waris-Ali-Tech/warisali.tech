---
date: 2020-11-02
title: 'How to Optimize Cost in Google BigQuery?'
template: post
slug: how-to-optimize-cost-in-google-bigquery
categories:
  - Popular
  - Guide
tags:
  - google
  - bigquery
  - guide
---

# Introduction

When it comes to big data and analytics, Google's BigQuery is one of the state of the art technologies. You can analyze petabytes in a matter of seconds at a very low cost. But if not used carefully, its cost can grow very quickly.

So, in this article, I will show some methods to reduce its cost. 

# Table of Contents

- [Optimize Cost in Google BigQuery](#optimize-cost-in-google-bigquery)
    - [How cost is calculated?](#how-cost-is-calculated)
      - [Storage](#storage)
      - [Insertion](#insertion)
      - [Querying](#querying)
    - [How to reduce cost?](#how-to-reduce-cost)
      - [Insertion](#insertion)
      - [Query and Storage](#query-and-storage)
        - [Partitioning](#partitioning)
          - [Limitations of Partitioning](#limitations-of-partitioning)
        - [Clustering](#clustering)
          - [Limitations of Clustering](#limitations-of-clustering)
        
# Optimize Cost in Google BigQuery

There are three common vectors in which you can save cost in Google BigQuery.

- Storage
- Insertion
- Querying

But first, let see how does cost is calculated in Google's Big Query.

## How cost is calculated?
### Storage

There are two types of data storage in BigQuery.

**Active Storage**
Any data stored in table or partition that have been modified in the last 90 days will be charged according to the Active Storage prices
  

**Long-term Storage**
Any data stored in table or partition that have not been modified in the last 90 days will be cost according to the Long-term Storage pricing which is almost half of the Active Storage prices

As of now, the First 10 GBs of storage are free per month after that Active Storage costs about $0.020 per GB and Long-term Storage costs about $0.010 per GB.  For the latest pricing of Google's BigQuery, refer to this [link](https://cloud.google.com/bigquery/pricing#pricing_summary).

### Insertion

Loading data from Cloud Storage or local files is free. But you have to wait for the load job to complete to query the data or apply any operations on it.  Otherwise, if you want to do real-time analysis, you can stream data that will be available within a few seconds of the first insertion. Streamed data is charged at $0.010 per 200 MB. For current insertion pricing,  refer to this [link](https://cloud.google.com/bigquery/pricing#streaming_pricing).

### Querying

There are two ways in which querying can be charged

**On-Demand Method** In which you are charged according to the amount of data being processed or you can view the amount of data a query will process in BigQuery's Web UI.  Currently, the first 1 TB is free after that $5 is charged per 1 TB. For the latest pricing, refer to this [link](https://cloud.google.com/bigquery/pricing#on_demand_pricing).

**Flat-Rate Method** In which you buy slots which are like virtual CPUs on which your queries run. Each query is split into multiple steps and each step is run into a slot. If the number of steps of the query being run exceeds your slots quota, excess steps are queued. So your queries may run a little slower but your bill will be more predictable.

## How to reduce cost?

### Insertion
If you don't need to do real-time analysis on your data, you can use a batch job to load data into BigQuery. which is free, but you have to wait for the job to complete for the data to become available. In ruby, you can create a load job as following.

```ruby
require "google/cloud/bigquery"

bigquery = Google::Cloud::Bigquery.new
dataset = bigquery.dataset "my_dataset"
table = dataset.table "my_table"

file = File.open("/path/to/file.csv")
load_job = table.load file, format: "csv"

load_job.wait_until_done!
load_job.done?
```

### Query and Storage
To reduce query and storage costs, you can apply partitioning and clustering on the table.

#### Partitioning
A partitioned table is a special table that is divided into segments. It helps to improve the performance of queries and reduce costs by reducing the number of bytes read by a query. 

You also save on storage cost because you are only charged for the size of partitions that are modified in the last 90 days. If a partition is not modified in the last 90 days it is automatically moved to _Long Term Storage_ which costs about half of the _Active Storage_

There are three ways in which a table can be partitioned:

1. **Ingestion Time Based** Table is partitioned on the arrival time of data
2. **Timestamp Based** Table is partitioned on the time column 
3. **Integer Based** Table is partitioned on the value of integer type column

For details on how to create a partitioned table, refer to this [link](https://cloud.google.com/bigquery/docs/partitioned-tables).

**Note:** You cannot partition an existing table, partitioning can only be applied at table creation time, so if you already have a table, you create a replica table with partitioning enabled using the following query and start using it.

```sql
CREATE TABLE
    `my_project.my_dataset.my_table_partitioned`
PARTITION BY
	date_column AS
SELECT
  *
FROM
	`my_project.my_dataset.my_table`
```

Refer to this [doc](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-definition-language#partition_expression) to partition table in other above-mentioned ways.

##### Limitations of Partitioning
Partitioned tables in BigQuery are subject to the following limitations:

- You can only partition on one column
- Table can have only 4000 partitions
- Isolate the partition column when expressing a filter in a column. Complex queries that required multiple stages to resolve the predicate or compare the partition column with a non-partitioned column may not prune the partitions.

#### Clustering

In a clustered table, data is automatically sorted on clustered fields. So, when you query data that filters/aggregates on the clustered fields, the specified columns are used to collocate the related data
so, it helps to eliminate scans unnecessary data and reduce cost and improve the performance of the query.

**Note:** If you specify multiple columns, order the of columns determines the sort order of the data, so your queries need to filter in that order too to get the benefit of the clustering.

Just like partitioning, you cannot apply clustering on an existing table, but you can apply it on partitioned and un-partitioned tables. 

To create a clustered table, you can use following query:

```sql
CREATE TABLE
	`my_project.my_dataset.my_table_clustered`
CLUSTER BY
  col_1,
  col_2,
  col_3,
  col_4
AS
SELECT
  *
FROM
	`my_project.my_dataset.my_table`
```

Or you can create partitioned and clustered table as: 

```sql
CREATE TABLE
	`my_project.my_dataset.my_table_partitioned_clustered`
PARTITION BY
	date_column
CLUSTER BY
  col_1,
  col_2,
  col_3,
  col_4
AS
SELECT
  *
FROM
	`my_project.my_dataset.my_table`
```


##### Limitations of Clustering
Clustered tables in BigQuery are subject to the following limitations:

- Only standard SQL is supported for querying clustered tables and for writing query results to clustered tables.
- You can only specify clustering columns when a table is created.
- After a clustered table is created, you cannot modify the clustering columns.
- You can specify up to four clustering columns.
- When using STRING type columns for clustering, BigQuery uses only the first 1,024 characters to cluster the data. The values in the columns can themselves be longer than 1,024.
- The columns you specify are used to colocating related data. When you cluster a table using multiple columns, the order of columns you specify is important. The order of the specified columns determines the sort order of the data.
- To optimize performance when you run queries against clustered tables, use an expression that filters on a clustered column or on multiple clustered columns in the order the clustered columns are specified.
- Clustering columns must be top-level, non-repeated columns of one of the following types:

```sql
DATE
BOOL
GEOGRAPHY
INT64
NUMERIC
STRING
TIMESTAMP
```

So that was all. If you know some other methods to optimize Google's Big Query cost, do let us know in the comments.

