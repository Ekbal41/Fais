import {
  jsonWelcome,
  jsonWelcomeWithParamsAndQuery,
  welcomePage,
} from "../controller/root.js";

const welcomeRoutes = [
  {
    method: "get",
    path: "/",
    handler: welcomePage,
  },
  {
    method: "get",
    path: "/json",
    handler: jsonWelcome,
  },
  {
    method: "get",
    path: "/json/:id/test/:name",
    handler: jsonWelcomeWithParamsAndQuery,
  },
];
export default welcomeRoutes;
