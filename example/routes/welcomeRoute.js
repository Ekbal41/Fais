const welcomeRoute = [
  {
    method: "get",
    path: "/",
    handler: (req, res) => {
      res.send("hello");
    },
  },
  {
    method: "get",
    path: "/home",
    handler: (req, res) => {
      res.send("hola");
    },
  },
];

export default welcomeRoute;
