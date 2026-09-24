const SUPABASE_URL =
  "https://dpxghtjhjylofxhmnfxf.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_QklC1lULFCU5wsl52CgNQg_V1iKQKE";

const supabase =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


const fallbackPlatforms = [

  {
    code: "academy",
    name: "Zénith Nova Academy",
    short_description: "Apprendre • Enseigner • Progresser",
    description:
      "Cours, quiz et espaces dédiés aux apprenants et enseignants.",
    route: "/academy",
    icon: "🎓"
  },

  {
    code: "bon_plan_229",
    name: "BON PLAN 229",
    short_description: "Acheter • Vendre • Développer",
    description:
      "Marketplace pour découvrir, acheter, vendre et développer son activité.",
    route: "/bon-plan-229",
    icon: "🛍️"
  },

  {
    code: "school_control",
    name: "SCHOOL CONTROL",
    short_description: "Organiser • Suivre • Contrôler",
    description:
      "Gestion et suivi des établissements, enseignants, apprenants et présences.",
    route: "/school-control",
    icon: "🏫"
  }

];


const $ = id =>
  document.getElementById(id);


function showToast(message) {

  $("toast").textContent = message;

  $("toast").classList.remove("hidden");

  setTimeout(() => {
    $("toast").classList.add("hidden");
  }, 3500);

}


function renderPlatforms(items = fallbackPlatforms) {

  $("platforms").innerHTML = items.map(p => `

    <a
      class="platform-card"
      href="${p.route || "#"}"
    >

      <div class="platform-icon">
        ${p.icon || "◈"}
      </div>

      <h3>
        ${p.name}
      </h3>

      <p>
        <strong>
          ${p.short_description || ""}
        </strong>
      </p>

      <p>
        ${p.description || ""}
      </p>

      <span class="route">
        Ouvrir l'espace →
      </span>

    </a>

  `).join("");

}


async function loadPlatforms() {

  /*
   * Les trois univers sont immédiatement affichés
   * grâce au catalogue de secours.
   */
  renderPlatforms();

  try {

    const {
      data,
      error
    } = await supabase
      .from("platform_catalog")
      .select(
        "code,name,short_description,description,route,icon"
      )
      .eq("status", "active")
      .order("sort_order");

    if (!error && data && data.length) {

      renderPlatforms(data);

    }

  } catch (e) {

    console.warn(
      "Catalogue distant indisponible, fallback conservé.",
      e
    );

  }

}


async function loadPortal() {

  try {

    const {
      data,
      error
    } = await supabase.functions.invoke(
      "znaedu-portal"
    );

    if (error) {
      throw error;
    }

    if (
      data?.home ||
      data?.universes ||
      data?.actions
    ) {

      renderPersonal(data);

    }

  } catch (e) {

    console.warn(
      "Portail personnel non chargé.",
      e
    );

  }

}


function renderPersonal(data) {

  $("personalSection")
    .classList
    .remove("hidden");


  const home =
    data.home || {};

  const universes =
    data.universes || {};

  const actions =
    Array.isArray(data.actions)
      ? data.actions
      : [];


  const cart =
    universes
      .bon_plan_229
      ?.cart_items || 0;

  const orders =
    universes
      .bon_plan_229
      ?.orders || 0;

  const courses =
    universes
      .academy
      ?.completed_courses || 0;


  $("personalContent").innerHTML = `

    <div class="stats">

      <div class="stat">
        <strong>${courses}</strong>
        <span>Cours terminés</span>
      </div>

      <div class="stat">
        <strong>${orders}</strong>
        <span>Commandes</span>
      </div>

      <div class="stat">
        <strong>${cart}</strong>
        <span>Articles dans le panier</span>
      </div>

    </div>

    <div class="actions">

      ${actions
        .slice(0, 8)
        .map(a => `

          <a
            class="btn secondary"
            href="${a.route || "#"}"
          >
            ${a.label || a.code || "Ouvrir"}
          </a>

        `)
        .join("")}

    </div>

  `;

}


async function search() {

  const q =
    $("searchInput")
      .value
      .trim();


  if (!q) {

    $("searchResults")
      .classList
      .add("hidden");

    return;

  }


  $("searchResults")
    .classList
    .remove("hidden");

  $("searchResults")
    .textContent =
    "Recherche en cours…";


  try {

    const {
      data,
      error
    } = await supabase.rpc(
      "search_public_znaedu",
      {
        query_text: q,
        result_limit: 8
      }
    );


    if (error) {
      throw error;
    }


    if (!data?.length) {

      $("searchResults")
        .textContent =
        "Aucun résultat trouvé.";

      return;

    }


    $("searchResults").innerHTML =
      data
        .map(x => `

          <div style="padding:8px 0">

            <strong>
              ${x.title || x.name || "Résultat"}
            </strong>

            <div style="color:#667085">

              ${x.description || x.content || ""}

            </div>

          </div>

        `)
        .join("");


  } catch (e) {

    $("searchResults")
      .textContent =
      "La recherche en ligne est momentanément indisponible.";

  }

}


$("loginBtn").onclick = () => {

  $("loginModal")
    .classList
    .remove("hidden");

  $("emailInput")
    .focus();

};


$("closeModal").onclick = () => {

  $("loginModal")
    .classList
    .add("hidden");

};


$("loginModal")
  .addEventListener(
    "click",
    e => {

      if (
        e.target.id ===
        "loginModal"
      ) {

        $("loginModal")
          .classList
          .add("hidden");

      }

    }
  );


$("sendOtpBtn").onclick =
  async () => {

    const email =
      $("emailInput")
        .value
        .trim();


    if (!email) {

      $("loginStatus")
        .textContent =
        "Entrez une adresse e-mail valide.";

      return;

    }


    $("loginStatus")
      .textContent =
      "Envoi du lien…";


    const {
      error
    } =
      await supabase.auth
        .signInWithOtp({

          email,

          options: {

            emailRedirectTo:
              location.href

          }

        });


    $("loginStatus")
      .textContent = error
        ? error.message
        : "Lien envoyé. Consultez votre e-mail.";

  };


$("logoutBtn").onclick =
  async () => {

    await supabase.auth.signOut();

    location.reload();

  };


$("searchBtn").onclick =
  search;


$("searchInput")
  .addEventListener(
    "keydown",
    e => {

      if (e.key === "Enter") {

        search();

      }

    }
  );


$("assistBtn").onclick =
  () => {

    showToast(
      "L'assistance ZNAEDU sera accessible depuis votre espace connecté."
    );

  };


supabase.auth
  .onAuthStateChange(
    (_event, session) => {

      if (session) {

        loadPortal();

      }

    }
  );


renderPlatforms();

loadPlatforms();


supabase.auth
  .getSession()
  .then(
    ({ data }) => {

      if (data.session) {

        loadPortal();

      }

    }
  );
