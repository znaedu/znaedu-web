const ROUTES = {
  academy: "./academy",
  "bon-plan-229": "./bon-plan-229",
  "school-control": "./school-control"
};

function openUniverse(route) {
  const target = ROUTES[route] || route;
  if (target) {
    window.location.href = target;
  }
}

function bindUniverseButtons() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      openUniverse(this.dataset.route);
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  bindUniverseButtons();
});
