let editandoId = null;

listar();

function mostrarMensagem(texto, tipo = "success") {
    document.getElementById("mensagem").innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

function novo() {
    editandoId = null;

    document.getElementById("txtid").value = "";
    document.getElementById("txtnome").value = "";
    document.getElementById("txttelefone").value = "";
    document.getElementById("txtemail").value = "";

    document.getElementById("formulario").style.display = "block";
    document.getElementById("txtnome").focus();
}

function cancelar() {
    document.getElementById("formulario").style.display = "none";
    document.getElementById("txtid").value = "";
    document.getElementById("txtnome").value = "";
    document.getElementById("txttelefone").value = "";
    document.getElementById("txtemail").value = "";
    editandoId = null;
}

async function listar() {
    document.getElementById("conteudo").innerHTML = `
        <div class="text-center py-4">Carregando dados...</div>
    `;

    try {
        const resp = await fetch("/pessoa");
        const dados = await resp.json();

        let tabela = `
            <div class="table-responsive">
                <table class="table table-striped table-hover align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Email</th>
                            <th class="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        for (let i = 0; i < dados.length; i++) {
            tabela += `
                <tr>
                    <td>${dados[i].idpessoa}</td>
                    <td>${dados[i].nome ?? ""}</td>
                    <td>${dados[i].telefone === "undefined" ? "" : (dados[i].telefone ?? "")}</td>
                    <td>${dados[i].email === "undefined" ? "" : (dados[i].email ?? "")}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-warning me-2" onclick="editar(${dados[i].idpessoa})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="excluir(${dados[i].idpessoa}, '${(dados[i].nome ?? "").replace(/'/g, "\\'")}')">Excluir</button>
                    </td>
                </tr>
            `;
        }

        tabela += `
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById("conteudo").innerHTML = tabela;
    } catch (erro) {
        console.error(erro);
        document.getElementById("conteudo").innerHTML = `
            <div class="alert alert-danger">Erro ao carregar os dados.</div>
        `;
    }
}

async function salvar() {
    const nome = document.getElementById("txtnome").value.trim();
    const telefone = document.getElementById("txttelefone").value.trim();
    const email = document.getElementById("txtemail").value.trim();

    if (nome === "" || telefone === "" || email === "") {
        mostrarMensagem("Preencha nome, telefone e email.", "warning");
        return;
    }

    const dados = { nome, telefone, email };

    try {
        let resp;

        if (editandoId === null) {
            resp = await fetch("/pessoa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            if (!resp.ok) {
                throw new Error("Erro ao cadastrar");
            }

            mostrarMensagem("Pessoa cadastrada com sucesso.", "success");
        } else {
            resp = await fetch(`/pessoa/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });

            if (!resp.ok) {
                throw new Error("Erro ao alterar");
            }

            mostrarMensagem("Pessoa alterada com sucesso.", "success");
        }

        cancelar();
        listar();
    } catch (erro) {
        console.error(erro);
        mostrarMensagem("Ocorreu um erro ao salvar os dados.", "danger");
    }
}

async function editar(id) {
    try {
        const resp = await fetch(`/pessoa/${id}`);

        if (!resp.ok) {
            throw new Error("Erro ao buscar pessoa");
        }

        const pessoa = await resp.json();

        editandoId = id;
        document.getElementById("txtid").value = pessoa.idpessoa;
        document.getElementById("txtnome").value = pessoa.nome ?? "";
        document.getElementById("txttelefone").value = pessoa.telefone ?? "";
        document.getElementById("txtemail").value = pessoa.email ?? "";

        document.getElementById("formulario").style.display = "block";
        document.getElementById("txtnome").focus();
    } catch (erro) {
        console.error(erro);
        mostrarMensagem("Não foi possível carregar os dados para edição.", "danger");
    }
}

async function excluir(id, nome) {
    const confirmou = confirm(`Deseja realmente excluir a pessoa "${nome}"?`);

    if (!confirmou) {
        return;
    }

    try {
        const resp = await fetch(`/pessoa/${id}`, {
            method: "DELETE"
        });

        if (!resp.ok) {
            throw new Error("Erro ao excluir");
        }

        mostrarMensagem("Pessoa excluída com sucesso.", "success");
        listar();
    } catch (erro) {
        console.error(erro);
        mostrarMensagem("Não foi possível excluir a pessoa.", "danger");
    }
}