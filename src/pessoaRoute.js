const PessoaController = require("./pessoaController");

module.exports = (app) => {
    app.get("/pessoa", PessoaController.get);
    app.get("/pessoa/:id", PessoaController.getById);
    app.post("/pessoa", PessoaController.post);
    app.put("/pessoa/:id", PessoaController.put);
    app.delete("/pessoa/:id", PessoaController.delete);
};