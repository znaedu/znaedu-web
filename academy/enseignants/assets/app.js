/* ============================================================
   ZNA ENSEIGNANTS
   Zénith Nova Academy

   Architecture :
   ZNAEDU global account
        ↓
   Roles / permissions
        ↓
   ZNA Enseignants

   Parcours :
   Ordre → Promotion → Discipline → Dossier pédagogique

   IMPORTANT :
   - Aucun système d'inscription local ici.
   - Aucun système de connexion local ici.
   - Aucun School Control ici.
   - Mondo Quiz n'est pas modifié.
============================================================ */


/* ============================================================
   SUPABASE
============================================================ */

const SUPABASE_URL =
  'https://dpxghtjhjylofxhmnfxf.supabase.co';

const SUPABASE_KEY =
  'sb_publishable_sH-gCONkuPsuGPE5zpgHwg_u4e0rup1';

const sb = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true
    }
  }
);


/* ============================================================
   CONSTANTES
============================================================ */

const TEACHER_ROLE_CODE = 'TEACHER';

const ZNAEDU_HOME =
  window.location.origin + '/znaedu-web/';


/* ============================================================
   ORDRES D'ENSEIGNEMENT
============================================================ */

const ORDERS = {

  maternelle: {
    id: 'maternelle',
    title: 'Maternelle',
    description:
      'Enseignement préscolaire et développement global de l’enfant.',
    icon: 'M',
    levels: [
      {
        id: 'petite-section',
        name: 'Petite section',
        short: 'PS'
      },
      {
        id: 'moyenne-section',
        name: 'Moyenne section',
        short: 'MS'
      },
      {
        id: 'grande-section',
        name: 'Grande section',
        short: 'GS'
      }
    ]
  },

  primaire: {
    id: 'primaire',
    title: 'Primaire',
    description:
      'Enseignement primaire du CI au CM2.',
    icon: 'P',
    levels: [
      {
        id: 'ci',
        name: 'CI',
        short: 'CI'
      },
      {
        id: 'cp',
        name: 'CP',
        short: 'CP'
      },
      {
        id: 'ce1',
        name: 'CE1',
        short: 'CE1'
      },
      {
        id: 'ce2',
        name: 'CE2',
        short: 'CE2'
      },
      {
        id: 'cm1',
        name: 'CM1',
        short: 'CM1'
      },
      {
        id: 'cm2',
        name: 'CM2',
        short: 'CM2'
      }
    ]
  },

  secondaire: {
    id: 'secondaire',
    title: 'Secondaire général',
    description:
      'Enseignement secondaire général de la 6e à la Terminale.',
    icon: 'S',
    levels: [
      {
        id: '6e',
        name: '6e',
        short: '6e'
      },
      {
        id: '5e',
        name: '5e',
        short: '5e'
      },
      {
        id: '4e',
        name: '4e',
        short: '4e'
      },
      {
        id: '3e',
        name: '3e',
        short: '3e'
      },
      {
        id: '2nde',
        name: '2nde',
        short: '2nde'
      },
      {
        id: '1ere',
        name: '1ère',
        short: '1ère'
      },
      {
        id: 'terminale',
        name: 'Terminale',
        short: 'Tle'
      }
    ]
  },

  technique: {
    id: 'technique',
    title: 'Technique & professionnel',
    description:
      'Enseignements techniques, technologiques et formations professionnelles.',
    icon: 'T',
    levels: [
      {
        id: 'technique-formation',
        name: 'Promotions techniques',
        short: 'TECH'
      },
      {
        id: 'professionnel-formation',
        name: 'Promotions professionnelles',
        short: 'PRO'
      }
    ]
  },

  superieur: {
    id: 'superieur',
    title: 'Supérieur',
    description:
      'Enseignement supérieur, universitaire et professionnel.',
    icon: 'U',
    levels: [
      {
        id: 'licence-1',
        name: 'Licence 1',
        short: 'L1'
      },
      {
        id: 'licence-2',
        name: 'Licence 2',
        short: 'L2'
      },
      {
        id: 'licence-3',
        name: 'Licence 3',
        short: 'L3'
      },
      {
        id: 'master-1',
        name: 'Master 1',
        short: 'M1'
      },
      {
        id: 'master-2',
        name: 'Master 2',
        short: 'M2'
      },
      {
        id: 'doctorat',
        name: 'Doctorat',
        short: 'DOC'
      }
    ]
  }

};


/* ============================================================
   DISCIPLINES CONNUES
============================================================ */

const DISCIPLINE_FALLBACK = {

  maternelle: [
    {
      code: 'MAT_LANG_COMM',
      name: 'Langage et communication'
    },
    {
      code: 'MAT_MOTRICITE',
      name: 'Activités motrices'
    },
    {
      code: 'MAT_ARTS',
      name: 'Activités artistiques'
    },
    {
      code: 'MAT_EVEIL',
      name: 'Activités d’éveil'
    }
  ],

  primaire: [
    {
      code: 'PR_FR',
      name: 'Français'
    },
    {
      code: 'PR_MATH',
      name: 'Mathématiques'
    },
    {
      code: 'PR_ES',
      name: 'Éducation sociale'
    },
    {
      code: 'PR_EST',
      name: 'Éducation scientifique et technologique'
    },
    {
      code: 'PR_EA',
      name: 'Éducation artistique'
    }
  ],

  secondaire: [
    {
      code: 'SEC_FR',
      name: 'Français'
    },
    {
      code: 'SEC_MATH',
      name: 'Mathématiques'
    },
    {
      code: 'SEC_ANGLAIS',
      name: 'Anglais'
    },
    {
      code: 'SEC_ALLEMAND',
      name: 'Allemand'
    },
    {
      code: 'SEC_ESPAGNOL',
      name: 'Espagnol'
    },
    {
      code: 'SEC_HG',
      name: 'Histoire-Géographie'
    },
    {
      code: 'SEC_SVT',
      name: 'Sciences de la Vie et de la Terre'
    },
    {
      code: 'SEC_PC',
      name: 'Physique-Chimie'
    },
    {
      code: 'SEC_PHILO',
      name: 'Philosophie'
    },
    {
      code: 'SEC_EPS',
      name: 'Éducation physique et sportive'
    }
  ],

  technique: [
    {
      code: 'TECH_GEN',
      name: 'Enseignements techniques et technologiques'
    },
    {
      code: 'PROF_GEN',
      name: 'Formation professionnelle et métiers'
    }
  ],

  superieur: [
    {
      code: 'SUP_DISCIPLINAIRE',
      name: 'Discipline universitaire selon filière'
    },
    {
      code: 'SUP_PEDAGOGIE',
      name: 'Pédagogie universitaire'
    },
    {
      code: 'METHODOLOGIE_UNIVERSITAIRE',
      name: 'Méthodologie universitaire'
    }
  ]

};


/* ============================================================
   DOSSIER PÉDAGOGIQUE
============================================================ */

const DOSSIER_TABS = [

  {
    id: 'programme',
    title: 'Programme',
    description:
      'Programme officiel, objectifs généraux et organisation annuelle.'
  },

  {
    id: 'competences',
    title: 'Compétences',
    description:
      'Compétences disciplinaires, transdisciplinaires et transversales.'
  },

  {
    id: 'contenus',
    title: 'Contenus',
    description:
      'Contenus d’enseignement organisés selon la promotion et la discipline.'
  },

  {
    id: 'capacites',
    title: 'Capacités & habiletés',
    description:
      'Capacités et habiletés que l’apprenant doit progressivement développer.'
  },

  {
    id: 'situations',
    title: 'Situations d’apprentissage',
    description:
      'Situations permettant de mobiliser les apprentissages dans des contextes pertinents.'
  },

  {
    id: 'strategies',
    title: 'Stratégies pédagogiques',
    description:
      'Approches, méthodes et stratégies utilisables pour conduire les apprentissages.'
  },

  {
    id: 'consignes',
    title: 'Consignes',
    description:
      'Consignes, tâches et instructions destinées aux apprenants.'
  },

  {
    id: 'deroulement',
    title: 'Déroulement',
    description:
      'Organisation détaillée d’une séance ou d’une séquence pédagogique.'
  },

  {
    id: 'synthese',
    title: 'Synthèse / trace écrite',
    description:
      'Synthèses, traces écrites et éléments essentiels à retenir.'
  },

  {
    id: 'evaluation',
    title: 'Évaluation',
    description:
      'Évaluations diagnostiques, formatives et sommatives.'
  },

  {
    id: 'remediation',
    title: 'Remédiation',
    description:
      'Identification des difficultés et organisation des activités de remédiation.'
  },

  {
    id: 'supports',
    title: 'Supports & références',
    description:
      'Documents, ressources, références et sources utiles à cette discipline.'
  },

  {
    id: 'progression',
    title: 'Ma progression',
    description:
      'Suivi de ce qui a été enseigné, de ce qui est en cours et de ce qui reste à traiter.'
  }

];


/* ============================================================
   ÉTAT DE L'APPLICATION
============================================================ */

const state = {

  user: null,
  roles: [],

  selectedOrder: null,
  selectedLevel: null,
  selectedDiscipline: null,

  disciplines: [],
  resources: [],
  professionalThemes: [],

  activeDossierTab: 'programme'

};


/* ============================================================
   DOM
============================================================ */

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  Array.from(document.querySelectorAll(selector));


/* ============================================================
   UTILITAIRES
============================================================ */

function escapeHtml(value) {

  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


function slug(value) {

  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}


/* ============================================================
   AUTHENTIFICATION
============================================================ */

async function getCurrentUser() {

  const {
    data,
    error
  } = await sb.auth.getSession();

  if (error) {
    console.error(error);
    return null;
  }

  return data?.session?.user || null;
}


async function loadUserRoles() {

  const {
    data,
    error
  } = await sb.rpc('core_get_my_roles');

  if (error) {

    console.error(
      'Impossible de récupérer les rôles :',
      error
    );

    return [];
  }

  return Array.isArray(data)
    ? data
    : [];
}


function hasTeacherRole(roles) {

  return roles.some(
    role => role.role_code === TEACHER_ROLE_CODE
  );
}


/* ============================================================
   INITIALISATION
============================================================ */

async function init() {

  try {

    showLoading(true);

    const user = await getCurrentUser();

    if (!user) {

      /*
       * IMPORTANT :
       * ZNA Enseignants ne possède pas son propre écran
       * d'inscription ou de connexion.
       *
       * L'authentification appartient au portail général ZNAEDU.
       */

      window.location.href = ZNAEDU_HOME;

      return;
    }


    state.user = user;


    const roles = await loadUserRoles();

    state.roles = roles;


    if (!hasTeacherRole(roles)) {

      showLoading(false);

      $('#accessDenied').classList.remove('hidden');

      return;
    }


    renderUser();

    renderOrders();

    renderProfessionalThemes();

    bindGlobalEvents();

    showLoading(false);

    showView('home');

  } catch (error) {

    console.error(error);

    showLoading(false);

    $('#accessDenied').classList.remove('hidden');

  }

}


/* ============================================================
   AFFICHAGE UTILISATEUR
============================================================ */

function renderUser() {

  const metadata =
    state.user?.user_metadata || {};

  const name =
    metadata.full_name ||
    metadata.name ||
    state.user?.email?.split('@')[0] ||
    'Enseignant';

  const email =
    state.user?.email ||
    'Compte ZNAEDU';

  $('#userName').textContent = name;
  $('#userEmail').textContent = email;

  const avatar =
    metadata.avatar_url ||
    metadata.picture;

  if (avatar) {

    $('#userAvatar').innerHTML =
      `<img src="${escapeHtml(avatar)}" alt="Photo de profil">`;

  } else {

    $('#userAvatar').textContent =
      name.charAt(0).toUpperCase();

  }


  $('#profilePanel').innerHTML = `

    <div class="profile-card">

      <div class="profile-avatar">
        ${escapeHtml(name.charAt(0).toUpperCase())}
      </div>

      <div class="profile-main">

        <span class="profile-label">
          COMPTE ZNAEDU
        </span>

        <h2>
          ${escapeHtml(name)}
        </h2>

        <p>
          ${escapeHtml(email)}
        </p>

      </div>

    </div>


    <div class="profile-roles">

      <h3>Rôles autorisés</h3>

      <div class="role-list">

        ${
          state.roles.length
            ? state.roles.map(role => `
                <div class="role-item">
                  <strong>
                    ${escapeHtml(role.role_name || role.role_code)}
                  </strong>

                  <span>
                    ${escapeHtml(role.scope || 'platform')}
                  </span>
                </div>
              `).join('')
            : `
              <div class="empty-message">
                Aucun rôle disponible.
              </div>
            `
        }

      </div>

    </div>

  `;
}


/* ============================================================
   NAVIGATION PRINCIPALE
============================================================ */

function bindGlobalEvents() {

  $$('.nav-item').forEach(button => {

    button.addEventListener(
      'click',
      () => {

        const view =
          button.dataset.view;

        showView(view);

      }
    );

  });


  $('#mobileMenuButton')
    .addEventListener(
      'click',
      () => {

        $('#sidebar')
          .classList.toggle('mobile-open');

      }
    );


  $('#logoutButton')
    .addEventListener(
      'click',
      logout
    );


  $('#backToZnaedu')
    .addEventListener(
      'click',
      () => {
        window.location.href = ZNAEDU_HOME;
      }
    );


  $$('.order-card').forEach(card => {

    card.addEventListener(
      'click',
      () => {

        selectOrder(
          card.dataset.order
        );

        showView('teachings');

      }
    );

  });

}


function showView(view) {

  $$('.view').forEach(panel => {

    panel.classList.add('hidden');

  });


  const target =
    document.querySelector(
      `[data-view-panel="${view}"]`
    );

  if (target) {
    target.classList.remove('hidden');
  }


  $$('.nav-item').forEach(button => {

    button.classList.toggle(
      'active',
      button.dataset.view === view
    );

  });


  const labels = {

    home: 'Accueil',
    teachings: 'Mes enseignements',
    progress: 'Ma progression',
    professional: 'Vie professionnelle',
    profile: 'Mon profil'

  };

  $('#currentSectionLabel').textContent =
    labels[view] || 'ZNA Enseignants';


  $('#sidebar')
    .classList.remove('mobile-open');

}


/* ============================================================
   ORDRES
============================================================ */

function renderOrders() {

  $('#ordersGrid').innerHTML =
    Object.values(ORDERS)
      .map(order => `

        <button
          type="button"
          class="selection-card order-selection"
          data-order-id="${escapeHtml(order.id)}"
        >

          <span class="selection-icon">
            ${escapeHtml(order.icon)}
          </span>

          <span class="selection-content">

            <strong>
              ${escapeHtml(order.title)}
            </strong>

            <small>
              ${escapeHtml(order.description)}
            </small>

          </span>

          <span class="selection-arrow">
            →
          </span>

        </button>

      `)
      .join('');


  $$('.order-selection').forEach(button => {

    button.addEventListener(
      'click',
      () => {

        selectOrder(
          button.dataset.orderId
        );

      }
    );

  });

}


/* ============================================================
   SÉLECTION DE L'ORDRE
============================================================ */

function selectOrder(orderId) {

  const order =
    ORDERS[orderId];

  if (!order) {
    return;
  }


  state.selectedOrder = order;
  state.selectedLevel = null;
  state.selectedDiscipline = null;
  state.disciplines = [];


  /*
   * Étape 1 :
   * Toutes les promotions/niveaux de l'ordre choisi
   * doivent apparaître.
   */

  renderLevels(order);

  hideStep('step-orders');
  showStep('step-levels');

  hideStep('step-disciplines');
  hideStep('step-dossier');

  updateBreadcrumb();

}


/* ============================================================
   PROMOTIONS / NIVEAUX
============================================================ */

function renderLevels(order) {

  $('#levelsGrid').innerHTML =
    order.levels
      .map(level => `

        <button
          type="button"
          class="selection-card level-selection"
          data-level-id="${escapeHtml(level.id)}"
        >

          <span class="selection-icon">
            ${escapeHtml(level.short)}
          </span>

          <span class="selection-content">

            <strong>
              ${escapeHtml(level.name)}
            </strong>

            <small>
              ${escapeHtml(order.title)}
            </small>

          </span>

          <span class="selection-arrow">
            →
          </span>

        </button>

      `)
      .join('');


  $$('.level-selection').forEach(button => {

    button.addEventListener(
      'click',
      () => {

        selectLevel(
          button.dataset.levelId
        );

      }
    );

  });

}


/* ============================================================
   SÉLECTION DU NIVEAU
============================================================ */

async function selectLevel(levelId) {

  const level =
    state.selectedOrder?.levels.find(
      item => item.id === levelId
    );

  if (!level) {
    return;
  }


  state.selectedLevel = level;
  state.selectedDiscipline = null;


  /*
   * Les disciplines sont chargées après
   * la sélection de la promotion.
   */

  await loadDisciplines();

  renderDisciplines();

  hideStep('step-levels');
  showStep('step-disciplines');

  hideStep('step-dossier');

  updateBreadcrumb();

}


/* ============================================================
   DISCIPLINES
============================================================ */

async function loadDisciplines() {

  const orderId =
    state.selectedOrder?.id;

  const fallback =
    DISCIPLINE_FALLBACK[orderId] || [];


  /*
   * On essaie d'abord de charger les disciplines
   * depuis Supabase.
   */

  try {

    const {
      data,
      error
    } = await sb
      .from('teacher_disciplines')
      .select('*')
      .eq('is_active', true)
      .order('name', {
        ascending: true
      });


    if (error) {
      throw error;
    }


    const databaseDisciplines =
      Array.isArray(data)
        ? data
        : [];


    const filtered =
      databaseDisciplines.filter(
        discipline =>
          disciplineMatchesOrder(
            discipline,
            orderId
          )
      );


    /*
     * Si la base contient les disciplines,
     * elles sont utilisées.
     *
     * Sinon, le jeu de secours est utilisé.
     */

    state.disciplines =
      filtered.length
        ? filtered
        : fallback.map(item => ({
            code: item.code,
            name: item.name,
            id: item.code
          }));

  } catch (error) {

    console.warn(
      'Chargement des disciplines depuis Supabase impossible.',
      error
    );

    state.disciplines =
      fallback.map(item => ({
        code: item.code,
        name: item.name,
        id: item.code
      }));

  }

}


/* ============================================================
   FILTRE DES DISCIPLINES
============================================================ */

function disciplineMatchesOrder(
  discipline,
  orderId
) {

  const scope =
    String(
      discipline.level_scope ||
      discipline.order_scope ||
      discipline.education_order ||
      discipline.order_code ||
      ''
    ).toLowerCase();


  const code =
    String(
      discipline.code ||
      ''
    ).toUpperCase();


  if (!scope) {

    if (
      orderId === 'maternelle' &&
      code.startsWith('MAT_')
    ) {
      return true;
    }

    if (
      orderId === 'primaire' &&
      code.startsWith('PR_')
    ) {
      return true;
    }

    if (
      orderId === 'secondaire' &&
      code.startsWith('SEC_')
    ) {
      return true;
    }

    if (
      orderId === 'technique' &&
      (
        code.startsWith('TECH_') ||
        code.startsWith('PROF_')
      )
    ) {
      return true;
    }

    if (
      orderId === 'superieur' &&
      code.startsWith('SUP_')
    ) {
      return true;
    }

    return (
      code === 'DIDACTIQUE_DISCIPLINAIRE' ||
      code === 'PEDAGOGIE_GENERALE' ||
      code === 'METHODOLOGIE_UNIVERSITAIRE'
    );

  }


  const normalized =
    slug(scope);


  const aliases = {

    maternelle: [
      'maternelle',
      'prescolaire',
      'prescolaire-maternelle'
    ],

    primaire: [
      'primaire'
    ],

    secondaire: [
      'secondaire',
      'secondaire-general',
      'secondaire-general-'
    ],

    technique: [
      'technique',
      'professionnel',
      'technique-professionnel',
      'technique-et-professionnel'
    ],

    superieur: [
      'superieur',
      'enseignement-superieur',
      'universitaire'
    ]

  };


  if (
    aliases[orderId]?.includes(normalized)
  ) {
    return true;
  }


  return false;
}


/* ============================================================
   AFFICHAGE DES DISCIPLINES
============================================================ */

function renderDisciplines() {

  if (!state.disciplines.length) {

    $('#disciplinesGrid').innerHTML = `

      <div class="empty-message full-width">
        Aucune discipline n'est actuellement disponible
        pour cette promotion.
      </div>

    `;

    return;
  }


  $('#disciplinesGrid').innerHTML =
    state.disciplines
      .map((discipline, index) => `

        <button
          type="button"
          class="selection-card discipline-selection"
          data-discipline-id="${escapeHtml(
            discipline.id ||
            discipline.code ||
            index
          )}"
        >

          <span class="discipline-number">
            ${String(index + 1).padStart(2, '0')}
          </span>

          <span class="selection-content">

            <strong>
              ${escapeHtml(
                discipline.name ||
                discipline.title ||
                'Discipline'
              )}
            </strong>

            <small>
              ${escapeHtml(
                state.selectedLevel?.name || ''
              )}
            </small>

          </span>

          <span class="selection-arrow">
            →
          </span>

        </button>

      `)
      .join('');


  $$('.discipline-selection').forEach(button => {

    button.addEventListener(
      'click',
      () => {

        selectDiscipline(
          button.dataset.disciplineId
        );

      }
    );

  });

}


/* ============================================================
   SÉLECTION DISCIPLINE
============================================================ */

async function selectDiscipline(
  disciplineId
) {

  const discipline =
    state.disciplines.find(
      item =>
        String(
          item.id ||
          item.code
        ) === String(disciplineId)
    );


  if (!discipline) {
    return;
  }


  state.selectedDiscipline =
    discipline;

  state.activeDossierTab =
    'programme';


  await loadResources();

  renderDossier();

  hideStep('step-disciplines');
  showStep('step-dossier');

  updateBreadcrumb();

}


/* ============================================================
   DOSSIER PÉDAGOGIQUE
============================================================ */

function renderDossier() {

  const disciplineName =
    state.selectedDiscipline?.name ||
    state.selectedDiscipline?.title ||
    'Discipline';


  const levelName =
    state.selectedLevel?.name ||
    'Promotion';


  const orderName =
    state.selectedOrder?.title ||
    'Ordre';


  $('#dossierPanel').innerHTML = `

    <div class="dossier-header">

      <div>

        <span class="eyebrow">
          DOSSIER PÉDAGOGIQUE
        </span>

        <h3>
          ${escapeHtml(disciplineName)}
        </h3>

        <p>
          ${escapeHtml(orderName)}
          ·
          ${escapeHtml(levelName)}
        </p>

      </div>

      <button
        type="button"
        id="backToDisciplines"
        class="secondary-button"
      >
        ← Disciplines
      </button>

    </div>


    <div class="dossier-layout">

      <aside class="dossier-tabs">

        ${
          DOSSIER_TABS
            .map(tab => `

              <button
                type="button"
                class="dossier-tab ${
                  state.activeDossierTab === tab.id
                    ? 'active'
                    : ''
                }"
                data-tab="${escapeHtml(tab.id)}"
              >
                ${escapeHtml(tab.title)}
              </button>

            `)
            .join('')
        }

      </aside>


      <div
        id="dossierContent"
        class="dossier-content"
      ></div>

    </div>

  `;


  $$('.dossier-tab').forEach(button => {

    button.addEventListener(
      'click',
      () => {

        state.activeDossierTab =
          button.dataset.tab;

        renderDossier();

      }
    );

  });


  $('#backToDisciplines')
    .addEventListener(
      'click',
      () => {

        showStep('step-disciplines');
        hideStep('step-dossier');

        updateBreadcrumb();

      }
    );


  renderDossierContent();

}


/* ============================================================
   CONTENU DU DOSSIER
============================================================ */

function renderDossierContent() {

  const tab =
    DOSSIER_TABS.find(
      item =>
        item.id === state.activeDossierTab
    );


  if (!tab) {
    return;
  }


  const container =
    $('#dossierContent');


  if (!container) {
    return;
  }


  if (tab.id === 'supports') {

    renderResourcesInsideDossier();

    return;
  }


  if (tab.id === 'progression') {

    container.innerHTML = `

      <div class="content-card">

        <span class="eyebrow">
          PROGRESSION
        </span>

        <h3>
          Ma progression
        </h3>

        <p>
          Cette partie permettra de suivre le contenu déjà traité,
          le contenu en cours, la prochaine séance et le contenu
          restant à traiter pour cette discipline et cette promotion.
        </p>

        <div class="progress-placeholder">

          <div>
            <strong>Contenu enseigné</strong>
            <span>À renseigner</span>
          </div>

          <div>
            <strong>Contenu en cours</strong>
            <span>À renseigner</span>
          </div>

          <div>
            <strong>Prochaine séance</strong>
            <span>À renseigner</span>
          </div>

          <div>
            <strong>Contenu restant</strong>
            <span>À renseigner</span>
          </div>

        </div>

      </div>

    `;

    return;
  }


  container.innerHTML = `

    <div class="content-card">

      <span class="eyebrow">
        ${escapeHtml(tab.title)}
      </span>

      <h3>
        ${escapeHtml(tab.title)}
      </h3>

      <p>
        ${escapeHtml(tab.description)}
      </p>

      <div class="course-context">

        <div>
          <span>Ordre</span>
          <strong>
            ${escapeHtml(
              state.selectedOrder?.title || ''
            )}
          </strong>
        </div>

        <div>
          <span>Promotion</span>
          <strong>
            ${escapeHtml(
              state.selectedLevel?.name || ''
            )}
          </strong>
        </div>

        <div>
          <span>Discipline</span>
          <strong>
            ${escapeHtml(
              state.selectedDiscipline?.name ||
              state.selectedDiscipline?.title ||
              ''
            )}
          </strong>
        </div>

      </div>

      <div class="pedagogical-note">

        <strong>
          Espace pédagogique contextualisé
        </strong>

        <p>
          Les informations affichées ici sont rattachées
          à la discipline et à la promotion actuellement sélectionnées.
        </p>

      </div>

    </div>

  `;

}


/* ============================================================
   DOCUMENTATION / SUPPORTS
   IMPORTANT :
   Elle n'est plus une rubrique indépendante.
   Elle appartient au dossier sélectionné.
============================================================ */

async function loadResources() {

  state.resources = [];


  const disciplineId =
    state.selectedDiscipline?.id ||
    state.selectedDiscipline?.code;


  if (!disciplineId) {
    return;
  }


  try {

    const {
      data,
      error
    } = await sb
      .from('teacher_discipline_resources')
      .select('*')
      .eq(
        'discipline_id',
        disciplineId
      )
      .order(
        'created_at',
        {
          ascending: false
        }
      );


    if (error) {
      throw error;
    }


    state.resources =
      Array.isArray(data)
        ? data
        : [];

  } catch (error) {

    console.warn(
      'Impossible de charger les ressources :',
      error
    );

  }

}


function renderResourcesInsideDossier() {

  const container =
    $('#dossierContent');


  if (!container) {
    return;
  }


  const resources =
    state.resources;


  container.innerHTML = `

    <div class="content-card">

      <span class="eyebrow">
        DOCUMENTATION CONTEXTUELLE
      </span>

      <h3>
        Supports & références
      </h3>

      <p>
        Ressources associées à
        <strong>
          ${escapeHtml(
            state.selectedDiscipline?.name ||
            state.selectedDiscipline?.title ||
            ''
          )}
        </strong>
        pour
        <strong>
          ${escapeHtml(
            state.selectedLevel?.name || ''
          )}
        </strong>.
      </p>


      <div class="resources-list">

        ${
          resources.length
            ? resources.map(resource => `

                <article class="resource-item">

                  <div class="resource-type">
                    ${escapeHtml(
                      resource.resource_type ||
                      'Ressource'
                    )}
                  </div>

                  <div class="resource-main">

                    <h4>
                      ${escapeHtml(
                        resource.title ||
                        'Ressource pédagogique'
                      )}
                    </h4>

                    ${
                      resource.content
                        ? `
                          <p>
                            ${escapeHtml(
                              resource.content
                            )}
                          </p>
                        `
                        : ''
                    }

                    ${
                      resource.source_name
                        ? `
                          <small>
                            Source :
                            ${escapeHtml(
                              resource.source_name
                            )}
                          </small>
                        `
                        : ''
                    }

                  </div>

                  ${
                    resource.source_url
                      ? `
                        <a
                          class="resource-link"
                          href="${escapeHtml(
                            resource.source_url
                          )}"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ouvrir →
                        </a>
                      `
                      : ''
                  }

                </article>

              `).join('')

            : `
                <div class="empty-message">
                  Aucune ressource enregistrée pour cette discipline
                  et cette promotion.
                </div>
              `
        }

      </div>

    </div>

  `;

}


/* ============================================================
   VIE PROFESSIONNELLE
============================================================ */

async function loadProfessionalThemes() {

  try {

    const {
      data,
      error
    } = await sb
      .from('teacher_professional_themes')
      .select('*')
      .eq('status', 'published')
      .order(
        'created_at',
        {
          ascending: false
        }
      );


    if (error) {
      throw error;
    }


    state.professionalThemes =
      Array.isArray(data)
        ? data
        : [];

  } catch (error) {

    console.warn(
      'Impossible de charger les thèmes professionnels.',
      error
    );

    state.professionalThemes = [];

  }

}


async function renderProfessionalThemes() {

  await loadProfessionalThemes();

  const container =
    $('#professionalThemes');


  if (!state.professionalThemes.length) {

    container.innerHTML = `

      <div class="empty-workspace">

        <div class="empty-icon">
          ◆
        </div>

        <h2>
          Ressources professionnelles
        </h2>

        <p>
          Les ressources de développement professionnel
          seront affichées ici.
        </p>

      </div>

    `;

    return;
  }


  container.innerHTML =
    state.professionalThemes
      .map(theme => `

        <article class="professional-card">

          <span class="eyebrow">
            ${escapeHtml(
              theme.theme_type ||
              'THÈME PROFESSIONNEL'
            )}
          </span>

          <h3>
            ${escapeHtml(
              theme.title
            )}
          </h3>

          ${
            theme.context
              ? `
                <p>
                  ${escapeHtml(
                    theme.context
                  )}
                </p>
              `
              : ''
          }

          ${
            theme.objectives
              ? `
                <div>
                  <strong>
                    Objectifs
                  </strong>

                  <p>
                    ${escapeHtml(
                      theme.objectives
                    )}
                  </p>
                </div>
              `
              : ''
          }

        </article>

      `)
      .join('');

}


/* ============================================================
   BREADCRUMB
============================================================ */

function updateBreadcrumb() {

  const parts = [
    'Enseignant'
  ];


  if (state.selectedOrder) {

    parts.push(
      state.selectedOrder.title
    );

  }


  if (state.selectedLevel) {

    parts.push(
      state.selectedLevel.name
    );

  }


  if (state.selectedDiscipline) {

    parts.push(
      state.selectedDiscipline.name ||
      state.selectedDiscipline.title
    );

  }


  $('#breadcrumb').innerHTML =
    parts.map(
      (part, index) => {

        const isLast =
          index === parts.length - 1;

        return `
          <span class="${isLast ? 'current' : ''}">
            ${escapeHtml(part)}
          </span>
          ${
            !isLast
              ? '<b>›</b>'
              : ''
          }
        `;

      }
    ).join('');

}


/* ============================================================
   ÉTAPES
============================================================ */

function showStep(id) {

  const element =
    document.getElementById(id);

  if (element) {
    element.classList.remove('hidden');
  }

}


function hideStep(id) {

  const element =
    document.getElementById(id);

  if (element) {
    element.classList.add('hidden');
  }

}


/* ============================================================
   LOADING
============================================================ */

function showLoading(show) {

  $('#loadingScreen')
    .classList.toggle(
      'hidden',
      !show
    );

}


/* ============================================================
   DÉCONNEXION
============================================================ */

async function logout() {

  await sb.auth.signOut();

  window.location.href =
    ZNAEDU_HOME;

}


/* ============================================================
   SURVEILLANCE DE SESSION
============================================================ */

sb.auth.onAuthStateChange(
  async (event, session) => {

    if (
      event === 'SIGNED_OUT' ||
      !session
    ) {

      window.location.href =
        ZNAEDU_HOME;

    }

  }
);


/* ============================================================
   DÉMARRAGE
============================================================ */

document.addEventListener(
  'DOMContentLoaded',
  init
);
