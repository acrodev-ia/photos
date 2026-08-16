let galleryImages = [];
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelectorAll('.gallery-vertical img');
  gallery.forEach(img => {
    img.addEventListener('click', () => openLightbox(img));
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  gallery.forEach(img => observer.observe(img));
});

function openLightbox(element) {
  galleryImages = Array.from(document.querySelectorAll('.gallery-vertical img'));
  currentIndex = galleryImages.indexOf(element);

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  lightboxImg.src = element.src;
  lightbox.style.display = 'flex';
}

function closeLightbox(event) {
  if (event.target.id === 'lightbox-img') return;
  document.getElementById('lightbox').style.display = 'none';
}

function changeImage(direction) {
  event.stopPropagation(); // <-- empêche le clic de remonter et de fermer la lightbox

  currentIndex += direction;
  if (currentIndex < 0) currentIndex = galleryImages.length - 1;
  if (currentIndex >= galleryImages.length) currentIndex = 0;

  const lightboxImg = document.getElementById('lightbox-img');
  lightboxImg.src = galleryImages[currentIndex].src;
}
