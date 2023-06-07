<p align="center">
  <img src="https://github.com/Ekbal41/Fais/assets/103681582/bc94b727-4929-4fcd-99ca-c0d600ef942e" alt="Fais Logo"/>
</p>

[![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?color=blue&style=flat-square)](http://opensource.org/licenses/MIT)

## Table of Contents

- [About](#about)
- [Install](#install)
- [Features](#features)
- [Create an app](#create-an-app)
- [Templating engine](#templating-engine)
- [Assets](#assets)

## About

This is a minimalistic Web framework for Node.js. It helps you create RESTful APIs.

## Install

```bash
npm install fais
```
## Install Via Fais-cli

```bash
npm install -g fais-cli
```
You can quickly generate a Fais project via `fais-cl`. After generating the project,

```bash
cd your-project
npm install
npm run dev
```

Development server will start in `http://localhost:8000/` . Now you can start with `src` dir for further development.

## Features

- Create routes supporting `get`, `post`, `put`, `delete` http verbs:

  ```javascript
  app.get("<path>", (req, res) => {});
  app.post("<path>", (req, res) => {});
  app.put("<path>", (req, res) => {});
  app.delete("<path>", (req, res) => {});
  ```

- Reads posted body to either Text or JSON. Use method `bodyParse(method)` to change how the body is parsed. Valid input values `json` or `text`.
- Has middleware that you can run before handling the actual request.

  ```javascript
  app.get("/protected-route", (req, res, next) => {
    if (req.headers["authorization"] === "admin") {
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
  app.get("/home/:id/:name", (req, res) => {
    console.log(req.params); // /home/200/papar returns {id : 200, name : papar}
  });
  ```

  **Query parameters**

  ```javascript
  app.get("/home?name=lofar&&age=23", (req, res) => {
    console.log(req.query); // returns { name: "lofar", age: "23"}
  });
  ```

## Assets

- Default asstes folder is "/puplic" , You can change it.

```javascript
app.asstes("/your-assets-folder-name");
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
const PORT = 3000

// ROUTE PARAMETERS
app.get("/home/:id", (req, res) => {
  console.log("query params", req.query);
  console.log('req.params', req.params);
  res.send("product id");
});

app.get('/home', (req, res) => {
  console.log('query params', req.query)
  res.send('text');
})

// POST
app.post('/home', (req,res) => {
  console.info('body', req.body)
  res.json(req.body);
})

// PUT
app.put('/home', (req,res) => {
  console.info('body', req.body)
  res.json(req.body);
})

// MIDDLEWARE
app.get('/orders', (req, res, next) => {
  if (req.headers['authorization'] === 'Staff') {
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} : http://localhost:${PORT}`);
});
```
