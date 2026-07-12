const CACHE_NAME = "minhas-contas-v12";

const ARQUIVOS = [
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./favicon.ico",
  "./favicon-32.png",
  "./favicon-16.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(
        chaves
          .filter((chave) => chave !== CACHE_NAME)
          .map((chave) => caches.delete(chave))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  const ehFonteDeIcones =
    url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com");

  if (ehFonteDeIcones) {
    // Ícones (Material Symbols): busca na rede e guarda em cache à parte,
    // pra funcionar offline depois do primeiro carregamento.
    event.respondWith(
      caches.open(CACHE_NAME + "-fontes").then((cache) =>
        cache.match(event.request).then((emCache) => {
          const buscar = fetch(event.request)
            .then((resposta) => {
              cache.put(event.request, resposta.clone());
              return resposta;
            })
            .catch(() => emCache);
          return emCache || buscar;
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((resposta) => {
      return resposta || fetch(event.request);
    })
  );
});
