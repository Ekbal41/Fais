import Fais from "../src/fais.js";

const app = new Fais();
const PORT = 3000;

app.assets("/assets"); // Set the default "assets" folder

const logger = (req, res, next) => {
  console.log("Request received");
  next();
}; // Custom middleware

app.get("/", logger, (req, res) => {
  res.render("./index.html", {
    title: "Fais Demo Website",
    message: "Welcome to Fais Framework",
  });
});


app.get("/home", logger, (req, res) => {
  res.json({
    name: "asif ekbal",
    age: 23,
    role: "admin",
  });
});
app.get(
  "/home/:id/:slug",
  (req, res, next) => {
    console.log(req.params);
    next();
  },
  (req, res) => {
    res.send(
      req.params.id +
        " " +
        req.params.slug +
        " " +
        req.query.n +
        " " +
        req.query.a
    );
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} : http://localhost:${PORT}`);
});
