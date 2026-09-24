const SUPABASE_URL =
  "https://dpxghtjhjylofxhmnfxf.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_QklC1lULFCU5wsl52CgNQg_V1iKQKE";

const supabase =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


const $ = id =>
  document.getElementById(id);


const esc = value =>
  String(value ?? "").replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char])
  );


/*
 * Les univers sont déjà dans index.html.
 * Cette fonction ne les efface jamais.
 */
async function loadPlatforms() {

  try {

    const {
      data,
      error
    } = await supabase
      .from("platform_catalog")
      .select(
        "code,name,short_description,route,icon,status"
      )
      .eq("status", "active")
      .order("sort_order");


    if (error || !data || !data.length) {
      return;
    }


    /*
     * Si Supabase répond correctement,
     * on peut enrichir les cartes.
     * Sinon les cartes HTML restent intactes.
     */
    const container =
      $("platforms");


    if (!container) {
      return;
    }


    container.innerHTML =
      data.map(platform => `

        <article class="card">

          <div class="small">
            ${esc(platform.icon || "ZNAEDU")}
          </div>

          <h3>
            ${esc(platform.name)}
          </h3>

          <p>
            ${esc(
              platform.short_description || ""
            )}
          </p>

          <button
            data-route="${esc(
              platform.route || "#"
            )}"
            class="btn btn-light open-platform"
            type="button"
          >
            Ouvrir
          </button>

        </article>

      `).join("");


    bindPlatformButtons();

  } catch (error) {

    /*
     * Très important :
     * ne rien remplacer en cas d'erreur.
     * Les cartes HTML restent visibles.
     */

    console.warn(
      "Catalogue Supabase indisponible.",
      error
    );

  }

}


function bindPlatformButtons() {

  document
    .querySelectorAll(".open-platform")
    .forEach(button => {

      button.onclick = () => {

        const route =
          button.dataset.route;


        if (
          route &&
          route !== "#"
        ) {

          location.href = route;

        }

      };

    });

}


async function loadPortal() {

  try {

    const {
      data: {
        session
      }
    } =
      await supabase.auth.getSession();


    if (!session) {

      $("sessionState")
        .textContent =
        "Visiteur";

      $("personal")
        .classList
        .add("hidden");

      return;

    }


    $("sessionState")
      .textContent =
      "Connecté";


    $("personal")
      .classList
      .remove("hidden");


    const {
      data,
      error
    } =
      await supabase.functions.invoke(
        "znaedu-portal"
      );


    if (
      error ||
      !data
    ) {

      $("snapshot").innerHTML = `

        <div class="card">

          <h3>
            Espace personnalisé
          </h3>

          <p>
            Votre espace est temporairement
            indisponible.
          </p>

        </div>

      `;

      return;

    }


    renderPortal(data);

  } catch (error) {

    console.warn(
      "Portail personnel indisponible.",
      error
    );

  }

}


function renderPortal(data) {

  const roles =
    data?.actions?.roles ||
    data?.home?.portal_context?.roles ||
    [];


  $("roles").innerHTML =
    (
      roles.length
        ? roles
        : ["Utilisateur"]
    )
      .map(role => `

        <span class="chip">
          ${
            esc(
              typeof role === "string"
                ? role
                : (
                    role.name ||
                    role.code ||
                    "Rôle"
                  )
            )
          }
        </span>

      `)
      .join("");


  const actions = [];


  for (
    const [key, group]
    of Object.entries(
      data?.actions || {}
    )
  ) {

    if (
      key === "roles" ||
      !group?.enabled
    ) {
      continue;
    }


    for (
      const action
      of group.actions || []
    ) {

      actions.push({
        ...action,
        key
      });

    }

  }


  $("actions").innerHTML =
    actions
      .map(action => `

        <article class="card">

          <div class="small">
            ${esc(action.key)}
          </div>

          <h3>
            ${esc(
              action.label ||
              "Accéder"
            )}
          </h3>

          <p>
            ${esc(
              action.description ||
              ""
            )}
          </p>

          <button
            data-route="${esc(
              action.route || "#"
            )}"
            class="btn btn-light open-action"
            type="button"
          >
            Accéder
          </button>

        </article>

      `)
      .join("");


  document
    .querySelectorAll(".open-action")
    .forEach(button => {

      button.onclick = () => {

        location.href =
          button.dataset.route;

      };

    });


  const universes =
    data?.universes || {};


  const metrics = [

    [
      "Academy",
      "Inscriptions",
      universes.academy?.enrollments ?? 0
    ],

    [
      "Academy",
      "Cours terminés",
      universes.academy?.completed_courses ?? 0
    ],

    [
      "BON PLAN 229",
      "Panier",
      universes.bon_plan_229?.cart_items ?? 0
    ],

    [
      "BON PLAN 229",
      "Commandes",
      universes.bon_plan_229?.orders ?? 0
    ],

    [
      "BON PLAN 229",
      "Annonces",
      universes.bon_plan_229?.seller_listings ?? 0
    ],

    [
      "SCHOOL CONTROL",
      "Enseignant",
      universes.school_control?.teacher_records ?? 0
    ],

    [
      "SCHOOL CONTROL",
      "Apprenant",
      universes.school_control?.learner_records ?? 0
    ],

    [
      "SCHOOL CONTROL",
      "Présences",
      universes.school_control?.teacher_attendance ?? 0
    ]

  ];


  $("snapshot").innerHTML =
    metrics
      .map(metric => `

        <div class="metric">

          <span>
            ${esc(metric[0])}
          </span>

          <strong>
            ${esc(metric[2])}
          </strong>

          <small>
            ${esc(metric[1])}
          </small>

        </div>

      `)
      .join("");

}


async function search() {

  const query =
    $("searchInput")
      .value
      .trim();


  if (!query) {

    $("searchResults")
      .classList
      .add("hidden");

    return;

  }


  try {

    const {
      data,
      error
    } =
      await supabase.rpc(
        "search_public_znaedu",
        {
          p_query: query,
          p_limit: 10
        }
      );


    const rows =
      Array.isArray(data)
        ? data
        : [];


    $("searchResults").innerHTML =
      error || !rows.length

        ? `
          <div class="result">
            Aucun résultat public.
          </div>
        `

        : rows
            .map(result => `

              <div class="result">

                <strong>
                  ${esc(
                    result.title ||
                    "Résultat"
                  )}
                </strong>

                <div>
                  ${esc(
                    result.summary || ""
                  )}
                </div>

                ${
                  result.route
                    ? `
                      <button
                        data-route="${esc(
                          result.route
                        )}"
                        class="btn btn-light open-result"
                        type="button"
                      >
                        Ouvrir
                      </button>
                    `
                    : ""
                }

              </div>

            `)
            .join("");


    $("searchResults")
      .classList
      .remove("hidden");


    document
      .querySelectorAll(".open-result")
      .forEach(button => {

        button.onclick = () => {

          location.href =
            button.dataset.route;

        };

      });

  } catch (error) {

    $("searchResults").innerHTML = `

      <div class="result">
        La recherche est momentanément
        indisponible.
      </div>

    `;

    $("searchResults")
      .classList
      .remove("hidden");

  }

}


$("loginBtn").onclick = () => {

  $("loginModal")
    .classList
    .remove("hidden");

};


$("closeLogin").onclick = () => {

  $("loginModal")
    .classList
    .add("hidden");

};


$("searchBtn").onclick = () => {

  $("searchInput").focus();

};


$("searchSubmit").onclick =
  search;


$("searchInput")
  .addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        search();

      }

    }
  );


$("supportBtn").onclick =
  () => {

    alert(
      "L'assistance ZNAEDU sera ouverte dans votre espace utilisateur."
    );

  };


$("logoutBtn").onclick =
  async () => {

    await supabase.auth.signOut();

    location.reload();

  };


$("sendOtp").onclick =
  async () => {

    const email =
      $("emailInput")
        .value
        .trim();


    if (!email) {

      $("loginMessage")
        .textContent =
        "Saisissez votre adresse e-mail.";

      return;

    }


    const {
      error
    } =
      await supabase.auth
        .signInWithOtp({

          email,

          options: {
            emailRedirectTo:
              location.origin
          }

        });


    $("loginMessage")
      .textContent =

      error

        ? error.message

        : "Lien de connexion envoyé. Vérifiez votre e-mail.";

  };


supabase.auth
  .onAuthStateChange(
    () => loadPortal()
  );


bindPlatformButtons();

loadPlatforms();

loadPortal();
