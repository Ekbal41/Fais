import Fais from "./src/fais.js";

const app = new Fais();

app.get("/pro", (req, res) => {
  console.log("query params", req.query);
  res.send("text welcome");
});

app.listen(3000, () => {
  console.log("Server running on 3000");
});
