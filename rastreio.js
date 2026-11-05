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

  // De onde veio, nesta ordem:
  // 1) link marcado (?fonte=insta-bio, ?fonte=linkedin, ?utm_source=...): o mais certeiro;
  // 2) o app em que o site abriu (Instagram, TikTok, LinkedIn... deixam a marca no navegador);
  // 3) o site anterior (Google, LinkedIn, Gmail...);
  // 4) navegando entre as páginas do site: mantém a origem de quando a pessoa chegou.
  var params = new URLSearchParams(location.search);
  var utmSource = params.get("fonte") || params.get("utm_source") || params.get("f") || "";
  var referencia = "";
  try { referencia = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : ""; } catch (e) { referencia = ""; }
  // android-app://com.linkedin.android/ -> com.linkedin.android
  if (!referencia && /^android-app:\/\//.test(document.referrer || "")) referencia = document.referrer.replace(/^android-app:\/\//, "").split("/")[0];

  var REDES = [
    [/^(insta|instagram|ig)$/, "Instagram"], [/^(tiktok|tt)$/, "TikTok"], [/^(linkedin|lkd|in)$/, "LinkedIn"],
    [/^(facebook|fb)$/, "Facebook"], [/^(whatsapp|whats|zap|wpp)$/, "WhatsApp"], [/^(youtube|yt)$/, "YouTube"],
    [/^(pinterest|pin)$/, "Pinterest"], [/^threads$/, "Threads"], [/^(x|twitter)$/, "X (Twitter)"],
    [/^(email|e-mail|gmail|mail)$/, "E-mail"], [/^(midiakit|midia-kit|mediakit|kit)$/, "Mídia kit"],
    [/^(plataforma|plat)$/, "Plataforma"], [/^(agencia|ag)$/, "Agência"], [/^google$/, "Google"], [/^(qr|qrcode)$/, "QR code"]
  ];
  var LUGARES = { bio: "Bio", stories: "Stories", story: "Stories", dm: "Direct", direct: "Direct", post: "Post", reels: "Reels",
    perfil: "Perfil", destaque: "Destaques", destaques: "Destaques", assinatura: "Assinatura", proposta: "Proposta", anuncio: "Anúncio" };
  function capitalizar(s) { return s.replace(/(^|\s)\S/g, function (l) { return l.toUpperCase(); }); }
  // "insta-bio" -> "Instagram · Bio"; "plataforma-squid" -> "Plataforma · Squid"
  function nomeFonte(f) {
    var partes = f.toLowerCase().replace(/[_+.]/g, "-").split("-").filter(Boolean);
    if (!partes.length) return "";
    var rede = null;
    for (var i = 0; i < REDES.length; i++) if (REDES[i][0].test(partes[0])) { rede = REDES[i][1]; break; }
    if (!rede) return capitalizar(partes.join(" ")).slice(0, 50);
    var resto = partes.slice(1).map(function (p) { return LUGARES[p] || p; }).join(" ");
    return resto ? rede + " · " + capitalizar(resto).slice(0, 40) : rede;
  }
  function nomeOrigem() {
    if (utmSource) return nomeFonte(utmSource);
    var ref = referencia.toLowerCase();
    var ua = navigator.userAgent || "";
    if (/Instagram/.test(ua) || /instagram|^ig\.me/.test(ref)) return "Instagram";
    if (/TikTok|musical_ly|Bytedance/.test(ua) || /tiktok|musical\.ly/.test(ref)) return "TikTok";
    if (/LinkedInApp/.test(ua) || /linkedin|lnkd\.in/.test(ref)) return "LinkedIn";
    if (/Barcelona/.test(ua) || /threads\.(net|com)/.test(ref)) return "Threads";
    if (/FBAN|FBAV|FB_IAB/.test(ua) || /facebook|^fb\.|messenger/.test(ref)) return "Facebook";
    if (/Pinterest/.test(ua) || /pinterest|pin\.it/.test(ref)) return "Pinterest";
    if (/Snapchat/.test(ua) || /snapchat/.test(ref)) return "Snapchat";
    if (/Telegram/.test(ua) || /telegram|t\.me/.test(ref)) return "Telegram";
    if (/whatsapp|wa\.me/.test(ref)) return "WhatsApp";
    if (/^t\.co$|twitter|^x\.com/.test(ref)) return "X (Twitter)";
    if (/youtube|youtu\.be/.test(ref)) return "YouTube";
    if (/mail\.google|android\.gm|outlook|live\.com|office|yahoo\.mail|mail\./.test(ref)) return "E-mail";
    if (/chatgpt|openai|perplexity|claude\.ai|gemini/.test(ref)) return "Assistente de IA";
    if (/GSA\//.test(ua) || /google/.test(ref)) return "Google";
    if (/bing|yahoo|duckduckgo|ecosia|yandex|brave/.test(ref)) return "Outros buscadores";
    if (ref === "tatielemilani.com" || ref === location.hostname) {
      try { var antes = sessionStorage.getItem("tm_origem"); if (antes) return antes; } catch (e) { /* segue */ }
      return "Navegando no site";
    }
    if (ref) return ref.slice(0, 40); // outro site: mostra o endereço (ex: uma plataforma de UGC)
    return "Direto"; // digitou o endereço, link salvo, ou app que esconde a origem (WhatsApp, e-mail no celular)
  }
  var origem = nomeOrigem();
  try { if (origem !== "Navegando no site") sessionStorage.setItem("tm_origem", origem); } catch (e) { /* segue */ }

  function enviar(dados) {
    dados.pagina = pagina; dados.visitante = visitante; dados.sessao = sessao;
    var corpo = JSON.stringify(dados);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(URL_EVENTO, new Blob([corpo], { type: "text/plain" }))) return;
    } catch (e) { /* tenta do outro jeito */ }
    try { fetch(URL_EVENTO, { method: "POST", body: corpo, keepalive: true, mode: "cors", headers: { "Content-Type": "text/plain" } }); } catch (e) { /* sem rede */ }
  }

  enviar({ tipo: "visita", origem: origem, utm_source: utmSource, utm_campaign: params.get("utm_campaign") || "", referencia: referencia, idioma: navigator.language || "" });

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
    if (a.hasAttribute("data-arquivo")) return; // capa de vídeo: conta como vídeo assistido, não como botão
    var destino = "";
    try { destino = /^mailto:/i.test(href) ? "e-mail" : new URL(href, location.href).hostname.replace(/^www\./, ""); } catch (e) { destino = ""; }
    var rotulo = (a.getAttribute("aria-label") || a.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
    enviar({ tipo: "clique", categoria: categoria(href), rotulo: rotulo, destino: destino });
  }, true);

  // Vídeos: qual vídeo (marca e nicho), quantos segundos a pessoa assistiu e até que ponto (%).
  // Usa as listas do próprio portfólio (TRABALHOS, NICHOS e DESTAQUES) pra saber marca e nicho.
  var tocando = [];
  function infoVideo(src) {
    var caminho = "";
    try { caminho = new URL(src, location.href).pathname; } catch (e) { caminho = String(src || ""); }
    var arquivo = (caminho.split("/").pop() || "").replace(/\.mp4$/i, "");
    try {
      if (/\/videos\//.test(caminho) && typeof TRABALHOS !== "undefined") {
        var t = TRABALHOS.filter(function (x) { return x.arquivo === arquivo; })[0];
        var n = t && typeof NICHOS !== "undefined" ? NICHOS.filter(function (x) { return x.id === t.nicho; })[0] : null;
        if (t) return { marca: t.marca, nicho: n ? n.nome : t.nicho, arquivo: arquivo };
      }
      if (typeof DESTAQUES !== "undefined") {
        var d = DESTAQUES.filter(function (x) { return String(x.video).split("/").pop().replace(/\.mp4$/i, "") === arquivo; })[0];
        if (d) return { marca: d.marca, nicho: "Destaques", arquivo: arquivo };
      }
    } catch (e) { /* segue com o nome do arquivo */ }
    return { marca: arquivo, nicho: "Outro", arquivo: arquivo };
  }
  function achar(v) { for (var i = 0; i < tocando.length; i++) if (tocando[i].el === v && tocando[i].src === v.currentSrc) return tocando[i]; return null; }
  function fecharVideo(a) {
    var i = tocando.indexOf(a); if (i >= 0) tocando.splice(i, 1);
    if (a.assistido < 2) return; // menos de 2s não conta como visto
    var info = infoVideo(a.src);
    enviar({ tipo: "video", categoria: info.nicho, rotulo: info.marca, destino: info.arquivo, segundos: Math.round(a.assistido), rolagem: Math.round(a.maxPct) });
  }
  document.addEventListener("play", function (e) {
    var v = e.target; if (!v || v.tagName !== "VIDEO") return;
    var a = achar(v);
    if (!a) { a = { el: v, src: v.currentSrc || v.src, assistido: 0, maxPct: 0, ultimo: v.currentTime }; tocando.push(a); }
    a.ultimo = v.currentTime;
  }, true);
  document.addEventListener("timeupdate", function (e) {
    var v = e.target; if (!v || v.tagName !== "VIDEO" || v.paused) return;
    var a = achar(v);
    if (!a) { a = { el: v, src: v.currentSrc || v.src, assistido: 0, maxPct: 0, ultimo: v.currentTime }; tocando.push(a); return; } // voltou pra aba com o vídeo tocando
    var passo = v.currentTime - a.ultimo;
    if (passo > 0 && passo < 1.5) a.assistido += passo; // pulos e voltas não contam como tempo assistido
    a.ultimo = v.currentTime;
    if (v.duration) a.maxPct = Math.max(a.maxPct, Math.min(100, (v.currentTime / v.duration) * 100));
  }, true);
  document.addEventListener("ended", function (e) {
    var v = e.target; if (!v || v.tagName !== "VIDEO") return;
    var a = achar(v); if (a) { a.maxPct = 100; fecharVideo(a); }
  }, true);
  // Vídeo que saiu da tela (fechou o player ou passou pro próximo) fecha a conta dele
  setInterval(function () { tocando.slice().forEach(function (a) { if (!a.el.isConnected || (a.el.currentSrc && a.el.currentSrc !== a.src)) fecharVideo(a); }); }, 2000);
  function fecharTodos() { tocando.slice().forEach(fecharVideo); }

  // Nicho em que a pessoa clicou pra ver os vídeos
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-filtro]") : null;
    if (!b) return;
    enviar({ tipo: "nicho", categoria: (b.textContent || b.getAttribute("data-filtro") || "").trim().slice(0, 40) });
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
      fecharTodos();
      if (!mandou && total > 1000) saida();
    } else { visivelDesde = Date.now(); sinal(); }
  });
  window.addEventListener("pagehide", function () {
    somar();
    sai();
    fecharTodos();
    if (!mandou && Date.now() - inicio > 1000) saida();
  });
})();
