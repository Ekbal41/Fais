import nunjucks from "nunjucks";

function setViewEngine(viewEngine, res) {
  if (viewEngine.engine === "nunjucks") {
    // Handle Nunjucks engine
    if (viewEngine.config) {
      nunjucks.configure(viewEngine.config);
    }
    res.render = (view, context) => {
      res.setHeader("Content-Type", "text/html");
      res.end(nunjucks.render(view, context));
    };
  } else if (viewEngine.name === "ejs") {
    // Handle EJS engine
    let ejsEngine = viewEngine.engine;
    let ejsOptions;
    if (!ejsEngine) {
      throw new Error("EJS templating engine is missing.");
    }
    if (viewEngine.config) {
      ejsOptions = viewEngine.config;
    }
    res.render = (view, context) => {
      res.setHeader("Content-Type", "text/html");
      ejsEngine.renderFile(view, context, ejsOptions, (err, html) => {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send("Internal Server Error while rendering ejs.");
        } else {
          res.end(html);
        }
      });
    };
  } else {
    throw new Error(`Unsupported templating engine: ${viewEngine.engine}`);
  }
}

export default setViewEngine;
