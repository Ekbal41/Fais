import http from "http";
import urlParser from "./url-parser.js";
import queryParser from "./query-parser.js";
import setViewEngine from "./view-engins.js";
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
     * The route groups for storing registered routes.
     * @type {Array}
     */
    this.routeGroups = [];

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
     * The templating engine to use.
     * @type {string}
     */
    this.templatingEngine = {
      name: "nunjucks",
      engine: "nunjucks",
      config: {
        autoescape: true,
        throwOnUndefined: false,
        trimBlocks: false,
      },
    };

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
    setViewEngine(this.templatingEngine, res);
    return res;
  }

  /**
   * Registers a GET route.
   * @param {string} path - The path of the route.
   * @param {Function} callback - The callback function to execute when the route is matched.
   * @param {Function} middleware - The middleware function to apply to the route (optional).
   * @example
   * // Registering a GET route
   * app.get("/", (req, res) => {
   *   res.send("Hello, world!");
   * });
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
   * @example
   * // Registering a POST route
   * app.post("/users", (req, res) => {
   *   // Handle creating a new user
   * });
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
   * @example
   * // Registering a PUT route
   * app.put("/users/:id", (req, res) => {
   *   // Handle updating a user
   * });
   */
  put(path, ...rest) {
    if (rest.length === 1) {
      this.registerPath(path, rest[0], "put");
    } else {
      this.registerPath(path, rest[1], "put", rest[0]);
    }
  }

  /**
   * Registers a UPDATE route.
   * @param {string} path - The path of the route.
   * @param {Function} callback - The callback function to execute when the route is matched.
   * @param {Function} middleware - The middleware function to apply to the route (optional).
   * @example
   * // Registering a UPDATE route
   * app.put("/users/:id", (req, res) => {
   *   // Handle updating a user
   * });
   */
  update(path, ...rest) {
    if (rest.length === 1) {
      this.registerPath(path, rest[0], "update");
    } else {
      this.registerPath(path, rest[1], "update", rest[0]);
    }
  }

  /**
   * Registers a DELETE route.
   * @param {string} path - The path of the route.
   * @param {Function} callback - The callback function to execute when the route is matched.
   * @param {Function} middleware - The middleware function to apply to the route (optional).
   * @example
   * // Registering a DELETE route
   * app.delete("/users/:id", (req, res) => {
   *   // Handle deleting a user
   * });
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
   * @param {string} folderPath - The folder path for serving static assets.
   * @example
   * // Setting the assets folder path
   * app.assetsFolderPath("/public");
   */
  assetsFolderPath(folder) {
    if (folder) {
      this.assetsFolderPath = folder;
    }
  }

  /**
   * Sets the templating engine to use.
   * @param {Object} engine - The templating engine configuration.
   * @param {string} engine.name - The name of the templating engine.
   * @param {string} engine.engine - The engine module name.
   * @param {Object} engine.config - The configuration options for the templating engine.
   * @example
   * // Setting the templating engine to "ejs"
   * app.viewEngine({
   *   name: "ejs",
   *   engine: ejs,
   *   config: {}
   * });
   */
  viewEngine(obj) {
    if (obj) {
      this.templatingEngine = {
        name: obj.name,
        engine: obj.engine,
        config: obj.config,
      };
    }
  }

  /**
   * Sets the request body parsing method.
   * @param {string} method - The request body parsing method ("json" or "urlencoded").
   * @example
   * // Setting the request body parsing method to "json"
   * app.bodyParser("json");
   */
  bodyParser(method) {
    this.parseMethod = method;
  }

  /**
   * Starts the HTTP server and listens on the specified port.
   * @param {number} port - The port to listen on.
   * @param {Function} callback - The callback function to execute when the server starts listening.
   * @example
   * // Starting the server
   * app.listen(3000, () => {
   *   console.log("Server started on port 3000");
   * });
   */
  listen(port, callback) {
    this.server.listen(port, callback);
  }
}

export default Fais;
