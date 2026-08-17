let galleryImages = [];
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelectorAll(".gallery-vertical img");
  gallery.forEach(img => {
    img.addEventListener("click", () => openLightbox(img));
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  gallery.forEach(img => observer.observe(img));

  const lightboxImg = document.getElementById("lightbox-img");
  if (lightboxImg) {
    lightboxImg.addEventListener("click", event => {
      event.stopPropagation();
      const rect = lightboxImg.getBoundingClientRect();
      const goNext = event.clientX > rect.left + rect.width / 2;
      changeImage(goNext ? 1 : -1, event);
    });
  }

  document.addEventListener("keydown", event => {
    const lightbox = document.getElementById("lightbox");
    if (!lightbox || lightbox.style.display !== "flex") return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      changeImage(1, event);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      changeImage(-1, event);
    } else if (event.key === "Escape") {
      lightbox.style.display = "none";
    }
  });

  ensureLightboxCaption();
  ensureLightboxHints();
  openLightboxFromQuery();
});

function getCaption(img) {
  const next = img.nextElementSibling;
  return next && next.tagName === "FIGCAPTION" ? next.textContent.trim() : "";
}

function ensureLightboxCaption() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox || document.getElementById("lightbox-caption")) return;

  const caption = document.createElement("p");
  caption.id = "lightbox-caption";
  caption.className = "lightbox-caption";
  lightbox.appendChild(caption);
}

function ensureLightboxHints() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox || document.querySelector(".lightbox-hint-next")) return;

  const prevHint = document.createElement("span");
  prevHint.className = "lightbox-hint lightbox-hint-prev";
  const nextHint = document.createElement("span");
  nextHint.className = "lightbox-hint lightbox-hint-next";
  lightbox.appendChild(prevHint);
  lightbox.appendChild(nextHint);
}

function updateGalleryHints() {
  const prevHint = document.querySelector(".lightbox-hint-prev");
  const nextHint = document.querySelector(".lightbox-hint-next");
  if (!prevHint || !nextHint) return;

  const prevPage = currentIndex <= 0 ? getAdjacentPage(-1) : null;
  const nextPage = currentIndex >= galleryImages.length - 1 ? getAdjacentPage(1) : null;

  prevHint.textContent = prevPage ? "← " + prevPage.title : "";
  nextHint.textContent = nextPage ? nextPage.title + " →" : "";
  prevHint.hidden = !prevPage;
  nextHint.hidden = !nextPage;
}

function showLightboxImage(img) {
  const lightboxImg = document.getElementById("lightbox-img");
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt || "";

  const caption = document.getElementById("lightbox-caption");
  if (caption) caption.textContent = getCaption(img);

  updateGalleryHints();
}

function openLightbox(element) {
  galleryImages = Array.from(document.querySelectorAll(".gallery-vertical img"));
  currentIndex = galleryImages.indexOf(element);

  ensureLightboxCaption();
  ensureLightboxHints();
  showLightboxImage(element);
  document.getElementById("lightbox").style.display = "flex";
}

function closeLightbox(event) {
  if (event.target.id !== "lightbox") return;
  document.getElementById("lightbox").style.display = "none";
}

function changeImage(direction, event) {
  if (event) event.stopPropagation();

  const nextIndex = currentIndex + direction;

  if (nextIndex >= galleryImages.length) {
    if (goToAdjacentGallery(1, "first")) return;
    currentIndex = 0;
  } else if (nextIndex < 0) {
    if (goToAdjacentGallery(-1, "last")) return;
    currentIndex = galleryImages.length - 1;
  } else {
    currentIndex = nextIndex;
  }

  showLightboxImage(galleryImages[currentIndex]);
}

function getAdjacentPage(direction) {
  if (typeof pages === "undefined" || !pages.length) return null;

  const currentPage = decodeURIComponent(window.location.pathname.split("/").pop());
  const pageIndex = pages.findIndex(p => p.url === currentPage);
  if (pageIndex === -1) return null;

  const nextIndex = (pageIndex + direction + pages.length) % pages.length;
  if (nextIndex === pageIndex) return null;
  return pages[nextIndex];
}

function goToAdjacentGallery(direction, lightboxPos) {
  const adjacent = getAdjacentPage(direction);
  if (!adjacent) return false;
  window.location.href = adjacent.url + "?lightbox=" + lightboxPos;
  return true;
}

function openLightboxFromQuery() {
  const lightboxPos = new URLSearchParams(window.location.search).get("lightbox");
  if (!lightboxPos) return;

  galleryImages = Array.from(document.querySelectorAll(".gallery-vertical img"));
  if (!galleryImages.length) return;

  let index = 0;
  if (lightboxPos === "last") index = galleryImages.length - 1;
  else if (lightboxPos !== "first") index = parseInt(lightboxPos, 10) || 0;

  openLightbox(galleryImages[index]);
  history.replaceState({}, "", window.location.pathname);
}
