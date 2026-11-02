// Métricas do site (vão pro painel da Tati, aba Portfólio).
// Conta visitas, de onde a pessoa veio, tempo na página e cliques nos botões.
// Sem cookies e sem dados pessoais: só um código aleatório por navegador.
// Não conta as visitas da própria Tati (o painel marca o navegador dela).
(function () {
  var URL_EVENTO = "https://llrkeqnqqbwpjnpvpxtl.supabase.co/functions/v1/site-evento";
  try {
    if (localStorage.getItem("tm_eu") === "1") return; // visita da própria Tati
    if (navigator.webdriver) return;
  } catch (e) { /* segue */ }

  function codigo() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  function guardado(armazem, chave) {
    try { var v = armazem.getItem(chave); if (!v) { v = codigo(); armazem.setItem(chave, v); } return v; } catch (e) { return codigo(); }
  }
  var visitante = guardado(localStorage, "tm_vid");
  var sessao = guardado(sessionStorage, "tm_sid");

  var caminho = location.pathname.replace(/\/+$/, "/");
  var pagina = /\/bio\/indicacoes\//.test(caminho) ? "Indicações" : /\/bio\//.test(caminho) ? "Bio" : "Portfólio";

  // De onde veio: utm_source tem prioridade; senão, o site anterior
  var params = new URLSearchParams(location.search);
  var utmSource = params.get("utm_source") || params.get("fonte") || "";
  function nomeOrigem() {
    var u = utmSource.toLowerCase();
    var ref = "";
    try { ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : ""; } catch (e) { ref = ""; }
    var ua = navigator.userAgent || "";
    var texto = u || ref;
    if (/instagram|^ig$|l\.instagram/.test(texto) || /Instagram/.test(ua)) return "Instagram";
    if (/tiktok/.test(texto) || /TikTok|musical_ly|Bytedance/.test(ua)) return "TikTok";
    if (/facebook|fb\.|^fb$/.test(texto) || /FBAN|FBAV/.test(ua)) return "Facebook";
    if (/whatsapp|wa\.me/.test(texto)) return "WhatsApp";
    if (/google/.test(texto)) return "Google";
    if (/linkedin|lnkd/.test(texto)) return "LinkedIn";
    if (/youtube|youtu\.be/.test(texto)) return "YouTube";
    if (/pinterest/.test(texto)) return "Pinterest";
    if (/bing|yahoo|duckduckgo/.test(texto)) return "Outros buscadores";
    if (ref === "tatielemilani.com" || ref === location.hostname) return "Navegando no site";
    if (texto) return texto.slice(0, 40);
    return "Direto";
  }
  var origem = nomeOrigem();

  function enviar(dados) {
    dados.pagina = pagina; dados.visitante = visitante; dados.sessao = sessao;
    var corpo = JSON.stringify(dados);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(URL_EVENTO, new Blob([corpo], { type: "text/plain" }))) return;
    } catch (e) { /* tenta do outro jeito */ }
    try { fetch(URL_EVENTO, { method: "POST", body: corpo, keepalive: true, mode: "cors", headers: { "Content-Type": "text/plain" } }); } catch (e) { /* sem rede */ }
  }

  enviar({ tipo: "visita", origem: origem, utm_source: utmSource, utm_campaign: params.get("utm_campaign") || "", idioma: navigator.language || "" });

  // Cliques nos links e botões (WhatsApp, Instagram, e-mail, lojas...)
  function categoria(href) {
    if (/^mailto:/i.test(href)) return "E-mail";
    if (/wa\.me|whatsapp/i.test(href)) return "WhatsApp";
    if (/ig\.me|instagram\.com/i.test(href)) return "Instagram";
    if (/tiktok\.com/i.test(href)) return "TikTok";
    if (/youtube\.com|youtu\.be/i.test(href)) return "YouTube";
    try { if (new URL(href, location.href).hostname === location.hostname) return "Página do site"; } catch (e) { /* segue */ }
    return "Loja / link externo";
  }
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || /^javascript:/i.test(href)) return;
    var destino = "";
    try { destino = /^mailto:/i.test(href) ? "e-mail" : new URL(href, location.href).hostname.replace(/^www\./, ""); } catch (e) { destino = ""; }
    var rotulo = (a.getAttribute("aria-label") || a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
    enviar({ tipo: "clique", categoria: categoria(href), rotulo: rotulo, destino: destino });
  }, true);

  // Até onde a pessoa rolou a página (0 a 100%)
  var rolagem = 0, esperando = false;
  function medirRolagem() {
    esperando = false;
    var doc = document.documentElement;
    var falta = doc.scrollHeight - window.innerHeight;
    var pct = falta <= 0 ? 100 : Math.round(((window.scrollY || doc.scrollTop) / falta) * 100);
    if (pct > rolagem) rolagem = Math.min(100, Math.max(0, pct));
  }
  window.addEventListener("scroll", function () { if (!esperando) { esperando = true; setTimeout(medirRolagem, 250); } }, { passive: true });
  window.addEventListener("load", medirRolagem);

  // Tempo na página e rolagem: manda quando a pessoa sai (ou troca de aba)
  var inicio = Date.now(), visivelDesde = Date.now(), total = 0, mandou = false;
  function somar() { if (visivelDesde) { total += Date.now() - visivelDesde; visivelDesde = 0; } }
  function saida() { medirRolagem(); mandou = true; enviar({ tipo: "saida", segundos: Math.round(total / 1000), rolagem: rolagem }); }
  // "Quem está no site agora": sinal a cada 30s com a página na tela; "saí" quando fecha ou troca de aba
  function sinal() { if (document.visibilityState === "visible") enviar({ tipo: "ping", origem: origem }); }
  setInterval(sinal, 30000);
  function sai() { enviar({ tipo: "fora" }); }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      somar();
      sai();
      if (!mandou && total > 1000) saida();
    } else { visivelDesde = Date.now(); sinal(); }
  });
  window.addEventListener("pagehide", function () {
    somar();
    sai();
    if (!mandou && Date.now() - inicio > 1000) saida();
  });
})();
