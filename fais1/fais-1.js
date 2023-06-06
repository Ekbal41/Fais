import http from "http";
import urlParser from "./url-parser-1.js";
import queryParser from "./query-parser-1.js";
import nunjucks from "nunjucks";
import { join } from "path";
import { createReadStream } from "fs";

let server;
let assetsFolder = "/public";

function createResponse(res) {
  res.send = (message) => res.end(message);
  res.json = (data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  //render html file with nunjuncks
  res.render = (template, data) => {
    res.setHeader("Content-Type", "text/html");
    res.end(nunjucks.render(template, data));
  };

  return res;
}

function processMiddleware(middleware, req, res) {
  if (!middleware) {
    return new Promise((resolve) => resolve(true));
  }

  return new Promise((resolve) => {
    middleware(req, res, function () {
      resolve(true);
    });
  });
}

/**
 * This is the main class of the Fais framework
 * @class Fais
 * @returns {Object}
 * Methods for http verbs and listen to a given port.<br/>
 * Supported http verbs are get, post, put and  delete.
 */
function Fais() {
  let routeTable = {};
  let parseMethod = "json";
  let domainUrl;

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

    let __dirname = process.cwd();
    // Serve static files from the "/public" folder
    if (req.url.startsWith("/public")) {
      const filePath = join(__dirname, req.url);
      const stream = createReadStream(filePath);
      stream.pipe(res);
      return;
    }

    for (var i = 0; i < routes.length; i++) {
      const route = routes[i];
      const parsedRoute = urlParser(route);
      const path = req.url;
      const regex = new RegExp(`^${parsedRoute}$`);
      const optionalyMatched = regex.test(path);
      if (optionalyMatched && routeTable[route][req.method.toLowerCase()]) {
        let callback = routeTable[route][req.method.toLowerCase()];
        let middleware =
          routeTable[route][`${req.method.toLowerCase()}-middleware`];
        const m = req.url.match(new RegExp(parsedRoute));

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
      res.end(`${req.url} Route Not found`);
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
    assets: (folder) => {
      assetsFolder = folder;
    },

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

export default Fais;
