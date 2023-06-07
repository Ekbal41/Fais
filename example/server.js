import Fais from "../index.js";
import welcomeRoutes from "./src/route/root.js";

const app = new Fais();
const PORT = process.env.PORT || 8000;

// add static folder
app.assetsFolderPath("/public");

// add view engine, default is Nunjucks
// app.viewEngine({
//   name: "ejs",
//   engine: ejs,
//   config: {},
// });

// add route groups
app.addRouteGroups(app, [{ routes: welcomeRoutes, prefix: "" }]);

//listen to port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} : http://localhost:${PORT}`);
});
