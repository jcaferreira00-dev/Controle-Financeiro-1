// =====================================================
// CONTROLE FINANCEIRO 2.0 (REBUILD)
// PARTE 1/4
// =====================================================

// ===========================
// BANCO DE DADOs
// ===========================

let banco = JSON.parse(localStorage.getItem("financeiro"));

if (!banco) {

    banco = {
        receitas: [],
        vale: [],
        pagamento: [],
        historico: []
    };

}

// ===========================
// SALVAR
// ===========================

function salvarBanco() {
    localStorage.setItem("financeiro", JSON.stringify(banco));
}

// ===========================
// DATA ATUAL
// ===========================

const hoje = new Date();

let mesAtual = localStorage.getItem("mesAtual");
let anoAtual = localStorage.getItem("anoAtual");

if (!mesAtual) mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");
if (!anoAtual) anoAtual = String(hoje.getFullYear());

// ===========================
// INICIALIZAÇÃO
// ===========================

window.onload = function () {

    let mes = document.getElementById("mesSelecionado");
    let ano = document.getElementById("anoSelecionado");

    if (mes) mes.value = mesAtual;
    if (ano) ano.value = anoAtual;

    atualizar();

};

// ===========================
// TROCAR MÊS
// ===========================

function trocarMes() {

    mesAtual = document.getElementById("mesSelecionado").value;
    anoAtual = document.getElementById("anoSelecionado").value;

    localStorage.setItem("mesAtual", mesAtual);
    localStorage.setItem("anoAtual", anoAtual);

    atualizar();
}

// ===========================
// GERAR ID
// ===========================

function novoID() {
    return Date.now() + Math.floor(Math.random() * 9999);
}

// ===========================
// FORMATAÇÃO MOEDA
// ===========================

function moeda(v) {
    return v.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// =====================================================
// PARTE 2/4
// LANCAMENTOS
// =====================================================

// ===========================
// RECEITAS
// ===========================

function adicionarReceita() {

    let descricao =
        document.getElementById("descricaoReceita").value.trim();

    let valor =
        parseFloat(document.getElementById("valorReceita").value);

    if (!descricao || isNaN(valor)) return;

    banco.receitas.push({
        id: novoID(),
        descricao,
        valor,
        mes: mesAtual,
        ano: anoAtual,
        data: new Date().toLocaleDateString("pt-BR")
    });

    document.getElementById("descricaoReceita").value = "";
    document.getElementById("valorReceita").value = "";

    salvarBanco();
    atualizar();
}

// ===========================
// VALE
// ===========================

function adicionarVale() {

    let descricao =
        document.getElementById("descricaoVale").value.trim();

    let valor =
        parseFloat(document.getElementById("valorVale").value);

    if (!descricao || isNaN(valor)) return;

    banco.vale.push({
        id: novoID(),
        descricao,
        valor,
        pago: false,
        fixa: false,
        mes: mesAtual,
        ano: anoAtual,
        data: new Date().toLocaleDateString("pt-BR")
    });

    document.getElementById("descricaoVale").value = "";
    document.getElementById("valorVale").value = "";

    salvarBanco();
    atualizar();
}

// ===========================
// PAGAMENTO
// ===========================

function adicionarPagamento() {

    let descricao =
        document.getElementById("descricaoPagamento").value.trim();

    let valor =
        parseFloat(document.getElementById("valorPagamento").value);

    if (!descricao || isNaN(valor)) return;

    banco.pagamento.push({
        id: novoID(),
        descricao,
        valor,
        pago: false,
        fixa: false,
        mes: mesAtual,
        ano: anoAtual,
        data: new Date().toLocaleDateString("pt-BR")
    });

    document.getElementById("descricaoPagamento").value = "";
    document.getElementById("valorPagamento").value = "";

    salvarBanco();
    atualizar();
}

// =====================================================
// PARTE 3/4
// FILTRO + SALDO + RENDER
// =====================================================

// ===========================
// FILTRAR POR MÊS
// ===========================

function receitasMes() {
    return banco.receitas.filter(r =>
        r.mes == mesAtual && r.ano == anoAtual
    );
}

function valeMes() {
    return banco.vale.filter(v =>
        v.mes == mesAtual && v.ano == anoAtual
    );
}

function pagamentoMes() {
    return banco.pagamento.filter(p =>
        p.mes == mesAtual && p.ano == anoAtual
    );
}

// ===========================
// ATUALIZAR TUDO
// ===========================

function atualizar() {

    let receitas = receitasMes();
    let vales = valeMes();
    let pagamentos = pagamentoMes();

    let totalReceitas = receitas.reduce((a, b) => a + b.valor, 0);
    let totalVale = vales.reduce((a, b) => a + b.valor, 0);
    let totalPagamento = pagamentos.reduce((a, b) => a + b.valor, 0);

    let saldo = totalReceitas - totalVale - totalPagamento;

const saldoTela = document.getElementById("saldoAtual");
const saldoResumo = document.getElementById("saldoResumo");

saldoTela.innerText = moeda(saldo);
saldoResumo.innerText = moeda(saldo);

// MUDA A COR DO SALDO
if (saldo < 0) {
    saldoTela.style.color = "#ff4d4d";
    saldoResumo.style.color = "#d32f2f";
} else {
    saldoTela.style.color = "";
    saldoResumo.style.color = "";
}

document.getElementById("resReceitas").innerText = moeda(totalReceitas);
document.getElementById("resVale").innerText = moeda(totalVale);
document.getElementById("resPagamento").innerText = moeda(totalPagamento);

    renderReceitas(receitas);
    renderVale(vales);
    renderPagamento(pagamentos);
    renderHistorico();
}

// ===========================
// RENDER RECEITAS
// ===========================

function renderReceitas(lista) {

    let html = "";

    lista.forEach(item => {

        html += `
<li>
<div class="itemInfo">
<div class="itemTitulo">${item.descricao}</div>
<div class="itemValor">${moeda(item.valor)}</div>
</div>

<div class="itemBotoes">
<button class="btnExcluir" onclick="removerReceita(${item.id})">Excluir</button>
</div>
</li>`;
    });

    document.getElementById("listaReceitas").innerHTML = html;
}

// ===========================
// RENDER VALE
// ===========================

function renderVale(lista) {

    let html = "";

    lista.forEach(item => {

        html += `
<li class="${item.pago ? "pago" : "naoPago"}">

<div class="itemInfo">
<div class="itemTitulo">${item.descricao}</div>
<div class="itemValor">${moeda(item.valor)}</div>
</div>

<div class="itemBotoes">

<button class="${item.pago ? "btnPago" : "btnPagar"}"
onclick="toggleVale(${item.id})">
${item.pago ? "Pago" : "Pagar"}
</button>

<button
class="${item.fixa ? "btnFixa" : "btnNormal"}"
onclick="toggleFixaVale(${item.id})">
${item.fixa ? "📌" : "📍"}
</button>

<button class="btnExcluir"
onclick="removerVale(${item.id})">
Excluir
</button>

</div>

</li>`;
    });

    document.getElementById("listaVale").innerHTML = html;
}

// ===========================
// RENDER PAGAMENTO
// ===========================

function renderPagamento(lista) {

    let html = "";

    lista.forEach(item => {

        html += `
<li class="${item.pago ? "pago" : "naoPago"}">

<div class="itemInfo">
<div class="itemTitulo">${item.descricao}</div>
<div class="itemValor">${moeda(item.valor)}</div>
</div>

<div class="itemBotoes">

<button class="${item.pago ? "btnPago" : "btnPagar"}"
onclick="togglePagamento(${item.id})">
${item.pago ? "Pago" : "Pagar"}
</button>

<button
class="${item.fixa ? "btnFixa" : "btnNormal"}"
onclick="toggleFixaPagamento(${item.id})">
${item.fixa ? "📌" : "📍"}
</button>

<button class="btnExcluir"
onclick="removerPagamento(${item.id})">
Excluir
</button>

</div>

</li>`;
    });

    document.getElementById("listaPagamento").innerHTML = html;
}

// =====================================================
// PARTE 4/4
// FINALIZAÇÃO DO SISTEMA
// =====================================================

// ===========================
// REMOVER
// ===========================

function removerReceita(id) {

    if (!confirm("Excluir esta receita?")) return;

    banco.receitas =
        banco.receitas.filter(r => r.id != id);

    salvarBanco();
    atualizar();
}

function removerVale(id) {

    if (!confirm("Excluir este vale?")) return;

    banco.vale =
        banco.vale.filter(v => v.id != id);

    salvarBanco();
    atualizar();
}

function removerPagamento(id) {

    if (!confirm("Excluir este pagamento?")) return;

    banco.pagamento =
        banco.pagamento.filter(p => p.id != id);

    salvarBanco();
    atualizar();
}

// ===========================
// TOGGLE VALE (PAGO / NÃO PAGO)
// ===========================

function toggleVale(id) {

    let item = banco.vale.find(v => v.id == id);

    if (!item) return;

    item.pago = !item.pago;

    salvarBanco();
    atualizar();
}

// ===========================
// TOGGLE PAGAMENTO (PAGO / NÃO PAGO)
// ===========================

function togglePagamento(id) {

    let item = banco.pagamento.find(p => p.id == id);

    if (!item) return;

    item.pago = !item.pago;

    salvarBanco();
    atualizar();
}

// ===========================
// TOGGLE CONTA FIXA (VALE)
// ===========================

function toggleFixaVale(id){

    let item = banco.vale.find(v => v.id == id);

    if(!item) return;

    let novoEstado = !item.fixa;

    banco.vale
        .filter(v => v.descricao === item.descricao)
        .forEach(v => v.fixa = novoEstado);

    salvarBanco();
    atualizar();

}

// ===========================
// TOGGLE CONTA FIXA (PAGAMENTO)
// ===========================

function toggleFixaPagamento(id){

    let item = banco.pagamento.find(p => p.id == id);

    if(!item) return;

    let novoEstado = !item.fixa;

    banco.pagamento
        .filter(p => p.descricao === item.descricao)
        .forEach(p => p.fixa = novoEstado);

    salvarBanco();
    atualizar();

}

// ===========================
// HISTÓRICO MENSAL
// ===========================

function renderHistorico() {

    let html = "";

    banco.historico.forEach(h => {

        html += `
<li>
${h}
</li>`;
    });

    document.getElementById("historico").innerHTML = html;
}

// ===========================
// FECHAR MÊS
// ===========================

function fecharMes() {

    let receitas = receitasMes();
    let vales = valeMes();
    let pagamentos = pagamentoMes();

    let totalReceitas = receitas.reduce((a, b) => a + b.valor, 0);
    let totalVale = vales.reduce((a, b) => a + b.valor, 0);
    let totalPagamento = pagamentos.reduce((a, b) => a + b.valor, 0);

    let saldo = totalReceitas - totalVale - totalPagamento;

    let texto = `
📅 ${mesAtual}/${anoAtual}
Receitas: ${moeda(totalReceitas)}
Vale: ${moeda(totalVale)}
Pagamentos: ${moeda(totalPagamento)}
Saldo: ${moeda(saldo)}
--------------------------
`;

    banco.historico.unshift(texto);

    salvarBanco();
    
if (!confirm("Todas as contas deste mês foram pagas?")) {
    // Você pode decidir apenas continuar ou fazer alguma ação.
}

// Avança para o próximo mês
mesAtual = Number(mesAtual);

if (mesAtual === 12) {
    mesAtual = "01";
    anoAtual = String(Number(anoAtual) + 1);
} else {
    mesAtual = String(mesAtual + 1).padStart(2, "0");
}

// Salva o novo mês
localStorage.setItem("mesAtual", mesAtual);
localStorage.setItem("anoAtual", anoAtual);
// ===========================
// RECRIAR CONTAS FIXAS
// ===========================

// VALES FIXOS
banco.vale
    .filter(v => v.fixa)
    .forEach(v => {

        let existe = banco.vale.some(x =>
            x.descricao === v.descricao &&
            x.mes === mesAtual &&
            x.ano === anoAtual
        );

        if (!existe) {

            banco.vale.push({
                id: novoID(),
                descricao: v.descricao,
                valor: v.valor,
                pago: false,
                fixa: true,
                mes: mesAtual,
                ano: anoAtual,
                data: new Date().toLocaleDateString("pt-BR")
            });

        }

    });


// PAGAMENTOS FIXOS
banco.pagamento
    .filter(p => p.fixa)
    .forEach(p => {

        let existe = banco.pagamento.some(x =>
            x.descricao === p.descricao &&
            x.mes === mesAtual &&
            x.ano === anoAtual
        );

        if (!existe) {

            banco.pagamento.push({
                id: novoID(),
                descricao: p.descricao,
                valor: p.valor,
                pago: false,
                fixa: true,
                mes: mesAtual,
                ano: anoAtual,
                data: new Date().toLocaleDateString("pt-BR")
            });

        }

    });
// Atualiza os selects da tela
document.getElementById("mesSelecionado").value = mesAtual;
document.getElementById("anoSelecionado").value = anoAtual;

salvarBanco();
    atualizar();
}

// ===========================
// BACKUP
// ===========================

function exportarBackup() {

    let data = JSON.stringify(banco);

    let blob = new Blob([data], { type: "application/json" });

    let agora = new Date();

    let nomeArquivo =
        `backup-financeiro-${agora.getFullYear()}-` +
        `${String(agora.getMonth() + 1).padStart(2, "0")}-` +
        `${String(agora.getDate()).padStart(2, "0")}_` +
        `${String(agora.getHours()).padStart(2, "0")}-` +
        `${String(agora.getMinutes()).padStart(2, "0")}-` +
        `${String(agora.getSeconds()).padStart(2, "0")}.json`;

    let a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = nomeArquivo;

    a.click();

}
// ===========================
// IMPORTAR BACKUP
// ===========================

function importarBackup() {

    document.getElementById("arquivoBackup").click();

    document.getElementById("arquivoBackup").onchange = function (e) {

        let file = e.target.files[0];

        let reader = new FileReader();

        reader.onload = function (event) {

            banco = JSON.parse(event.target.result);

            salvarBanco();
            atualizar();
        };

        reader.readAsText(file);
    };

}
// ===========================
// LIMPAR TODOS OS DADOS
// ===========================

function limparTudo() {

    if (!confirm(
        "Será feito um backup automático antes da exclusão.\n\nDeseja continuar?"
    )) return;

    // Faz backup automaticamente
    exportarBackup();

    if (!confirm(
        "Backup realizado.\n\nAgora deseja apagar TODOS os dados?"
    )) return;

    banco = {
        receitas: [],
        vale: [],
        pagamento: [],
        historico: []
    };

    const hoje = new Date();

    mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");
    anoAtual = String(hoje.getFullYear());

    localStorage.setItem("mesAtual", mesAtual);
    localStorage.setItem("anoAtual", anoAtual);

    salvarBanco();

    atualizar();

    alert("Todos os dados foram apagados com sucesso.");

}
