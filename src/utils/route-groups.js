/**
 * Registers route groups with a specified prefix.
 * @param {object} app - The application instance.
 * @param {Array} routeGroups - An array of route group objects.
 * @example
 * const routeGroups = [
 *   {
 *     routes: [
 *       { method: "get", path: "/", handler: (req, res) => { res.send("Welcome to root") } },
 *       { method: "get", path: "/home", handler: (req, res) => { res.send("Welcome to home")} }
 *     ],
 *     prefix: "/welcome"
 *   },
 * ];
 * routeGroups(app, routeGroups);
 */
function addRouteGroups(app, routeGroups) {
  for (const group of routeGroups) {
    const { routes, prefix } = group;

    for (const { method, path, handler } of routes) {
      const updatedPath = `${prefix}${path}`.replace(/\/$/, "");
      app[method](updatedPath, handler);
    }
  }
}

export default addRouteGroups;
