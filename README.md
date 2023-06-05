[![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?color=blue&style=flat-square)](http://opensource.org/licenses/MIT)

## Table of Contents

- [About](#about)
- [Install](#install)
- [Features](#features)
- [Create an app](#create-an-app)
- [Templating engine](#templating-engine)

## About

This is a minimalistic Web framework for Node.js. It helps you create RESTful APIs.

## Install

```bash
npm install fais
```

## Features

- Create routes supporting GET, POST, PUT, DELETE HTTP Verbs:

  ```javascript
  app.get("<path>", (req, res) => {});
  app.post("<path>", (req, res) => {});
  app.put("<path>", (req, res) => {});
  app.delete("<path>", (req, res) => {});
  ```

- Reads posted body to either Text or JSON. Use method `bodyParse(method)` to change how the body is parsed. Valid input values `json` or `text`.
- Has middleware that you can run before handling the actual request. Can be used for Authentication for example.

  ```javascript
  app.get("/products", (req, res, next) => {
    if (req.headers["authorization"] === "blabla") {
      next();
    } else {
      res.statusCode = 401;
      res.send("Route Not allowed");
    }
  });
  ```

- To Handles route parameters and query parameters:

  **Router parameters**

  ```javascript
  app.get("/products/:id", (req, res) => {
    console.log(req.params); // for route /products/1 { id: "1" }
  });
  ```

  **Query parameters**

  ```javascript
  app.get("/products/", (req, res) => {
    console.log(req.query); // for route /products?page=1&pageSize=20 { page: "1", pageSize: "20"}
  });
  ```

## Templating engine

- In default Fais uses Nunjucks as its templating engine

```javascript
app.get("/", (req, res) => {
  res.render("./example/index.html", {
    title: "Fais Demo Website",
    message: "Welcome to Fais Framework",
  });
});
```

## Create an app

```javascript
import Fais from fais

const app = Fais();

// ROUTE PARAMETERS
app.get("/products/:id", (req, res) => {
  console.log("query params", req.query);
  console.log('req.params', req.params);
  res.send("product id");
});

app.get('/products', (req, res) => {
  console.log('query params', req.query)
  res.send('text');
})

// POST
app.post('/products', (req,res) => {
  console.info('body', req.body)
  res.json(req.body);
})

// PUT
app.put('/products', (req,res) => {
  console.info('body', req.body)
  res.json(req.body);
})

// MIDDLEWARE
app.get('/orders', (req, res, next) => {
  if (req.headers['authorization'] === 'blabla') {
    console.log('next', next)
    next()
  } else {
    res.statusCode = 401;
    res.send('Not allowed')
  }
}, (req, res) => {
  res.send('Protected route');
})

// Starts listening to requests
app.listen(3000, () => {
  console.log('Server running on 3000');
})
```
