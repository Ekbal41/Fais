export const welcomePage = (req, res) => {
    res.render("./src/views/welcome.html", {
      title: "FaisJS",
      message: "Welcome to Fais Framework",
    });
  };
  
  export const jsonWelcome = (req, res) => {
    res.json({
      title: "FaisJS",
      message: "Welcome to Fais Framework",
    });
  };
  
  export const jsonWelcomeWithParamsAndQuery = (req, res) => {
    res.json({
      title: "FaisJS",
      message: "Welcome to Fais Framework",
      params: req.params,
      query: req.query,
    });
  };
  