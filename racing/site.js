const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navWrap = document.querySelector(".nav-wrap");

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (menuButton && navWrap) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    navWrap.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    navWrap.classList.toggle("is-open", !open);
    document.body.classList.toggle("menu-open", !open);
  });

  navWrap.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });
}

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const raceGallery = document.querySelector("[data-race-gallery]");
const racePrev = document.querySelector("[data-race-prev]");
const raceNext = document.querySelector("[data-race-next]");
const raceCount = document.querySelector("[data-race-count]");

if (raceGallery && racePrev && raceNext) {
  const racePhotos = Array.from(raceGallery.querySelectorAll(".race-proof-photo"));
  const racePhotoLeft = (photo) => (
    photo.getBoundingClientRect().left
    - raceGallery.getBoundingClientRect().left
    + raceGallery.scrollLeft
  );

  const currentRacePhoto = () => {
    const left = raceGallery.scrollLeft;
    return racePhotos.reduce((closest, photo, index) => {
      const distance = Math.abs(racePhotoLeft(photo) - left);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;
  };

  const updateRaceGallery = () => {
    const index = currentRacePhoto();
    const atStart = raceGallery.scrollLeft <= 4;
    const atEnd = raceGallery.scrollLeft >= raceGallery.scrollWidth - raceGallery.clientWidth - 4;
    racePrev.disabled = atStart;
    raceNext.disabled = atEnd;
    if (raceCount) raceCount.textContent = `${index + 1} / ${racePhotos.length}`;
  };

  const moveRaceGallery = (direction) => {
    const current = currentRacePhoto();
    const target = Math.max(0, Math.min(racePhotos.length - 1, current + direction));
    raceGallery.scrollTo({ left: racePhotoLeft(racePhotos[target]), behavior: "smooth" });
  };

  racePrev.addEventListener("click", () => moveRaceGallery(-1));
  raceNext.addEventListener("click", () => moveRaceGallery(1));
  raceGallery.addEventListener("scroll", updateRaceGallery, { passive: true });
  raceGallery.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveRaceGallery(event.key === "ArrowRight" ? 1 : -1);
  });
  window.addEventListener("resize", updateRaceGallery);
  updateRaceGallery();
}
