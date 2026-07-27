const container = document.querySelector(".page-container");
const pages = document.querySelectorAll(".page");
const toggleBtn = document.querySelector(".toggle-btn");
const ul = document.querySelector(".nav-list");
const overlay = document.querySelector(".overlay");
const links = document.querySelectorAll(".link");
const menuCloseOverlay = document.querySelector(".menu-close-overlay");

let pageIndex = 0;
let menuOpen = false;

//  OPEN / CLOSE MENU 
function openMenu() {
  menuOpen = true;

  // Scroll la page active vers le haut pour qu'au menu,
  // on voit exactement la hero section (image de fond cadrée)
  const activeScroll = pages[pageIndex].querySelector(".page-scroll");
  activeScroll.scrollTo({ top: 0, behavior: "smooth" });

  toggleBtn.classList.add("active");
  container.classList.add("active");
  ul.classList.add("show");
  menuCloseOverlay.classList.add("active");
}

function closeMenu() {
  menuOpen = false;

  toggleBtn.classList.remove("active");
  container.classList.remove("active");
  ul.classList.remove("show");
  menuCloseOverlay.classList.remove("active");
}

//  TOGGLE AU CLIC SUR LE BOUTON 
toggleBtn.addEventListener("click", () => {
  if (menuOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

//  FERMER EN CLIQUANT SUR LA PAGE 
menuCloseOverlay.addEventListener("click", () => {
  closeMenu();
});

//  NAVIGATION VIA LES LIENS 
links.forEach((item) => {
  item.addEventListener("click", () => {
    const index = parseInt(item.dataset.index, 10);
    closeMenu();
    nextPage(index);
  });
});

//  CHANGEMENT DE PAGE AVEC ANIMATION 
function nextPage(index) {
  if (index === pageIndex) return;

  overlay.style.animation = `slide 1s linear 1`;

  setTimeout(() => {
    pages[pageIndex].classList.remove("active");

    // Remettre le scroll en haut pour la nouvelle page
    const newScroll = pages[index].querySelector(".page-scroll");
    newScroll.scrollTop = 0;

    pages[index].classList.add("active");
    pageIndex = index;
  }, 500);

  setTimeout(() => {
    overlay.style.animation = null;
  }, 1000);
}
