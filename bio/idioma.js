// Botão PT | EN da bio e da vitrine, no mesmo esquema do portfólio:
// troca cada texto pela versão em inglês e lembra a escolha (vale pro portfólio também).
(function () {
  var EN = {
    // bio
    'Oi, eu sou a': "Hi, I'm",
    'UGC & Influencer em Curitiba': 'UGC & Influencer in Curitiba',
    'Meu trabalho': 'My work',
    'Conteúdos que geram': 'Content that drives',
    'conexão e venda.': 'connection and sales.',
    'Portfólio': 'Portfolio',
    'Meu começo no UGC': 'How I started in UGC',
    'o curso que eu fiz pra começar': 'the course I took to get started',
    'vídeos que criei pra marcas': "videos I've made for brands",
    'Parcerias UGC e publis': 'UGC & brand deals',
    'fala comigo no WhatsApp': 'talk to me on WhatsApp',
    'Mandar um e-mail': 'Send me an email',
    'Indicações': 'Recommendations',
    'coisas que eu uso e recomendo': 'things I use and recommend',
    'Meus cupons': 'My coupons',
    'Copia o código e usa na finalização da compra, no site da marca.': "Copy the code and use it at checkout on the brand's website.",
    'Maquiagem e skincare': 'Makeup & skincare',
    'Roupas tech': 'Tech apparel',
    'Fixador de maquiagem': 'Makeup setting spray',
    'Roupas básicas': 'Basics',
    'copiar': 'copy',
    'copiado!': 'copied!',
    'ir pro site →': 'visit site →',
    'Vitrine da Tati': "Tati's picks",
    'Coisas que eu': 'Things I',
    'indico': 'recommend',
    'Produtos que eu uso de verdade e recomendo num lugar só.': 'Products I truly use and recommend, all in one place.',
    'ver a vitrine →': 'see my picks →',
    'Beleza, gravação e acessórios': 'Beauty, filming gear & accessories',
    'filtra por loja e categoria →': 'filter by store and category →',
    'Bora': "Let's",
    'conversar?': 'talk?',
    'Parceria, UGC, clips ou só um oi. Respondo em até 24hrs.': 'Partnerships, UGC, clips or just a hi. I reply within 24 hours.',
    'Chamar no WhatsApp': 'Message me on WhatsApp',
    'Mandar DM no Instagram': 'DM me on Instagram',
    'Mandar e-mail': 'Send an email',
    'UGC Creator & Influencer · Curitiba/PR': 'UGC Creator & Influencer · Curitiba, Brazil',
    'Fixador Maria Margarida': 'Maria Margarida setting spray',
    'Microfone Hollyland Lark M2': 'Hollyland Lark M2 mic',
    // vitrine
    '← voltar pra bio': '← back to bio',
    'O que eu uso, amo e indico, tudo num lugar só.': 'What I use, love and recommend, all in one place.',
    'Recomendações de': 'Recommendations from a',
    'amiga': 'friend',
    'Só entra aqui o que eu uso de verdade.': 'Only what I truly use makes it here.',
    'Preço e estoque mudam direto na loja, então dá uma conferida antes de comprar.': 'Prices and stock change all the time, so double-check before you buy.',
    'Loja': 'Store',
    'Categoria': 'Category',
    'Todas': 'All',
    'Tudo': 'All',
    'Acessórios': 'Accessories',
    'Beleza': 'Beauty',
    'Gravação': 'Filming',
    'Cozinha': 'Kitchen',
    'Sobre os': 'About the',
    'Só entra aqui o que eu uso ou usaria de verdade. Preço e estoque mudam direto na loja, então dá uma conferida antes de comprar.': 'Only things I actually use (or would) make it here. Prices and stock change all the time, so double-check before you buy.',
    'Nada por aqui com esse filtro ainda.': 'Nothing here with this filter yet.',
    'ver na Shopee ↗': 'see on Shopee ↗',
    'Secador Gokoco 5 em 1': 'Gokoco 5-in-1 hair dryer',
    'alta velocidade, com escova e modeladores': 'high-speed, with brush and styling attachments',
    'Microfone de lapela Hollyland Lark M2': 'Hollyland Lark M2 lavalier mic',
    'sem fio, pra celular e câmera': 'wireless, for phone and camera',
    'Kit 2 Softbox 50x70 + tripé 2,10m': '2-softbox kit 50x70 + 2.10m stands',
    'luz suave pra gravar em casa': 'soft light for filming at home',
    'Luz de LED RGB Ulanzi VL49': 'Ulanzi VL49 RGB LED light',
    'pequena e magnética': 'small and magnetic',
    'Tripé selfie Basike': 'Basike selfie tripod',
    '160cm, com controle remoto': '160cm, with remote control',
    'Fone de ouvido Basike': 'Basike earbuds',
    'bluetooth, encaixe aberto na orelha': 'bluetooth, open-ear fit'
  };
  var PADROES = [
    [/^(\d+)% de desconto$/, function (m, n) { return n + '% off'; }],
    [/^Logo da (.+)$/, function (m, marca) { return marca + ' logo'; }],
    [/^(\d+) produtos?$/, function (m, n) { return n + (n === '1' ? ' product' : ' products'); }],
    // título do filtro, ex.: "Shopee · Gravação"
    [/^(.+) · (.+)$/, function (m, a, b) { return (EN[a] || a) + ' · ' + (EN[b] || b); }]
  ];
  var ATRIBUTOS = ['alt', 'aria-label'];

  var idioma = 'pt';
  var originais = new WeakMap();
  var attrOriginais = new WeakMap();

  function traduz(texto) {
    var chave = texto.trim().replace(/\s+/g, ' ');
    if (!chave) return null;
    if (EN[chave] !== undefined) return EN[chave];
    for (var i = 0; i < PADROES.length; i++) {
      if (PADROES[i][0].test(chave)) return chave.replace(PADROES[i][0], PADROES[i][1]);
    }
    return null;
  }
  // mantém os espaços em volta do texto (ex.: "Coisas que eu " + indico)
  function comEspacos(orig, novo) {
    return orig.match(/^\s*/)[0] + novo + orig.match(/\s*$/)[0];
  }

  function noTexto(no) {
    var atual = no.nodeValue;
    var salvo = originais.get(no);
    // se o código trocou o texto (ex.: "copiado!"), esse passa a ser o original
    if (!salvo || (atual !== salvo.pt && atual !== salvo.en)) {
      salvo = { pt: atual, en: null };
      originais.set(no, salvo);
    }
    if (salvo.en === null) {
      var en = traduz(salvo.pt);
      salvo.en = en === null ? salvo.pt : comEspacos(salvo.pt, en);
    }
    var novo = idioma === 'en' ? salvo.en : salvo.pt;
    if (atual !== novo) no.nodeValue = novo;
  }
  function atributos(el) {
    var salvos = attrOriginais.get(el);
    if (!salvos) { salvos = {}; attrOriginais.set(el, salvos); }
    ATRIBUTOS.forEach(function (a) {
      if (!el.hasAttribute(a)) return;
      var atual = el.getAttribute(a);
      if (!salvos[a] || (atual !== salvos[a].pt && atual !== salvos[a].en)) {
        var en = traduz(atual);
        salvos[a] = { pt: atual, en: en === null ? atual : en };
      }
      var novo = idioma === 'en' ? salvos[a].en : salvos[a].pt;
      if (atual !== novo) el.setAttribute(a, novo);
    });
    // links com versão em inglês (mensagem pronta do WhatsApp e da DM)
    if (el.hasAttribute('data-href-en')) {
      if (!el.dataset.hrefPt) el.dataset.hrefPt = el.getAttribute('href');
      el.setAttribute('href', idioma === 'en' ? el.dataset.hrefEn : el.dataset.hrefPt);
    }
  }
  function percorre(raiz) {
    if (raiz.nodeType === 3) {
      if (raiz.parentElement && !raiz.parentElement.closest('script,style')) noTexto(raiz);
      return;
    }
    if (raiz.nodeType !== 1 || raiz.closest('script,style')) return;
    atributos(raiz);
    raiz.querySelectorAll('*').forEach(function (el) { if (!el.closest('script,style')) atributos(el); });
    var w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.parentElement && !n.parentElement.closest('script,style') ? 1 : 2; }
    });
    var n;
    while ((n = w.nextNode())) noTexto(n);
  }

  var descricao = document.querySelector('meta[name="description"]');
  var descricaoPT = descricao ? descricao.content : '';
  var observador = null;

  function aplica(novo, salvar) {
    idioma = novo;
    document.documentElement.lang = novo === 'en' ? 'en' : 'pt-BR';
    if (descricao) descricao.content = novo === 'en' ? 'Tatiele Milani, UGC creator and influencer in Curitiba, Brazil. Portfolio, coupons and the things I recommend.' : descricaoPT;
    if (observador) observador.disconnect();
    percorre(document.body);
    document.querySelectorAll('.idioma button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === novo); });
    if (salvar) { try { localStorage.setItem('idioma', novo); } catch (e) {} }
    // o que aparecer depois (produtos filtrados, "copiado!") também é traduzido
    observador = new MutationObserver(function (lista) {
      observador.disconnect();
      lista.forEach(function (m) {
        if (m.type === 'attributes') atributos(m.target);
        else m.addedNodes.forEach(percorre);
      });
      observador.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ATRIBUTOS });
    });
    observador.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ATRIBUTOS });
  }

  document.querySelectorAll('.idioma button').forEach(function (b) {
    b.addEventListener('click', function () { if (b.dataset.lang !== idioma) aplica(b.dataset.lang, true); });
  });

  // Abre em inglês se a pessoa escolheu antes (aqui ou no portfólio) ou se o link tiver ?lang=en
  var inicial = 'pt';
  try { inicial = localStorage.getItem('idioma') || 'pt'; } catch (e) {}
  var doLink = new URLSearchParams(location.search).get('lang');
  if (doLink === 'en' || doLink === 'pt') inicial = doLink;
  if (inicial === 'en') aplica('en', false);
})();
