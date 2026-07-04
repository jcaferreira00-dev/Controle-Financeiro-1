// =====================================================
// CONTROLE FINANCEIRO — MINHAS CONTAS
// =====================================================

// ===========================
// BANCO DE DADOS
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

const NOMES_MES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

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
// TROCAR MÊS (selects)
// ===========================

function trocarMes() {

    mesAtual = document.getElementById("mesSelecionado").value;
    anoAtual = document.getElementById("anoSelecionado").value;

    salvarPeriodo();
    atualizar();
}

// ===========================
// TROCAR MÊS (setas)
// ===========================

function mesAnterior() {

    let m = Number(mesAtual);
    let a = Number(anoAtual);

    if (m === 1) {
        m = 12;
        a -= 1;
    } else {
        m -= 1;
    }

    mesAtual = String(m).padStart(2, "0");
    anoAtual = String(a);

    sincronizarSelects();
    salvarPeriodo();
    atualizar();
}

function proximoMes() {

    let m = Number(mesAtual);
    let a = Number(anoAtual);

    if (m === 12) {
        m = 1;
        a += 1;
    } else {
        m += 1;
    }

    mesAtual = String(m).padStart(2, "0");
    anoAtual = String(a);

    sincronizarSelects();
    salvarPeriodo();
    atualizar();
}

function sincronizarSelects() {
    let mes = document.getElementById("mesSelecionado");
    let ano = document.getElementById("anoSelecionado");

    if (mes) mes.value = mesAtual;

    if (ano) {
        let existe = Array.from(ano.options).some(o => o.value === anoAtual);
        if (existe) ano.value = anoAtual;
    }
}

function salvarPeriodo() {
    localStorage.setItem("mesAtual", mesAtual);
    localStorage.setItem("anoAtual", anoAtual);
}

// ===========================
// UTILITÁRIOS
// ===========================

function novoID() {
    return Date.now() + Math.floor(Math.random() * 9999);
}

function moeda(v) {
    return v.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// =====================================================
// LANÇAMENTOS
// =====================================================

function adicionarReceita() {

    let descricao = document.getElementById("descricaoReceita").value.trim();
    let valor = parseFloat(document.getElementById("valorReceita").value);

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

function adicionarVale() {

    let descricao = document.getElementById("descricaoVale").value.trim();
    let valor = parseFloat(document.getElementById("valorVale").value);

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

function adicionarPagamento() {

    let descricao = document.getElementById("descricaoPagamento").value.trim();
    let valor = parseFloat(document.getElementById("valorPagamento").value);

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
// FILTRO POR MÊS
// =====================================================

function receitasMes() {
    return banco.receitas.filter(r => r.mes == mesAtual && r.ano == anoAtual);
}

function valeMes() {
    return banco.vale.filter(v => v.mes == mesAtual && v.ano == anoAtual);
}

function pagamentoMes() {
    return banco.pagamento.filter(p => p.mes == mesAtual && p.ano == anoAtual);
}

// =====================================================
// ATUALIZAR TUDO
// =====================================================

function atualizar() {

    let receitas = receitasMes();
    let vales = valeMes();
    let pagamentos = pagamentoMes();

    let totalReceitas = receitas.reduce((a, b) => a + b.valor, 0);
    let totalVale = vales.reduce((a, b) => a + b.valor, 0);
    let totalPagamento = pagamentos.reduce((a, b) => a + b.valor, 0);

    let saldo = totalReceitas - totalVale - totalPagamento;

    // Cabeçalho
    document.getElementById("labelMes").innerText = NOMES_MES[Number(mesAtual) - 1];
    document.getElementById("saldoAtual").innerText = moeda(saldo);
    document.getElementById("saldoResumo").innerText = moeda(saldo);

    const saldoCard = document.getElementById("saldoCard");
    if (saldo < 0) {
        saldoCard.classList.remove("saldoPositivo");
        saldoCard.classList.add("saldoNegativo");
    } else {
        saldoCard.classList.remove("saldoNegativo");
        saldoCard.classList.add("saldoPositivo");
    }

    // Totais nos cards
    document.getElementById("resReceitas").innerText = moeda(totalReceitas);
    document.getElementById("resVale").innerText = moeda(totalVale);
    document.getElementById("resPagamento").innerText = moeda(totalPagamento);

    // Totais no resumo
    document.getElementById("resumoReceitas").innerText = moeda(totalReceitas);
    document.getElementById("resumoVale").innerText = moeda(totalVale);
    document.getElementById("resumoPagamento").innerText = moeda(totalPagamento);

    renderReceitas(receitas);
    renderVale(vales);
    renderPagamento(pagamentos);
    renderHistorico();
}

// ===========================
// EMPTY STATE
// ===========================

function alternarVazio(idLista, idVazio, lista) {
    document.getElementById(idVazio).style.display = lista.length === 0 ? "block" : "none";
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
    <button class="btnExcluir" title="Excluir" onclick="removerReceita(${item.id})">❌</button>
  </div>
</li>`;
    });

    document.getElementById("listaReceitas").innerHTML = html;
    alternarVazio("listaReceitas", "vazioReceitas", lista);
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
      title="${item.pago ? "Pago" : "Pagar"}"
      onclick="toggleVale(${item.id})">${item.pago ? "✅" : "💸"}</button>
    <button class="${item.fixa ? "btnFixa" : "btnNormal"}"
      title="${item.fixa ? "Conta fixa" : "Marcar como fixa"}"
      onclick="toggleFixaVale(${item.id})">${item.fixa ? "📌" : "📍"}</button>
    <button class="btnExcluir" title="Excluir" onclick="removerVale(${item.id})">❌</button>
  </div>
</li>`;
    });

    document.getElementById("listaVale").innerHTML = html;
    alternarVazio("listaVale", "vazioVale", lista);
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
      title="${item.pago ? "Pago" : "Pagar"}"
      onclick="togglePagamento(${item.id})">${item.pago ? "✅" : "💸"}</button>
    <button class="${item.fixa ? "btnFixa" : "btnNormal"}"
      title="${item.fixa ? "Conta fixa" : "Marcar como fixa"}"
      onclick="toggleFixaPagamento(${item.id})">${item.fixa ? "📌" : "📍"}</button>
    <button class="btnExcluir" title="Excluir" onclick="removerPagamento(${item.id})">❌</button>
  </div>
</li>`;
    });

    document.getElementById("listaPagamento").innerHTML = html;
    alternarVazio("listaPagamento", "vazioPagamento", lista);
}

// =====================================================
// REMOVER
// =====================================================

function removerReceita(id) {
    if (!confirm("Excluir esta receita?")) return;
    banco.receitas = banco.receitas.filter(r => r.id != id);
    salvarBanco();
    atualizar();
}

function removerVale(id) {
    if (!confirm("Excluir este vale?")) return;
    banco.vale = banco.vale.filter(v => v.id != id);
    salvarBanco();
    atualizar();
}

function removerPagamento(id) {
    if (!confirm("Excluir este pagamento?")) return;
    banco.pagamento = banco.pagamento.filter(p => p.id != id);
    salvarBanco();
    atualizar();
}

// =====================================================
// TOGGLE PAGO
// =====================================================

function toggleVale(id) {
    let item = banco.vale.find(v => v.id == id);
    if (!item) return;

    let mensagem = item.pago
        ? "Desmarcar esta conta como paga?"
        : "Confirmar pagamento desta conta?";

    if (!confirm(mensagem)) return;

    item.pago = !item.pago;
    salvarBanco();
    atualizar();
}

function togglePagamento(id) {
    let item = banco.pagamento.find(p => p.id == id);
    if (!item) return;

    let mensagem = item.pago
        ? "Desmarcar esta conta como paga?"
        : "Confirmar pagamento desta conta?";

    if (!confirm(mensagem)) return;

    item.pago = !item.pago;
    salvarBanco();
    atualizar();
}

// =====================================================
// TOGGLE CONTA FIXA
// =====================================================

function toggleFixaVale(id) {
    let item = banco.vale.find(v => v.id == id);
    if (!item) return;

    let novoEstado = !item.fixa;

    banco.vale
        .filter(v => v.descricao === item.descricao)
        .forEach(v => v.fixa = novoEstado);

    salvarBanco();
    atualizar();
}

function toggleFixaPagamento(id) {
    let item = banco.pagamento.find(p => p.id == id);
    if (!item) return;

    let novoEstado = !item.fixa;

    banco.pagamento
        .filter(p => p.descricao === item.descricao)
        .forEach(p => p.fixa = novoEstado);

    salvarBanco();
    atualizar();
}

// =====================================================
// HISTÓRICO
// =====================================================

function renderHistorico() {

    let html = "";

    banco.historico.forEach(h => {

        // Compatibilidade com histórico antigo (texto simples)
        if (typeof h === "string") {
            html += `<li class="historicoTexto">${h}</li>`;
            return;
        }

        let ALTURA_MAX = 90;
        let max = Math.max(h.receitas, h.vale, h.pagamento, 1);
        let altReceitas = h.receitas > 0 ? Math.max(Math.round((h.receitas / max) * ALTURA_MAX), 6) : 0;
        let altVale = h.vale > 0 ? Math.max(Math.round((h.vale / max) * ALTURA_MAX), 6) : 0;
        let altPagamento = h.pagamento > 0 ? Math.max(Math.round((h.pagamento / max) * ALTURA_MAX), 6) : 0;

        let ok = h.saldo >= 0;

        html += `
<li>
  <div class="historicoTopo">
    <span class="historicoData">📅 ${NOMES_MES[Number(h.mes) - 1]}/${h.ano}</span>
    <span class="historicoResultado ${ok ? "ok" : "alerta"}">
      ${ok ? "✅ Deu pra pagar" : "⚠️ Faltou dinheiro"}
    </span>
  </div>

  <div class="grafico">
    <div class="barraColuna">
      <span class="barraValorV">${moeda(h.receitas)}</span>
      <div class="barraTrilhoV"><div class="barraPreenchidaV barraReceita" style="height:${altReceitas}px"></div></div>
      <span class="barraLabelV">Receitas</span>
    </div>
    <div class="barraColuna">
      <span class="barraValorV">${moeda(h.vale)}</span>
      <div class="barraTrilhoV"><div class="barraPreenchidaV barraVale" style="height:${altVale}px"></div></div>
      <span class="barraLabelV">Vale</span>
    </div>
    <div class="barraColuna">
      <span class="barraValorV">${moeda(h.pagamento)}</span>
      <div class="barraTrilhoV"><div class="barraPreenchidaV barraPagamento" style="height:${altPagamento}px"></div></div>
      <span class="barraLabelV">Pagamento</span>
    </div>
  </div>

  <div class="historicoSaldo">Saldo do mês: <strong>${moeda(h.saldo)}</strong></div>
</li>`;
    });

    document.getElementById("historico").innerHTML = html;
    document.getElementById("vazioHistorico").style.display =
        banco.historico.length === 0 ? "block" : "none";
}

// =====================================================
// FECHAR MÊS
// =====================================================

function fecharMes() {

    let receitas = receitasMes();
    let vales = valeMes();
    let pagamentos = pagamentoMes();

    let totalReceitas = receitas.reduce((a, b) => a + b.valor, 0);
    let totalVale = vales.reduce((a, b) => a + b.valor, 0);
    let totalPagamento = pagamentos.reduce((a, b) => a + b.valor, 0);

    let saldo = totalReceitas - totalVale - totalPagamento;

    banco.historico.unshift({
        mes: mesAtual,
        ano: anoAtual,
        receitas: totalReceitas,
        vale: totalVale,
        pagamento: totalPagamento,
        saldo: saldo
    });

    salvarBanco();

    // Avança para o próximo mês
    let m = Number(mesAtual);
    let a = Number(anoAtual);

    if (m === 12) {
        mesAtual = "01";
        anoAtual = String(a + 1);
    } else {
        mesAtual = String(m + 1).padStart(2, "0");
    }

    salvarPeriodo();

    // ===========================
    // RECRIAR CONTAS FIXAS
    // ===========================

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

    sincronizarSelects();
    salvarBanco();
    atualizar();
}

// =====================================================
// BACKUP
// =====================================================

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

function limparTudo() {

    if (!confirm("Será feito um backup automático antes da exclusão.\n\nDeseja continuar?")) return;

    exportarBackup();

    if (!confirm("Backup realizado.\n\nAgora deseja apagar TODOS os dados?")) return;

    banco = {
        receitas: [],
        vale: [],
        pagamento: [],
        historico: []
    };

    const hoje = new Date();
    mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");
    anoAtual = String(hoje.getFullYear());

    salvarPeriodo();
    sincronizarSelects();
    salvarBanco();
    atualizar();

    alert("Todos os dados foram apagados com sucesso.");
}
