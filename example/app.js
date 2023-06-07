import Fais from "../src/fais.js";
import addRouteGroups from "../src/utils/route-groups.js";
import ejs from "ejs";
import welcomeRoute from "./routes/welcomeRoute.js";

const app = new Fais();
const PORT = 3000;

//add static folder
app.assetsFolderPath("/assets");

app.viewEngine({
  name: "ejs",
  engine: ejs,
  config: {},
});
addRouteGroups(app, [{ routes: welcomeRoute, prefix: "/welcome" }]);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} : http://localhost:${PORT}`);
});
