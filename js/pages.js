// L'ordre de cette liste définit l'enchaînement des galeries :
// dernière photo d'une page → première photo de la page suivante (lightbox).
const pages = [
  { url: "action_vtt.html", title: "Action - VTT" },
  { url: "action_vtt_nb.html", title: "Action - VTT N&B" },
  { url: "action_file.html", title: "Action - Filés" },
  { url: "action_divers.html", title: "Action - Divers" },
  { url: "nature_animaux.html", title: "Nature - Animaux" },
  { url: "nature_insectes.html", title: "Nature - Insectes" },
  { url: "nature_flore.html", title: "Nature - Flore" },
  { url: "nature_eau.html", title: "Nature - Eau" },
  { url: "paysage_montagne.html", title: "Paysages - Montagnes" },
  { url: "paysage_mer.html", title: "Paysages - Mer" },
  { url: "paysage_sunset.html", title: "Paysages - Sunset" },
  { url: "paysage_automne.html", title: "Paysages - Automne" },
  { url: "paysage_divers.html", title: "Paysages - Divers" },
  { url: "paysage_urbain.html", title: "Paysages - Urbain" },
  { url: "divers_nuit.html", title: "Divers - Nuit" },
  { url: "divers_bivouac.html", title: "Divers - Bivouac" }
];

function initPageNav() {
  const currentPage = decodeURIComponent(window.location.pathname.split("/").pop());
  const pageIndex = pages.findIndex(p => p.url === currentPage);
  if (pageIndex === -1) return;

  const footer = document.querySelector("footer");
  if (!footer) return;

  const nav = document.createElement("nav");
  nav.className = "page-nav";

  if (pages[pageIndex - 1]) {
    const prev = document.createElement("a");
    prev.className = "prev";
    prev.href = pages[pageIndex - 1].url;
    prev.textContent = "← " + pages[pageIndex - 1].title;
    nav.appendChild(prev);
  }

  if (pages[pageIndex + 1]) {
    const next = document.createElement("a");
    next.className = "next";
    next.href = pages[pageIndex + 1].url;
    next.textContent = pages[pageIndex + 1].title + " →";
    nav.appendChild(next);
  }

  footer.parentNode.insertBefore(nav, footer);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPageNav);
} else {
  initPageNav();
}
