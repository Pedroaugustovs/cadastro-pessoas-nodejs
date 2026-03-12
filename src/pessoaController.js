async function connect() {
    if (global.connection && global.connection.state !== "disconnected") {
        return global.connection;
    }

    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection({
        host: "54.91.193.137",
        user: "libertas",
        password: "123456",
        database: "libertas5per"
    });

    console.log("Conectou no MySQL!");
    global.connection = connection;
    return connection;
}

exports.get = async (req, res) => {
    try {
        const conn = await connect();
        const [rows] = await conn.query(
            "SELECT idpessoa, nome, telefone, email FROM pessoa ORDER BY nome"
        );
        res.status(200).send(rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).send({ resultado: false, mensagem: "Erro ao buscar pessoas." });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).send({ resultado: false, mensagem: "ID inválido." });
        }

        const conn = await connect();
        const [rows] = await conn.query(
            "SELECT idpessoa, nome, telefone, email FROM pessoa WHERE idpessoa = ?",
            [id]
        );

        if (rows.length > 0) {
            res.status(200).send(rows[0]);
        } else {
            res.status(404).send({ resultado: false, mensagem: "Pessoa não encontrada." });
        }
    } catch (erro) {
        console.error(erro);
        res.status(500).send({ resultado: false, mensagem: "Erro ao buscar pessoa." });
    }
};

exports.post = async (req, res) => {
    try {
        const { nome, telefone, email } = req.body;

        const conn = await connect();
        await conn.query(
            "INSERT INTO pessoa (nome, telefone, email) VALUES (?, ?, ?)",
            [nome, telefone, email]
        );

        res.status(201).send({ resultado: true, mensagem: "Pessoa cadastrada com sucesso." });
    } catch (erro) {
        console.error(erro);
        res.status(500).send({ resultado: false, mensagem: "Erro ao cadastrar pessoa." });
    }
};

exports.put = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nome, telefone, email } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).send({ resultado: false, mensagem: "ID inválido." });
        }

        const conn = await connect();
        const [resultado] = await conn.query(
            "UPDATE pessoa SET nome = ?, telefone = ?, email = ? WHERE idpessoa = ?",
            [nome, telefone, email, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).send({ resultado: false, mensagem: "Pessoa não encontrada." });
        }

        res.status(200).send({ resultado: true, mensagem: "Pessoa alterada com sucesso." });
    } catch (erro) {
        console.error(erro);
        res.status(500).send({ resultado: false, mensagem: "Erro ao alterar pessoa." });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).send({ resultado: false, mensagem: "ID inválido." });
        }

        const conn = await connect();
        const [resultado] = await conn.query(
            "DELETE FROM pessoa WHERE idpessoa = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).send({ resultado: false, mensagem: "Pessoa não encontrada." });
        }

        res.status(200).send({ resultado: true, mensagem: "Pessoa excluída com sucesso." });
    } catch (erro) {
        console.error(erro);
        res.status(500).send({ resultado: false, mensagem: "Erro ao excluir pessoa." });
    }
};