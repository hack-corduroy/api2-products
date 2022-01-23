# Technical Design Document
**Atalier back end API**

## Requirements Overview
1. Create an API that conforms to the existing API spec (see appendix)
2. Create a database that will house the data served by the API
3. Implement unit tests and integration tests to cover your working service.
4. No loss of uptime when cutting over from legacy API to new service
5. All DB queries should execute in <50ms
6. Implement logging for service


## Database

We consider two database implementations: Postgres and Mongo.  We **strongly recommend Postgres**.  Mongo has benefits - it matches the shape of our product data and would be marginally faster to stand up.  However, the performance, stability and scalability benefits we will see from a more traditional database such as Postres far outweigh these considerations.  Postgres is shown to be [4-15 times](https://www.enterprisedb.com/news/new-benchmarks-show-postgres-dominating-mongodb-varied-workloads) faster than Monogo across a variety of scenarios.  We want to build a database and architecture that can scale as the Atalier product reaches well over 1b users and 10s of billions of skus. 

| **Relational (Postgres)**                                                                                                                                                       | **NoSQL (Mongo)**                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| - Scalability<br>- Speed<br>- Time to implement<br>- Horizontal scaling e.g. adding new skus                                                                                    | - Speed<br>- Scalability<br>- Faster to implement<br>- Better Horizontal scaling<br>- Logical match with the shape of our product data (nested)                                 |
| ![](https://lh5.googleusercontent.com/oNH754vW6rE9iv6updZdzfxG8kaRecCNEY8EZ1lZShKdGQTkIKtUx0jxzGyZvtKh0HSTonkUr7uQfkm2bpTQLKNM3o9VGVTrCu01YjgAhitQQayBZx3l63Ot3IOamvCwwN8OX92P) | ![](https://lh3.googleusercontent.com/6BzRaEjTjIbQxWgepg3fTq4T3nZwDoM16Pv7M8c1um_LH_U_bB33aCiCbexWvbvorehHLj4ZKy1EyHdv1SgpBsZSnBAlgpRZGYoFnxehcToJwdHI2biZZyh8iNdzOfNVL83zoBYv) |





## Speed Testing

The table below shows the pre-optimized vs post optimized run times of the main queries in our application.  The big change was adding foreign keys and indexes, but I also cleaned up the joins and to make them a little more efficient.  

|                                                                                                                                                                                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![](https://lh5.googleusercontent.com/dvnNSCCHWpj1PaFs6_4k2oGJnMvKdbgZRkoP_ZaiJ7vFwFyUKa2sGlKNbPAIWYIXkh7b3agHrImO3kv5vXQrxRH9OjUSILBpR60dLYfhVAZPB3ZKwe2kLxC93LR1NGCTutxeY5u2) | **Pre:**<br><br>- Data was imported with a primary key (no foreign keys) only<br>- joining data with ill-thought-out joins<br><br>**Post:**<br><br>- Added foreign keys<br>- added ordered b-tree indexes to primary keys<br>- added b-tree indexes to foreign keys e.g. product_id in styles table<br>- used explain analyze to optimize queries<br>- made use of WITH syntax to create a table storing product ids<br>- scrapped LIMIT/OFFSET and use index based lookup for products<br>- Moved giant out joins to a subquery. |



## Optimizing Queries

Used pgbench to time a run of 1000 queries.  A standard web session of our app would make 7 different requests to our database.


- Get all Products
- Get the product information for the main product
- Get the related product array
- 3 x Get the product information for a single related product
- Get the product styles for the main product

Wanted to optimize the queries to see how high I could get the TPS.  The file `pgbenchmarks.sql` contains the main queries that would be run during a single web session.  Each transaction is a complete run through the 7 queries.


    # runs 1 client, 1000 requests
    pgbench -d products -c 1 -t 1000 -f test/speedtests/pgbenchmarks.sql

After several runs - by far, the biggest boost in speed was changing the following 2 lines


    SELECT * FROM products ORDER BY id OFFSET X LIMIT 10 -- speed = 12TPS
    SELECT * FROM products WHERE id > X ORDER BY id LIMIT 10 -- speed = 175.291690TPS

😍 Apparently OFFSET **sucks** especially when its run towards the end of the data.  Since index is the primary key this makes it run in basically 1ms.  Since we imported the data from CSV and the id field is not generated automatically I ran a query to validate — the ID is always the same as the row number.  So id > 10000 is functionally equivalent to OFFSET 10000.

## Fastify vs Express

Simulated a user page load with 7 API calls.  The clear winner here is Fastify which is a purpose built node based server designed for API calls.  As the load gets higher the difference between Fastify and Express is even greater.  The implementation also has some nice benefits like async await out of the box.

**UPDATE**: EC2 and Fastify are not playing nicely, so… back to express

| Fastify                                                                                                                               | Express                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 100 Requests per second (700 API calls / sec)                                                                                         | 100 Requests per second (700 API calls / sec)                                                                                         |
| ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642099367761_image.png) | ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642099753020_image.png) |
| 250 Requests per second (1750 API calls / sec)                                                                                        | 250 Requests per second (1750 API calls / sec)                                                                                        |
| ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642099648991_image.png) | ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642099854617_image.png) |
| 500 Requests per second (3500 API calls / sec)                                                                                        | 500 Requests per second (3500 API calls / sec)                                                                                        |
| ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642100146545_image.png) | ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642100278709_image.png) |

## Caching

With 1750 requests per minute (250 x 7 API calls) the EC2 starts to have some issues.  You can see the median response time is quite bad (~5s) and nearly 25% of users get some sort of error.

To solve this problem - we are going to implement a caching layer.

- Initially when a request is made to the db… we’re going to save the result in memory
- If the same request comes in, we’re going to return it straight from memory (without incurring a db query).
- We need to do some tweaking on the size of the cache (we obviously can’t store every single value in memory).  What is the optimal tradeoff with size of memory vs speed.

**RESULT:** Huge win for caching.  Not quite as noticable in the first run, since it was caching a lot of the data for the first time, but still a nice 25% speed increase (28ms → 21ms) at the median and an even more substantial % at the p95 and p99.

When we upped the number of requests to 250/s, a rate that previously caused the server to fall over.  It now runs flawlessly (0% error rate).  The median response time isn’t amazing since we’re beginning to hit the limit of our poor micro EC2 box, but we still see an incredibly large increase in 

| Pre-Cached Metrics                                                                                                                    |                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 100 Request (700/min) to remote EC2                                                                                                   | 100 Request (700/min) to remote EC2                                                                                                   |
| ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642107433542_image.png) | ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642110666184_image.png) |
| 250 Requests (1750) to remote EC2 Server                                                                                              | 250 Requests (1750) to remote EC2 Server                                                                                              |
| ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642106245231_image.png) | ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642110762530_image.png) |
| Only Products Endpoint                                                                                                                | Cached                                                                                                                                |
| ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642110052835_image.png) | ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642110162757_image.png) |

## Building the Cacher

In order to speed up the process of serving requests we created a Cache class.  The Cache is instantiated with a max items (default 1000).  Every request back from the database is inserted into the cache at its respective endpoint.  e.g. cache.data.products[’37311’] would contain the results returned from the query to the /products/37311 endpoint.

The max size is enforced by limiting the number of cached items.  If the max is 1000 and the server caches the 1001st item, it clears the first item added and then adds.

**Future optimization** it  would be interesting to re-write the caching layer so that it tracks frequency and boots the least-frequently used item if it needs to clear space in the cache.


    class Cache {
      constructor(maxItems = 1000) {
    ...
    add(query, id, data) {
        if (this.data\[query\][id] !== undefined) {
          return;
        }
        if (this.ids[query].length === this.max) {
          let temp = this.ids[query].pop();
          delete this.data\[query\][temp];
        }
        this.ids[query].unshift(id);
        this.data\[query\][id] = data;
      }
      get(query, id) {
        return this.data\[query\][id] || null;
      }


## Load Testing

Used Artillery from one EC2 to test the throughput and response time from another EC2 running the API.  The following script simulates hitting 7 endpoints per user session.  The server was able to handle 500 users / sec, though the session length isn’t great.  When you bump to 1000 per second some users end up not getting served data.  

One of the nice benefits of caching is that once the server gets to the point where its only serving cached data, the server doesn’t fall over, it just slows down when you hit it with a lot of requests.

|                                                                                                                                       |                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642178200095_image.png) | 500 users / sec * 7 requests per user<br><br>![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642178180659_image.png)<br><br><br>1000 users / sec * 7 requests per user<br><br>![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642178486224_image.png) |
|                                                                                                                                       |                                                                                                                                                                                                                                                                                                                                                                                   |

| Regular (no container)                                                                                                                | NGINX + Containers                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642722532163_image.png) | ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642722673963_image.png) |
| ![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642722603404_image.png) |                                                                                                                                       |
|                                                                                                                                       |                                                                                                                                       |
|                                                                                                                                       |                                                                                                                                       |

## **NGINX + Docker = ??Speed**


## **Appendix**


| Endpoint                      | Parameters    | Description                                                       | Response                                                                                                                                                                        |
| ----------------------------- | ------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| /products                     | {page, count} | Retrieves the list of products.                                   | ![](https://lh6.googleusercontent.com/BG7k0mSXALromeWKH2teo9R2usvGJ88OBbQdEqNEjLCbw7HxlDjkmt5-nmSDCX1GUdBjKCpQ6JW3Kst9QcPXvGohx74433rEx7LBFFZHl02U5f4emUUflP0TZ1leoLCxMDwbn6xG) |
| /products/:id                 | n/a           | Returns all product level information for a specified product id. | ![](https://lh3.googleusercontent.com/rU3Wa8IN_dhq3fZs9TdD4R8ACEYhMH8wtOQMwF7ZAY_ik-rJm0emw6Iul3u3wH086pntt3aCiFz3kR47q95l_J0v_vMZF7my3j6vd0RbOUy3-5_mRFBt39KlcKyvJ9hdAWCQ0Iak) |
| /products/:product_id/styles  | n/a           | Returns the all styles available for the given product.           | ![](https://lh6.googleusercontent.com/7jR2xvlZU7JIovXgwpeWSOolXtKd8FMERxNbVMOXxeuI7ox3QvxRSSboBYqwjLWaj-PWkYJ3sohgqh3wN5oFFyZ3Zkt5UfiCFB4f5O-FiI4C1XAZBRBi7uYREuvveBTnYM7Vaew_) |
| /products/:product_id/related | n/a           | Returns the id's of products related to the product specified.    | ![](https://lh3.googleusercontent.com/wF2Yp1yBcV_sjYFsDbvh9jAHtYmosNX1-Um8Y_jXpslKSEmI_PpwudHWrsbq_-Pp4tczXo-ZudjrQnN3IQFIHELL34x0MnOT5-VYpJxzOTkmkvh4jWt5QadLnq48CtLDuctlb43r) |



# Final Conversation


## PR (actually a commit) 


https://github.com/hack-corduroy/api2-products/commit/f5573dce96e611f9729910ad3de1b7d37e79f3bf

    I spent a lot of time learning new query techniques for this one and I think it ended up in a cool and pretty efficient place.


## Architecture
- 3 ECs - 1 NGINX server connected to 2 identical boxes that each have 3 containers - 2xAPIs and 1 Postgres.
- Caching happens using NGINX config
- This setup can handle >10,000 requests per second (though most of the free online load testers don’t do a good job mixing up the inputs e.g. its always queries the same <1000 Ids which very quickly get cached.
![](https://paper-attachments.dropbox.com/s_3FACB917727F4CB52C54036094B16F3D16B2FA6024274CC154207B713DCCD1E1_1642972636747_image.png)

## Technical Challenges

**The input CSVs were large and had data inconsistencies which created a situation where it was (a) time consuming and (b) led to missing data when they were imported during ETL**

Actions


1. Used built in file + readline libraries to read files line by line and output a sanitized, standardized version of the csv
2. Created CSV parsing functionality
3. Created smart logic to parse numbers.. e.g. if cleanse program encounters a numeric field with text in it - it will discard the text and greedily try to parse the first number it sees.
4. Copied sanitized .tsv files into database to avoid commas in string
5. Used PG_DUMP to create a compressed SQL file that could be used for creating docker images.  This was easier than having to run the entire ETL process all over again

Results


1. Entire ETL runs in about 5 minutes
2. Compressed SQL files are only about 500mb (~1/12) of the original size which speeds up the uploads to the EC2s and docker by 12x.


**After getting queries to run in <20ms each, the next challenge was load testing.  Our simulated tests were showing that at about 800-1000 requests per second our database would fall over.**

Actions

1. Created a custom caching layer (eventually removed this logic and moved the caching to nginx, but it was cool to build a home cooked one).
2. Caching layer was a separate class where a client could specify a max number of items to cache
3. The cache was implemented as a simple queue.  If the client needed to insert an additional item into the cache past the max, the last item in the queue is deleted and the new data is cached.
4. Was pretty pleased with how elegant the solution was!

Result

1. After implementing caching, the database ceased being a bottleneck (load testers not great at mimicking real life functionality, but it was cool).
2. When every request is cached and you stop needing to query the db at all, was able to get up to about 5-6000 requests per second.  Up from about 800-1000 when every request hit the db.


**Horizontally Scaling our Servers.  Problem: the individual servers are still a bottleneck, can we do better than 5-6000 RPS?**

Actions

1. Attempted to refactor Express into a new server called fastly which claims to be *even faster* than running the bare node http requests.  We had some promising results locally - it was serving requests about 20% faster (going from 5000 requests before dying —> 6000 requests before dying) and the ms response time for cached requests was going from (~7ms → 5ms).  But for some weird reason our EC2 environment didn’t like fastly.  Would try using this inside a container in the future, but didn’t know about containers yet…
2. Containerization.  Moved to the architecture shown above with NGINX doing caching + load balancing and running 4 API servers and 2 DBs.

Results

1. The architecture above was able to consistently achieve >10,000 requests per second.

