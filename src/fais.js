import http from "http";
import urlParser from "./url-parser.js";
import queryParser from "./query-parser.js";
import nunjucks from "nunjucks";
import { join } from "path";
import { createReadStream } from "fs";

class Fais {
  /**
   * Creates an instance of the Fais web framework.
   */
  constructor() {
    /**
     * The route table for storing registered routes.
     * @type {Object}
     */
    this.routeTable = {};

    /**
     * The request body parsing method ("json" or "urlencoded").
     * @type {string}
     */
    this.parseMethod = "json";

    /**
     * The folder path for serving static assets.
     * @type {string}
     */
    this.assetsFolder = "/public";

    /**
     * The HTTP server instance.
     * @type {http.Server}
     */
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  /**
   * Handles incoming HTTP requests.
   * @param {http.IncomingMessage} req - The HTTP request object.
   * @param {http.ServerResponse} res - The HTTP response object.
   */
  async handleRequest(req, res) {
    const routes = Object.keys(this.routeTable);
    let match = false;

    let __dirname = process.cwd();
    if (req.url.startsWith(this.assetsFolder)) {
      const filePath = join(__dirname, req.url);
      const stream = createReadStream(filePath);
      stream.pipe(res);
      return;
    }

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const parsedRoute = urlParser(route);
      const path = req.url;
      const regex = new RegExp(`^${parsedRoute}(\\?.*)?$`);
      const optionallyMatched = regex.test(path);

      if (
        optionallyMatched &&
        this.routeTable[route][req.method.toLowerCase()]
      ) {
        let callback = this.routeTable[route][req.method.toLowerCase()];
        let middleware =
          this.routeTable[route][`${req.method.toLowerCase()}-middleware`];
        const m = req.url.match(new RegExp(parsedRoute));

        req.params = m.groups;
        req.query = queryParser(req.url);

        let body = await this.readBody(req);
        if (this.parseMethod === "json") {
          body = body ? JSON.parse(body) : {};
        }
        req.body = body;

        const result = await this.processMiddleware(
          middleware,
          req,
          this.createResponse(res)
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
  }

  /**
   * Reads the request body.
   * @param {http.IncomingMessage} req - The HTTP request object.
   * @returns {Promise<string>} - A promise that resolves to the request body.
   */
  readBody(req) {
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

  /**
   * Processes the middleware stack.
   * @param {Function} middleware - The middleware function.
   * @param {http.IncomingMessage} req - The HTTP request object.
   * @param {http.ServerResponse} res - The HTTP response object.
   * @returns {Promise<boolean>} - A promise that resolves to true if the middleware chain is successfully processed.
   */
  processMiddleware(middleware, req, res) {
    if (!middleware) {
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      middleware(req, res, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Creates a custom response object with utility methods.
   * @param {http.ServerResponse} res - The HTTP response object.
   * @returns {http.ServerResponse} - The enhanced HTTP response object.
   */
  createResponse(res) {
    res.send = (message) => res.end(message);
    res.json = (data) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    };
    res.render = (template, data) => {
      res.setHeader("Content-Type", "text/html");
      res.end(nunjucks.render(template, data));
    };

    return res;
  }

  /**
   * Registers a GET route.
   * @param {string} path - The path of the route.
   * @param {Function} callback - The callback function to execute when the route is matched.
   * @param {Function} middleware - The middleware function to apply to the route (optional).
   */
  get(path, ...rest) {
    if (rest.length === 1) {
      this.registerPath(path, rest[0], "get");
    } else {
      this.registerPath(path, rest[1], "get", rest[0]);
    }
  }

  /**
   * Registers a POST route.
   * @param {string} path - The path of the route.
   * @param {Function} callback - The callback function to execute when the route is matched.
   * @param {Function} middleware - The middleware function to apply to the route (optional).
   */
  post(path, ...rest) {
    if (rest.length === 1) {
      this.registerPath(path, rest[0], "post");
    } else {
      this.registerPath(path, rest[1], "post", rest[0]);
    }
  }

  /**
   * Registers a PUT route.
   * @param {string} path - The path of the route.
   * @param {Function} callback - The callback function to execute when the route is matched.
   * @param {Function} middleware - The middleware function to apply to the route (optional).
   */
  put(path, ...rest) {
    if (rest.length === 1) {
      this.registerPath(path, rest[0], "put");
    } else {
      this.registerPath(path, rest[1], "put", rest[0]);
    }
  }

  /**
   * Registers a DELETE route.
   * @param {string} path - The path of the route.
   * @param {Function} callback - The callback function to execute when the route is matched.
   * @param {Function} middleware - The middleware function to apply to the route (optional).
   */
  delete(path, ...rest) {
    if (rest.length === 1) {
      this.registerPath(path, rest[0], "delete");
    } else {
      this.registerPath(path, rest[1], "delete", rest[0]);
    }
  }

  /**
   * Registers a route with the specified callback, method, and optional middleware.
   * @param {string} path - The path of the route.
   * @param {Function} callback - The callback function to execute when the route is matched.
   * @param {string} method - The HTTP method of the route.
   * @param {Function} middleware - The middleware function to apply to the route (optional).
   */
  registerPath(path, callback, method, middleware) {
    if (!this.routeTable[path]) {
      this.routeTable[path] = {};
    }

    this.routeTable[path] = {
      ...this.routeTable[path],
      [method]: callback,
      [`${method}-middleware`]: middleware,
    };
  }

  /**
   * Sets the folder path for serving static assets.
   * @param {string} folder - The folder path for serving static assets.
   */
  assets(folder) {
    this.assetsFolder = folder;
  }

  /**
   * Sets the request body parsing method.
   * @param {string} method - The request body parsing method ("json" or "urlencoded").
   */
  bodyParser(method) {
    this.parseMethod = method;
  }

  /**
   * Starts the HTTP server and listens on the specified port.
   * @param {number} port - The port number to listen on.
   * @param {Function} callback - The callback function to execute when the server starts listening.
   */
  listen(port, callback) {
    this.server.listen(port, callback);
  }
}

export default Fais;
