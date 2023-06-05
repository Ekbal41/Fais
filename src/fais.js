import http from "http";
import urlParser from "./url-parser.js";
import queryParser from "./query-parser.js";


let server;

function createResponse(res) {
  res.send = (message) => res.end(message);
  res.json = (data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  return res;
}

function processMiddleware(middleware, req, res) {
  if (!middleware) {
    // resolve false
    return new Promise((resolve) => resolve(true));
  }

  return new Promise((resolve) => {
    middleware(req, res, function () {
      resolve(true);
    });
  });
}

export default function Fais() {
  let routeTable = {};
  let parseMethod = "json"; // json, plain text

  function readBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += "" + chunk;
      });
      req.on("end", () => {
        resolve(body);
      });
      req.on("error", (err) => {
        reject(err);
      });
    });
  }

  server = http.createServer(async (req, res) => {
    const routes = Object.keys(routeTable);
    let match = false;
    for (var i = 0; i < routes.length; i++) {
      const route = routes[i];
      const parsedRoute = urlParser(route);
      if (
        new RegExp(parsedRoute).test(req.url) &&
        routeTable[route][req.method.toLowerCase()]
      ) {
        let callback = routeTable[route][req.method.toLowerCase()];
        let middleware =
          routeTable[route][`${req.method.toLowerCase()}-middleware`];
        // console.log("regex", parsedRoute);
        const m = req.url.match(new RegExp(parsedRoute));
        // console.log("params", m.groups);

        req.params = m.groups;
        req.query = queryParser(req.url);

        let body = await readBody(req);
        if (parseMethod === "json") {
          body = body ? JSON.urlParser(body) : {};
        }
        req.body = body;

        const result = await processMiddleware(
          middleware,
          req,
          createResponse(res)
        );
        if (result) {
          callback(req, res);
        }

        match = true;
        break;
      }
    }
    if (!match) {
      res.statusCode = 404;
      res.end("Not found");
    }
  });

  function registerPath(path, callback, method, middleware) {
    if (!routeTable[path]) {
      routeTable[path] = {};
    }
    routeTable[path] = {
      ...routeTable[path],
      [method]: callback,
      [method + "-middleware"]: middleware,
    };
  }

  return {
    get: (path, ...rest) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "get");
      } else {
        registerPath(path, rest[1], "get", rest[0]);
      }
    },
    post: (path, ...rest) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "post");
      } else {
        registerPath(path, rest[1], "post", rest[0]);
      }
    },
    put: (path, ...rest) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "put");
      } else {
        registerPath(path, rest[1], "put", rest[0]);
      }
    },
    delete: (path, ...rest) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "delete");
      } else {
        registerPath(path, rest[1], "delete", rest[0]);
      }
    },
    bodyParse: (method) => (parseMethod = method),
    listen: (port, callback) => {
      server.listen(port, callback);
    },
    _server: server,
  };
}
