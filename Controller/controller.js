document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#habilidades-chips");
  const buscaHabilidades = document.querySelector("#busca-habilidades");

  if (!container) {
    return;
  }

  fetch("../Model/habilidades.json")
    .then((resposta) => {
      if (!resposta.ok) throw new Error("Falha ao carregar habilidades");
      return resposta.json();
    })
    .then((categorias) => {
      container.innerHTML = "";

      categorias.forEach((categoria) => {
        const grupo = document.createElement("div");
        grupo.className = "habilidades-categoria";

        const titulo = document.createElement("h4");
        titulo.className = "habilidades-categoria-titulo";
        titulo.textContent = categoria.categoria;

        const chipsWrap = document.createElement("div");
        chipsWrap.className = "habilidades-categoria-chips";

        categoria.habilidades.forEach((habilidade) => {
          const label = document.createElement("label");
          label.className = "chip";
          label.dataset.texto = habilidade.toLowerCase();

          const input = document.createElement("input");
          input.type = "checkbox";
          input.value = habilidade;

          label.appendChild(input);
          label.appendChild(document.createTextNode(habilidade));
          chipsWrap.appendChild(label);
        });

        grupo.appendChild(titulo);
        grupo.appendChild(chipsWrap);
        container.appendChild(grupo);
      });

      const semResultado = document.createElement("p");
      semResultado.className = "habilidades-sem-resultado";
      semResultado.hidden = true;
      semResultado.textContent = "Nenhuma habilidade encontrada.";
      container.appendChild(semResultado);

      if (buscaHabilidades) {
        buscaHabilidades.addEventListener("input", () => {
          const termo = buscaHabilidades.value.trim().toLowerCase();
          let algumVisivel = false;

          container.querySelectorAll(".habilidades-categoria").forEach((grupo) => {
            let grupoTemVisivel = false;
            grupo.querySelectorAll(".chip").forEach((chip) => {
              const visivel = !termo || chip.dataset.texto.includes(termo);
              chip.hidden = !visivel;
              if (visivel) grupoTemVisivel = true;
            });
            grupo.hidden = !grupoTemVisivel;
            if (grupoTemVisivel) algumVisivel = true;
          });

          semResultado.hidden = algumVisivel;
        });
      }
    })
    .catch(() => {
      container.innerHTML =
        '<p class="habilidades-carregando">Não foi possível carregar a lista de habilidades. Use o campo "Outras habilidades" abaixo.</p>';
    });
});

function mascararCNPJ(digitos) {
  let resultado = digitos;
  if (digitos.length > 2) resultado = `${digitos.slice(0, 2)}.${digitos.slice(2)}`;
  if (digitos.length > 5)
    resultado = `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5)}`;
  if (digitos.length > 8)
    resultado = `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8)}`;
  if (digitos.length > 12)
    resultado = `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;
  return resultado;
}

function mascararCPF(digitos) {
  let resultado = digitos;
  if (digitos.length > 3) resultado = `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  if (digitos.length > 6)
    resultado = `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  if (digitos.length > 9)
    resultado = `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  return resultado;
}

document.addEventListener("DOMContentLoaded", () => {
  const abas = document.querySelectorAll(".login-tab");
  const formularios = document.querySelectorAll(".form-contratante");

  if (!abas.length) {
    return;
  }

  abas.forEach((aba) => {
    aba.addEventListener("click", () => {
      abas.forEach((item) => item.classList.toggle("active", item === aba));
      formularios.forEach((form) => {
        form.hidden = form.id !== aba.dataset.formAlvo;
      });
    });
  });

  const camposTipoDocumento = document.querySelectorAll('input[name="tipo-documento"]');
  const campoDocumento = document.querySelector("#cadastro-documento");
  const feedbackDocumento = document.querySelector("#cadastro-documento-feedback");

  function tipoDocumentoSelecionado() {
    const marcado = document.querySelector('input[name="tipo-documento"]:checked');
    return marcado ? marcado.value : "cnpj";
  }

  function validarDocumentoAtual() {
    if (!campoDocumento) return true;

    const digitos = campoDocumento.value.replace(/\D/g, "");
    const tipo = tipoDocumentoSelecionado();
    const tamanhoCompleto = tipo === "cnpj" ? 14 : 11;

    campoDocumento.classList.remove("campo-valido", "campo-invalido");
    if (feedbackDocumento) feedbackDocumento.textContent = "";
    if (feedbackDocumento) feedbackDocumento.classList.remove("valido", "invalido");

    if (digitos.length === 0) {
      return false;
    }

    if (digitos.length < tamanhoCompleto) {
      return false;
    }

    const valido =
      tipo === "cnpj"
        ? window.ValidacaoModel.validarCNPJ(digitos)
        : window.ValidacaoModel.validarCPF(digitos);

    campoDocumento.classList.add(valido ? "campo-valido" : "campo-invalido");
    if (feedbackDocumento) {
      feedbackDocumento.textContent = valido
        ? `${tipo.toUpperCase()} válido`
        : `${tipo.toUpperCase()} inválido`;
      feedbackDocumento.classList.add(valido ? "valido" : "invalido");
    }

    return valido;
  }

  if (campoDocumento) {
    camposTipoDocumento.forEach((radio) => {
      radio.addEventListener("change", () => {
        const tipo = tipoDocumentoSelecionado();
        campoDocumento.value = "";
        campoDocumento.placeholder =
          tipo === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00";
        campoDocumento.maxLength = tipo === "cnpj" ? 18 : 14;
        campoDocumento.classList.remove("campo-valido", "campo-invalido");
        if (feedbackDocumento) {
          feedbackDocumento.textContent = "";
          feedbackDocumento.classList.remove("valido", "invalido");
        }
      });
    });

    campoDocumento.addEventListener("input", () => {
      const tipo = tipoDocumentoSelecionado();
      const digitos = campoDocumento.value
        .replace(/\D/g, "")
        .slice(0, tipo === "cnpj" ? 14 : 11);
      campoDocumento.value = tipo === "cnpj" ? mascararCNPJ(digitos) : mascararCPF(digitos);
      validarDocumentoAtual();
    });
  }

  function mostrarFeedbackFormulario(id, mensagem, tipo) {
    const elemento = document.querySelector(`#${id}`);
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.classList.remove("valido", "invalido");
    if (tipo) elemento.classList.add(tipo);
  }

  function supabaseConfigurado() {
    if (!window.supabaseClient) {
      mostrarFeedbackFormulario(
        "cadastro-feedback",
        "Supabase ainda não configurado (veja Model/supabase-config.js).",
        "invalido"
      );
      mostrarFeedbackFormulario(
        "entrar-feedback",
        "Supabase ainda não configurado (veja Model/supabase-config.js).",
        "invalido"
      );
      return false;
    }
    return true;
  }

  const formEntrar = document.querySelector("#form-entrar");
  if (formEntrar) {
    formEntrar.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      mostrarFeedbackFormulario("entrar-feedback", "", null);

      if (!supabaseConfigurado()) return;

      const email = document.querySelector("#entrar-email").value;
      const senha = document.querySelector("#entrar-senha").value;

      const { error } = await window.supabaseClient.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        mostrarFeedbackFormulario("entrar-feedback", error.message, "invalido");
        return;
      }

      window.location.href = "contratante.html";
    });
  }

  const formCadastro = document.querySelector("#form-cadastro");
  if (formCadastro) {
    formCadastro.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      mostrarFeedbackFormulario("cadastro-feedback", "", null);

      if (campoDocumento && !validarDocumentoAtual()) {
        campoDocumento.focus();
        return;
      }

      const senha = document.querySelector("#cadastro-senha").value;
      const confirmar = document.querySelector("#cadastro-confirmar").value;
      if (senha !== confirmar) {
        mostrarFeedbackFormulario("cadastro-feedback", "As senhas não coincidem.", "invalido");
        return;
      }

      if (!supabaseConfigurado()) return;

      const botaoCriar = document.querySelector("#btn-criar-conta");
      if (botaoCriar) botaoCriar.disabled = true;

      const nome = document.querySelector("#cadastro-empresa").value;
      const email = document.querySelector("#cadastro-email").value;
      const tipo = tipoDocumentoSelecionado();
      const documento = campoDocumento.value.replace(/\D/g, "");

      const { data, error } = await window.supabaseClient.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome, tipo_documento: tipo, documento },
        },
      });

      if (botaoCriar) botaoCriar.disabled = false;

      if (error) {
        mostrarFeedbackFormulario("cadastro-feedback", error.message, "invalido");
        return;
      }

      if (!data.session) {
        mostrarFeedbackFormulario(
          "cadastro-feedback",
          "Conta criada! Verifique seu e-mail para confirmar antes de entrar.",
          "valido"
        );
        return;
      }

      window.location.href = "contratante.html";
    });
  }
});

function renderizarVagaContratante(vaga) {
  const artigo = document.createElement("article");
  artigo.className = "vaga-contratante-card";
  artigo.dataset.vagaId = vaga.id;

  const statusClasse =
    { Ativa: "status-ativa", Pausada: "status-pausada", Encerrada: "status-encerrada" }[
      vaga.status
    ] || "status-ativa";
  const acaoStatus = vaga.status === "Pausada" ? "Ativar" : "Pausar";
  const salarioFormatado = Number(vaga.salario).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  artigo.innerHTML = `
    <div class="vaga-contratante-info">
      <div class="vaga-contratante-topo">
        <h3></h3>
        <span class="status-badge ${statusClasse}">${vaga.status}</span>
      </div>
      <p class="vaga-local"></p>
      <div class="vaga-contratante-meta">
        <span class="vaga-salario">R$ ${salarioFormatado}</span>
      </div>
    </div>
    <div class="vaga-contratante-acoes">
      <button type="button" class="btn-acao" data-acao="pausar">${acaoStatus}</button>
      <button type="button" class="btn-acao btn-acao-perigo" data-acao="excluir">Excluir</button>
    </div>
  `;

  artigo.querySelector("h3").textContent = vaga.cargo;
  artigo.querySelector(".vaga-local").textContent = `${vaga.cidade} · ${vaga.modalidade}`;

  return artigo;
}

document.addEventListener("DOMContentLoaded", async () => {
  const listContainer = document.querySelector("#vagas-contratante-list");
  if (!listContainer) {
    return;
  }

  const saudacao = document.querySelector("#dashboard-saudacao");
  const buscaInput = document.querySelector(".dashboard-toolbar .busca-input");
  const filtroStatus = document.querySelector("#filtro-status");
  const btnSair = document.querySelector("#btn-sair");

  if (!window.supabaseClient) {
    listContainer.innerHTML =
      '<p class="habilidades-carregando">Supabase ainda não configurado (veja Model/supabase-config.js).</p>';
    if (saudacao) saudacao.textContent = "Configuração pendente";
    return;
  }

  const {
    data: { session },
  } = await window.supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "contratante-login.html";
    return;
  }

  if (btnSair) {
    btnSair.addEventListener("click", async () => {
      await window.supabaseClient.auth.signOut();
      window.location.href = "contratante-login.html";
    });
  }

  const { data: empresa } = await window.supabaseClient
    .from("empresas")
    .select("nome")
    .eq("id", session.user.id)
    .single();

  if (saudacao) saudacao.textContent = empresa ? empresa.nome : session.user.email;

  const { data: vagas, error } = await window.supabaseClient
    .from("vagas")
    .select("*")
    .eq("empresa_id", session.user.id)
    .order("criado_em", { ascending: false });

  if (error) {
    listContainer.innerHTML = `<p class="habilidades-carregando">Erro ao carregar vagas: ${error.message}</p>`;
    return;
  }

  function renderizarLista() {
    const termo = buscaInput ? buscaInput.value.trim().toLowerCase() : "";
    const status = filtroStatus ? filtroStatus.value : "";

    const filtradas = vagas.filter((vaga) => {
      const combinaTexto = !termo || vaga.cargo.toLowerCase().includes(termo);
      const combinaStatus = !status || vaga.status === status;
      return combinaTexto && combinaStatus;
    });

    listContainer.innerHTML = "";

    if (filtradas.length === 0) {
      listContainer.innerHTML = '<p class="habilidades-carregando">Nenhuma vaga encontrada.</p>';
      return;
    }

    filtradas.forEach((vaga) => listContainer.appendChild(renderizarVagaContratante(vaga)));
  }

  renderizarLista();

  if (buscaInput) buscaInput.addEventListener("input", renderizarLista);
  if (filtroStatus) filtroStatus.addEventListener("change", renderizarLista);

  listContainer.addEventListener("click", async (evento) => {
    const botao = evento.target.closest("[data-acao]");
    if (!botao) return;

    const card = botao.closest(".vaga-contratante-card");
    const vagaId = card.dataset.vagaId;
    const vaga = vagas.find((item) => item.id === vagaId);
    if (!vaga) return;

    if (botao.dataset.acao === "pausar") {
      const novoStatus = vaga.status === "Pausada" ? "Ativa" : "Pausada";
      const { error: erroUpdate } = await window.supabaseClient
        .from("vagas")
        .update({ status: novoStatus })
        .eq("id", vagaId);

      if (erroUpdate) {
        alert(`Erro ao atualizar a vaga: ${erroUpdate.message}`);
        return;
      }

      vaga.status = novoStatus;
      renderizarLista();
    }

    if (botao.dataset.acao === "excluir") {
      if (!confirm("Tem certeza que deseja excluir esta vaga?")) return;

      const { error: erroDelete } = await window.supabaseClient
        .from("vagas")
        .delete()
        .eq("id", vagaId);

      if (erroDelete) {
        alert(`Erro ao excluir a vaga: ${erroDelete.message}`);
        return;
      }

      const indice = vagas.findIndex((item) => item.id === vagaId);
      if (indice !== -1) vagas.splice(indice, 1);
      renderizarLista();
    }
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("#form-nova-vaga");
  if (!form) {
    return;
  }

  const feedback = document.querySelector("#nova-vaga-feedback");

  function mostrarFeedbackVaga(mensagem, tipo) {
    if (!feedback) return;
    feedback.textContent = mensagem;
    feedback.classList.remove("valido", "invalido");
    if (tipo) feedback.classList.add(tipo);
  }

  if (!window.supabaseClient) {
    mostrarFeedbackVaga("Supabase ainda não configurado (veja Model/supabase-config.js).", "invalido");
    return;
  }

  const {
    data: { session },
  } = await window.supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "contratante-login.html";
    return;
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mostrarFeedbackVaga("", null);

    const habilidadesSelecionadas = [
      ...document.querySelectorAll("#habilidades-chips input:checked"),
    ].map((input) => input.value);

    const outrasHabilidades = document
      .querySelector("#vaga-habilidades-outras")
      .value.split("\n")
      .map((linha) => linha.trim())
      .filter(Boolean);

    const novaVaga = {
      empresa_id: session.user.id,
      cargo: document.querySelector("#vaga-cargo").value,
      cidade: document.querySelector("#vaga-cidade").value,
      modalidade: document.querySelector("#vaga-modalidade").value,
      nivel: document.querySelector("#vaga-nivel").value,
      contratacao: document.querySelector("#vaga-contratacao").value,
      salario: Number(document.querySelector("#vaga-salario").value),
      descricao: document.querySelector("#vaga-descricao").value,
      beneficios: document.querySelector("#vaga-beneficios").value,
      habilidades: [...habilidadesSelecionadas, ...outrasHabilidades],
      telefone: document.querySelector("#vaga-tel").value,
      email: document.querySelector("#vaga-email").value,
      link_externo: document.querySelector("#vaga-link").value,
    };

    const botaoPublicar = document.querySelector("#btn-publicar-vaga");
    if (botaoPublicar) botaoPublicar.disabled = true;

    const { error } = await window.supabaseClient.from("vagas").insert(novaVaga);

    if (botaoPublicar) botaoPublicar.disabled = false;

    if (error) {
      mostrarFeedbackVaga(`Erro ao publicar a vaga: ${error.message}`, "invalido");
      return;
    }

    window.location.href = "contratante.html";
  });
});

function atualizarBotaoSalvar(botao, salva) {
  botao.classList.toggle("salvo", salva);
  botao.setAttribute("aria-pressed", String(salva));
  botao.textContent = salva ? botao.dataset.textoSalvo : botao.dataset.textoSalvar;
}

function configurarBotaoSalvar(botao) {
  if (!botao.dataset.textoSalvar) {
    botao.dataset.textoSalvar = botao.textContent;
    botao.dataset.textoSalvo = botao.textContent.replace("☆", "★");
  }

  atualizarBotaoSalvar(botao, window.VagasModel.isVagaSalva(botao.dataset.salvarVaga));

  if (botao.dataset.wired) return;
  botao.dataset.wired = "true";

  botao.addEventListener("click", (evento) => {
    evento.preventDefault();
    evento.stopPropagation();
    const vagaId = botao.dataset.salvarVaga;
    window.VagasModel.toggleVagaSalva(vagaId);

    document
      .querySelectorAll(`[data-salvar-vaga="${vagaId}"]`)
      .forEach((item) => atualizarBotaoSalvar(item, window.VagasModel.isVagaSalva(vagaId)));

    if (window.aplicarFiltrosVagas) {
      window.aplicarFiltrosVagas();
    }
  });
}

function configurarBotoesSalvar(raiz) {
  (raiz || document).querySelectorAll("[data-salvar-vaga]").forEach(configurarBotaoSalvar);
}

function formatarDataRelativa(dataIso) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataIso + "T00:00:00");
  const diffDias = Math.round((hoje - data) / 86400000);

  if (diffDias <= 0) return "Publicada hoje";
  if (diffDias === 1) return "Publicada ontem";
  if (diffDias < 30) return `Publicada há ${diffDias} dias`;
  const diffMeses = Math.floor(diffDias / 30);
  return `Publicada há ${diffMeses} ${diffMeses === 1 ? "mês" : "meses"}`;
}

function configurarFiltrosEOrdenacao() {
  const buscaInput = document.querySelector(".busca-input");
  const filtroCidade = document.querySelector("#filtro-cidade");
  const filtroModalidade = document.querySelector("#filtro-modalidade");
  const filtroNivel = document.querySelector("#filtro-nivel");
  const filtroContratacao = document.querySelector("#filtro-contratacao");
  const filtroSalario = document.querySelector("#filtro-salario");
  const filtroSalvas = document.querySelector("#filtro-salvas");
  const filtroOrdenar = document.querySelector("#filtro-ordenar");
  const btnLimpar = document.querySelector(".btn-limpar-filtros");
  const btnFiltrosToggle = document.querySelector(".btn-filtros-toggle");
  const painelFiltros = document.querySelector("#painel-filtros");
  const vagasList = document.querySelector(".vagas-list");
  const cards = document.querySelectorAll(".vaga-card");
  const semResultado = document.querySelector(".vagas-sem-resultado");

  if (!buscaInput || !vagasList || !filtroCidade) {
    return;
  }

  if (btnFiltrosToggle && painelFiltros && !btnFiltrosToggle.dataset.wired) {
    btnFiltrosToggle.dataset.wired = "true";
    btnFiltrosToggle.addEventListener("click", () => {
      const aberto = btnFiltrosToggle.getAttribute("aria-expanded") === "true";
      btnFiltrosToggle.setAttribute("aria-expanded", String(!aberto));
      painelFiltros.hidden = aberto;
    });
  }

  function ordenarPorData() {
    const ordem = filtroOrdenar ? filtroOrdenar.value : "recentes";
    const cardsOrdenados = [...cards].sort((a, b) => {
      const dataA = new Date(a.dataset.data || 0);
      const dataB = new Date(b.dataset.data || 0);
      return ordem === "antigas" ? dataA - dataB : dataB - dataA;
    });

    cardsOrdenados.forEach((card) => vagasList.insertBefore(card, semResultado));
  }

  function aplicarFiltros() {
    const termo = buscaInput.value.trim().toLowerCase();
    const cidade = filtroCidade.value;
    const modalidade = filtroModalidade.value;
    const nivel = filtroNivel.value;
    const contratacao = filtroContratacao.value;
    const [salarioMin, salarioMax] = filtroSalario.value
      ? filtroSalario.value.split("-").map(Number)
      : [null, null];
    let visiveis = 0;

    cards.forEach((card) => {
      const titulo = card.querySelector("h3").textContent.toLowerCase();
      const empresa = card.querySelector(".vaga-empresa").textContent.toLowerCase();
      const salarioCard = Number(card.dataset.salario || 0);

      const combinaTexto = !termo || titulo.includes(termo) || empresa.includes(termo);
      const combinaCidade = !cidade || card.dataset.cidade === cidade;
      const combinaModalidade = !modalidade || card.dataset.modalidade === modalidade;
      const combinaNivel = !nivel || card.dataset.nivel === nivel;
      const combinaContratacao = !contratacao || card.dataset.contratacao === contratacao;
      const combinaSalario =
        salarioMin === null || (salarioCard >= salarioMin && salarioCard <= salarioMax);
      const combinaSalva =
        !filtroSalvas ||
        !filtroSalvas.checked ||
        (window.VagasModel && window.VagasModel.isVagaSalva(card.dataset.vagaId));

      const visivel =
        combinaTexto &&
        combinaCidade &&
        combinaModalidade &&
        combinaNivel &&
        combinaContratacao &&
        combinaSalario &&
        combinaSalva;

      card.hidden = !visivel;
      if (visivel) visiveis += 1;
    });

    if (semResultado) {
      semResultado.hidden = visiveis > 0;
    }
  }

  [buscaInput, filtroCidade, filtroModalidade, filtroNivel, filtroContratacao, filtroSalario].forEach(
    (campo) => {
      const evento = campo === buscaInput ? "input" : "change";
      campo.addEventListener(evento, aplicarFiltros);
    }
  );

  if (filtroSalvas) {
    filtroSalvas.addEventListener("change", aplicarFiltros);
  }

  if (filtroOrdenar) {
    filtroOrdenar.addEventListener("change", ordenarPorData);
  }

  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      buscaInput.value = "";
      [filtroCidade, filtroModalidade, filtroNivel, filtroContratacao, filtroSalario].forEach(
        (select) => {
          select.value = "";
        }
      );
      if (filtroSalvas) filtroSalvas.checked = false;
      if (filtroOrdenar) filtroOrdenar.value = "recentes";
      aplicarFiltros();
      ordenarPorData();
    });
  }

  window.aplicarFiltrosVagas = aplicarFiltros;

  ordenarPorData();
}

function renderizarVagaCard(vaga) {
  const card = document.createElement("div");
  card.className = "vaga-card";
  card.dataset.cidade = vaga.cidade;
  card.dataset.modalidade = vaga.modalidade;
  card.dataset.nivel = vaga.nivel;
  card.dataset.contratacao = vaga.contratacao;
  card.dataset.salario = vaga.salario;
  card.dataset.data = vaga.data_publicacao;
  card.dataset.vagaId = vaga.id;

  const salarioFormatado = Number(vaga.salario).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });

  card.innerHTML = `
    <button class="btn-salvar" data-salvar-vaga="${vaga.id}" aria-label="Salvar vaga">☆</button>
    <h3></h3>
    <div class="vaga-card-footer">
      <div class="vaga-info">
        <p class="vaga-local"></p>
        <p class="vaga-empresa"></p>
        <p class="vaga-data">${formatarDataRelativa(vaga.data_publicacao)}</p>
      </div>
      <span class="vaga-salario">R$ ${salarioFormatado}</span>
    </div>
  `;

  card.querySelector("h3").textContent = vaga.cargo;
  card.querySelector(".vaga-local").textContent = vaga.cidade;
  card.querySelector(".vaga-empresa").textContent = vaga.empresa_nome || "Empresa";

  return card;
}

function mostrarDetalheVaga(vaga) {
  document.querySelector("#detalhe-cargo").textContent = vaga.cargo;
  document.querySelector("#detalhe-local").textContent = vaga.cidade;
  document.querySelector("#detalhe-empresa").textContent = vaga.empresa_nome || "Empresa";

  const salarioFormatado = Number(vaga.salario).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
  document.querySelector("#detalhe-salario").textContent = `R$ ${salarioFormatado}`;

  const descricaoEl = document.querySelector("#detalhe-descricao");
  descricaoEl.innerHTML = "";
  (vaga.descricao || "")
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean)
    .forEach((paragrafo) => {
      const p = document.createElement("p");
      p.textContent = paragrafo;
      descricaoEl.appendChild(p);
    });

  const botaoSalvarDetalhe = document.querySelector("#detalhe-btn-salvar");
  if (botaoSalvarDetalhe) {
    botaoSalvarDetalhe.hidden = false;
    botaoSalvarDetalhe.dataset.salvarVaga = vaga.id;
  }

  document.querySelector("#dados-preco").textContent = `R$ ${salarioFormatado}`;
  document.querySelector("#dados-local-modalidade").textContent = `${vaga.cidade} ${vaga.modalidade}`;
  document.querySelector("#dados-beneficios").textContent = vaga.beneficios || "Não informado";

  const listaHabilidades = document.querySelector("#dados-habilidades");
  listaHabilidades.innerHTML = "";
  (vaga.habilidades || []).forEach((habilidade) => {
    const li = document.createElement("li");
    li.textContent = habilidade;
    listaHabilidades.appendChild(li);
  });

  const contatoTel = document.querySelector("#contato-tel");
  contatoTel.hidden = !vaga.telefone;
  if (vaga.telefone) {
    const digitos = vaga.telefone.replace(/\D/g, "");
    contatoTel.querySelector(".contato-texto").textContent = `Tel: ${vaga.telefone}`;
    contatoTel.querySelector(".btn-copiar").dataset.copiar = vaga.telefone;
    contatoTel.querySelector(".btn-enviar").href = `https://wa.me/55${digitos}`;
  }

  const contatoEmail = document.querySelector("#contato-email");
  contatoEmail.querySelector(".contato-texto").textContent = `Email: ${vaga.email}`;
  contatoEmail.querySelector(".btn-copiar").dataset.copiar = vaga.email;
  contatoEmail.querySelector(".btn-enviar").href = `mailto:${vaga.email}`;

  const contatoLink = document.querySelector("#contato-link");
  contatoLink.hidden = !vaga.link_externo;
  if (vaga.link_externo) contatoLink.textContent = `Link Externo: ${vaga.link_externo}`;

  configurarBotoesSalvar();
}

document.addEventListener("DOMContentLoaded", async () => {
  const listaContainer = document.querySelector("#vagas-lista");
  if (!listaContainer) {
    return;
  }

  if (!window.supabaseClient) {
    listaContainer.innerHTML =
      '<p class="habilidades-carregando">Supabase ainda não configurado (veja Model/supabase-config.js).</p>';
    return;
  }

  const { data: vagas, error } = await window.supabaseClient
    .from("vagas")
    .select("*")
    .eq("status", "Ativa")
    .order("criado_em", { ascending: false });

  if (error) {
    listaContainer.innerHTML = `<p class="habilidades-carregando">Erro ao carregar vagas: ${error.message}</p>`;
    return;
  }

  if (!vagas || vagas.length === 0) {
    listaContainer.innerHTML = '<p class="habilidades-carregando">Nenhuma vaga publicada no momento.</p>';
    return;
  }

  const idsEmpresas = [...new Set(vagas.map((vaga) => vaga.empresa_id))];
  const { data: empresas } = await window.supabaseClient
    .from("empresas_publicas")
    .select("id, nome")
    .in("id", idsEmpresas);

  const nomePorEmpresa = Object.fromEntries((empresas || []).map((empresa) => [empresa.id, empresa.nome]));
  vagas.forEach((vaga) => {
    vaga.empresa_nome = nomePorEmpresa[vaga.empresa_id] || "Empresa";
  });

  listaContainer.innerHTML = "";
  vagas.forEach((vaga) => {
    listaContainer.appendChild(renderizarVagaCard(vaga));
  });

  const semResultado = document.createElement("p");
  semResultado.className = "vagas-sem-resultado";
  semResultado.hidden = true;
  semResultado.textContent = "Nenhuma vaga encontrada.";
  listaContainer.appendChild(semResultado);

  function selecionarVaga(vaga, card) {
    document.querySelectorAll(".vaga-card.active").forEach((item) => item.classList.remove("active"));
    if (card) card.classList.add("active");
    mostrarDetalheVaga(vaga);
  }

  listaContainer.addEventListener("click", (evento) => {
    if (evento.target.closest("[data-salvar-vaga]")) return;
    const card = evento.target.closest(".vaga-card");
    if (!card) return;
    const vaga = vagas.find((item) => item.id === card.dataset.vagaId);
    if (vaga) selecionarVaga(vaga, card);
  });

  const filtroCidade = document.querySelector("#filtro-cidade");
  if (filtroCidade) {
    const cidades = [...new Set(vagas.map((vaga) => vaga.cidade))].sort();
    cidades.forEach((cidade) => {
      const option = document.createElement("option");
      option.value = cidade;
      option.textContent = cidade;
      filtroCidade.appendChild(option);
    });
  }

  selecionarVaga(vagas[0], listaContainer.querySelector(".vaga-card"));
  configurarFiltrosEOrdenacao();
});

document.addEventListener("DOMContentLoaded", () => {
  const botaoTema = document.querySelector("#tema-toggle");
  if (!botaoTema) {
    return;
  }

  function temaAtual() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function atualizarBotaoTema() {
    const ativo = temaAtual();
    botaoTema.textContent = ativo === "dark" ? "☀️" : "🌙";
    botaoTema.setAttribute(
      "aria-label",
      ativo === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"
    );
  }

  atualizarBotaoTema();

  botaoTema.addEventListener("click", () => {
    const novoTema = temaAtual() === "dark" ? "light" : "dark";

    if (novoTema === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    localStorage.setItem("tema", novoTema);
    atualizarBotaoTema();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const contato = document.querySelector(".contato");
  if (!contato) {
    return;
  }

  contato.addEventListener("click", async (evento) => {
    const botao = evento.target.closest(".btn-copiar");
    if (!botao) {
      return;
    }

    try {
      await navigator.clipboard.writeText(botao.dataset.copiar || "");
      const htmlOriginal = botao.innerHTML;
      botao.innerHTML =
        '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      botao.classList.add("copiado");
      setTimeout(() => {
        botao.innerHTML = htmlOriginal;
        botao.classList.remove("copiado");
      }, 1500);
    } catch (erro) {
      console.error("Não foi possível copiar:", erro);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#agua-viva");
  if (!canvas) {
    return;
  }

  const zona = canvas.closest(".zona-agua-viva");
  const ctx = canvas.getContext("2d");
  const GLIFOS = ["}", "{", "§", ")", "(", "/", "\\", "]", "[", "s", "3"];
  const TEXTURA = ["·", "░", "0", "|"];
  const LINHAS_SINO = [
    [3, 4, 5, 6, 7, 8, 9],
    [2, 3, 4, 5, 6, 7, 8, 9, 10],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    [2, 3, 4, 5, 6, 7, 8, 9, 10],
    [3, 4, 5, 6, 7, 8, 9],
  ];
  const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let largura = 0;
  let altura = 0;
  let cell = 13;
  let jellies = [];
  let motes = [];
  let paleta = [];
  let cliqueX = 0;
  let cliqueY = 0;
  let cliqueTempo = -10;
  const DURACAO_IMPULSO = 1.2;

  function corVar(nome) {
    return getComputedStyle(document.body).getPropertyValue(nome).trim();
  }

  function hexParaRgb(hex) {
    const valor = hex.replace("#", "");
    const bigint = parseInt(valor, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  function misturar(corA, corB, m) {
    return [
      corA[0] + (corB[0] - corA[0]) * m,
      corA[1] + (corB[1] - corA[1]) * m,
      corA[2] + (corB[2] - corA[2]) * m,
    ];
  }

  function construirPaleta() {
    const principal = hexParaRgb(corVar("--cor-principal") || "#851424");
    const destaque = hexParaRgb(corVar("--cor-destaque") || "#ff5822");
    const branco = [255, 250, 245];
    const escura = misturar(principal, [0, 0, 0], 0.35);
    const paradas = [
      escura,
      principal,
      misturar(principal, destaque, 0.35),
      misturar(principal, destaque, 0.65),
      destaque,
      misturar(destaque, branco, 0.5),
      branco,
    ];
    paleta = paradas.map(([r, g, b]) => `rgb(${r | 0}, ${g | 0}, ${b | 0})`);
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function criarAguasVivas() {
    const quantidade = Math.max(5, Math.min(12, Math.round((largura * altura) / 140000)));
    jellies = Array.from({ length: quantidade }, () => ({
      x: rand(-largura * 0.08, largura * 1.08),
      y: rand(-altura * 0.12, altura * 1.12),
      escala: rand(0.68, 1.25),
      fase: rand(0, Math.PI * 2),
      velocidade: rand(0.12, 0.3),
      deslocamento: rand(-0.12, 0.12),
      alfa: rand(0.65, 1),
      semente: rand(0, 1000),
      ultimoClique: -10,
      faseBalanco: rand(0, Math.PI * 2),
    }));
  }

  function criarMotas() {
    const quantidade = Math.min(400, Math.round((largura * altura) / 6000));
    motes = Array.from({ length: quantidade }, () => ({
      x: rand(0, largura),
      y: rand(0, altura),
      raio: rand(0.45, 1.1),
      alfa: rand(0.1, 0.5),
      fase: rand(0, Math.PI * 2),
    }));
  }

  function ajustarTamanho() {
    const rect = zona.getBoundingClientRect();
    largura = rect.width;
    altura = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.floor(largura * dpr);
    canvas.height = Math.floor(altura * dpr);
    canvas.style.width = largura + "px";
    canvas.style.height = altura + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cell = Math.max(10, Math.min(16, Math.round(Math.min(largura, altura) / 65)));
    criarAguasVivas();
    criarMotas();
  }

  function desenharSino(j, t, x, y, s) {
    const pulso = 1 + Math.sin(t * 1.15 + j.fase) * 0.055;
    const cw = cell * s * pulso;
    const ch = cell * s * pulso;

    LINHAS_SINO.forEach((cols, r) => {
      cols.forEach((c) => {
        const borda = Math.min(c - cols[0], cols[cols.length - 1] - c);
        const ruido = Math.sin(c * 12.7 + r * 7.1 + j.semente);
        let tom = Math.floor(2 + borda * 0.85 + ruido * 1.2 + (r === 0 ? 1 : 0));
        tom = Math.max(0, Math.min(paleta.length - 1, tom));

        const px = x + (c - 6) * cw;
        const py = y + (r - 2.5) * ch;
        ctx.globalAlpha = j.alfa * (0.78 + 0.22 * Math.sin(t * 1.7 + j.fase + c));
        ctx.fillStyle = paleta[tom];
        ctx.fillRect(px + 1, py + 1, cw - 1.5, ch - 1.5);

        if ((c + r + (j.semente | 0)) % 7 === 0) {
          ctx.fillStyle = paleta[paleta.length - 1];
          ctx.globalAlpha = 0.72 * j.alfa;
          ctx.font = `${Math.max(7, cell * s * 0.72)}px Consolas, "SFMono-Regular", "Courier New", monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(TEXTURA[Math.abs((c * 3 + r * 5) | 0) % TEXTURA.length], px + cw / 2, py + ch / 2);
        }
      });
    });
    ctx.globalAlpha = 1;
  }

  function desenharTentaculos(j, t, x, y, s) {
    const quantidade = 6;
    const comprimento = 17;

    for (let k = 0; k < quantidade; k++) {
      const ancora = x + (k - (quantidade - 1) / 2) * cell * s * 1.45;
      const fase = j.fase + k * 0.8;

      for (let n = 0; n < comprimento; n++) {
        const progresso = n / comprimento;
        // Usa a fase acumulada (j.faseBalanco), não t*frequência: assim, quando o
        // impulso do clique sobe e desce, a velocidade do balanço muda suavemente,
        // sem saltos — mesmo clicando várias vezes seguidas.
        const balanco = Math.sin(j.faseBalanco + fase + progresso * 4.2) * cell * s * (0.8 + progresso * 1.9);
        const curva = Math.sin(t * 0.52 + fase) * progresso * cell * s * 1.5;
        const px = ancora + balanco + curva;
        const py = y + cell * s * (3.15 + n * 0.9);
        const esmaecer = (1 - progresso) * 0.72;
        const glifo = GLIFOS[(k * 3 + n + Math.floor(t * 1.4)) % GLIFOS.length];

        ctx.globalAlpha = j.alfa * esmaecer * (0.38 + 0.5 * Math.sin(n * 0.42 + t + fase) ** 2);
        ctx.fillStyle = paleta[Math.max(0, Math.min(5, Math.floor((1 - progresso) * 5 + (k % 2))))];
        ctx.font = `${Math.max(7, cell * s * 0.82)}px Consolas, "SFMono-Regular", "Courier New", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(glifo, px, py);

        if (n % 4 === 0) {
          ctx.globalAlpha *= 0.48;
          ctx.fillText("/", px - cell * s * 0.9, py - cell * s * 0.25);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function desenharAguaViva(j, t, impulso) {
    const s = j.escala;
    const x = j.x + Math.sin(t * 0.23 + j.fase) * 18 * s;
    const y = j.y + Math.cos(t * 0.3 + j.fase) * 12 * s;

    ctx.save();
    ctx.shadowColor = corVar("--cor-destaque-translucido") || "rgba(255, 88, 34, 0.145)";
    ctx.shadowBlur = (9 + impulso * 6) * s;
    desenharTentaculos(j, t, x, y, s);
    desenharSino(j, t, x, y, s);
    ctx.restore();
  }

  function desenharBrilhoClique(t) {
    const decorrido = t - cliqueTempo;
    if (decorrido < 0 || decorrido > DURACAO_IMPULSO) return;

    const raioBrilho = 110;
    const inicioX = Math.floor((cliqueX - raioBrilho) / cell) * cell;
    const inicioY = Math.floor((cliqueY - raioBrilho) / cell) * cell;
    const esmaecerGeral = 1 - decorrido / DURACAO_IMPULSO;

    ctx.font = `${cell}px Consolas, "SFMono-Regular", "Courier New", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let y = inicioY; y <= cliqueY + raioBrilho; y += cell) {
      for (let x = inicioX; x <= cliqueX + raioBrilho; x += cell) {
        const dx = x - cliqueX;
        const dy = y - cliqueY;
        const distancia = Math.sqrt(dx * dx + dy * dy);
        if (distancia > raioBrilho) continue;

        const proximidade = 1 - distancia / raioBrilho;
        const pulsoLocal = 0.55 + 0.45 * Math.sin(t * 6 - distancia * 0.08);
        const opacidade = proximidade * pulsoLocal * 0.65 * esmaecerGeral;
        if (opacidade <= 0.02) continue;

        ctx.fillStyle = paleta[paleta.length - 3];
        ctx.globalAlpha = opacidade;
        ctx.fillText("•", x, y);
      }
    }
    ctx.globalAlpha = 1;
  }

  let ultimoTimestamp = 0;
  let tempo = 0;

  function desenharFrame(timestampMs) {
    const dt = ultimoTimestamp ? Math.min(0.04, (timestampMs - ultimoTimestamp) / 1000) : 0.016;
    ultimoTimestamp = timestampMs;
    if (!reduzMovimento) tempo += dt;

    construirPaleta();
    ctx.clearRect(0, 0, largura, altura);

    motes.forEach((m) => {
      const piscar = 0.5 + 0.5 * Math.sin(tempo * 0.8 + m.fase);
      ctx.globalAlpha = m.alfa * piscar;
      ctx.fillStyle = paleta[paleta.length - 2];
      ctx.fillRect(m.x, m.y, m.raio, m.raio);
    });
    ctx.globalAlpha = 1;

    jellies.forEach((j) => {
      const impulso = Math.max(0, 1 - (tempo - j.ultimoClique) / DURACAO_IMPULSO);

      if (!reduzMovimento) {
        j.faseBalanco += (1.15 + impulso * 1.5) * dt;

        const velocidadeExtra = 1 + impulso * 14;
        j.x += j.deslocamento * 22 * dt * velocidadeExtra;
        j.y -= j.velocidade * 22 * dt * velocidadeExtra;
        if (j.y < -altura * 0.32) {
          j.y = altura + rand(20, altura * 0.4);
          j.x = rand(-largura * 0.08, largura * 1.08);
        }
        if (j.x < -largura * 0.2) j.x = largura + 30;
        if (j.x > largura * 1.2) j.x = -30;
      }
      desenharAguaViva(j, tempo, impulso);
    });

    if (!reduzMovimento) desenharBrilhoClique(tempo);
  }

  let animando = true;
  function loop(timestamp) {
    if (!animando) return;
    desenharFrame(timestamp);
    requestAnimationFrame(loop);
  }

  ajustarTamanho();
  construirPaleta();

  if (reduzMovimento) {
    desenharFrame(0);
  } else {
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => {
    ajustarTamanho();
    if (reduzMovimento) {
      ultimoTimestamp = 0;
      desenharFrame(0);
    }
  });

  if (!reduzMovimento) {
    zona.addEventListener("click", (evento) => {
      const rect = zona.getBoundingClientRect();
      cliqueX = evento.clientX - rect.left;
      cliqueY = evento.clientY - rect.top;
      cliqueTempo = tempo;

      let maisProxima = null;
      let menorDistancia = Infinity;
      jellies.forEach((j) => {
        const distancia = Math.hypot(j.x - cliqueX, j.y - cliqueY);
        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          maisProxima = j;
        }
      });
      if (maisProxima) maisProxima.ultimoClique = tempo;
    });
  }

  document.addEventListener("visibilitychange", () => {
    animando = document.visibilityState === "visible" && !reduzMovimento;
    if (animando) {
      requestAnimationFrame(loop);
    }
  });
});
