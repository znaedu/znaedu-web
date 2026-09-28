const SUPABASE_URL = 'https://dpxghtjhjylofxhmnfxf.supabase.co';

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


/* =========================================================
   ETAT GLOBAL
========================================================= */

let currentUser = null;

let currentOrder = null;
let currentLevel = null;
let currentDiscipline = null;

let disciplines = [];
let resources = [];
let professionalThemes = [];


/* =========================================================
   CATALOGUE DES NIVEAUX
========================================================= */

const LEVELS = {

  maternelle: [
    {
      id: 'petite_section',
      name: 'Petite section',
      description: 'Premier niveau de la maternelle'
    },
    {
      id: 'moyenne_section',
      name: 'Moyenne section',
      description: 'Deuxième niveau de la maternelle'
    },
    {
      id: 'grande_section',
      name: 'Grande section',
      description: 'Troisième niveau de la maternelle'
    }
  ],

  primaire: [
    {
      id: 'CI',
      name: 'CI',
      description: 'Cours d\'initiation'
    },
    {
      id: 'CP',
      name: 'CP',
      description: 'Cours préparatoire'
    },
    {
      id: 'CE1',
      name: 'CE1',
      description: 'Cours élémentaire 1'
    },
    {
      id: 'CE2',
      name: 'CE2',
      description: 'Cours élémentaire 2'
    },
    {
      id: 'CM1',
      name: 'CM1',
      description: 'Cours moyen 1'
    },
    {
      id: 'CM2',
      name: 'CM2',
      description: 'Cours moyen 2'
    }
  ],

  secondaire_general: [
    { id: '6e', name: '6e', description: 'Sixième' },
    { id: '5e', name: '5e', description: 'Cinquième' },
    { id: '4e', name: '4e', description: 'Quatrième' },
    { id: '3e', name: '3e', description: 'Troisième' },
    { id: '2nde', name: '2nde', description: 'Seconde' },
    { id: '1ere', name: '1ère', description: 'Première' },
    { id: 'terminale', name: 'Terminale', description: 'Terminale' }
  ],

  secondaire_technique: [
    {
      id: 'technique',
      name: 'Enseignements techniques',
      description: 'Disciplines techniques et technologiques'
    },
    {
      id: 'professionnel',
      name: 'Formation professionnelle',
      description: 'Métiers, modules et compétences professionnelles'
    }
  ],

  superieur: [
    {
      id: 'licence_1',
      name: 'Licence 1',
      description: 'Première année'
    },
    {
      id: 'licence_2',
      name: 'Licence 2',
      description: 'Deuxième année'
    },
    {
      id: 'licence_3',
      name: 'Licence 3',
      description: 'Troisième année'
    },
    {
      id: 'master_1',
      name: 'Master 1',
      description: 'Première année de master'
    },
    {
      id: 'master_2',
      name: 'Master 2',
      description: 'Deuxième année de master'
    },
    {
      id: 'doctorat',
      name: 'Doctorat',
      description: 'Formation doctorale'
    }
  ]

};


/* =========================================================
   NOMS DES ORDRES
========================================================= */

const ORDER_NAMES = {
  maternelle: 'Maternelle',
  primaire: 'Primaire',
  secondaire_general: 'Secondaire général',
  secondaire_technique: 'Technique & professionnel',
  superieur: 'Supérieur'
};


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener('DOMContentLoaded', async () => {

  bindNavigation();
  bindOrderCards();
  bindProfileMenu();
  bindCourseTabs();
  bindResourceFilters();

  await restoreSession();

});


/* =========================================================
   SESSION
========================================================= */

async function restoreSession() {

  const {
    data: { session }
  } = await sb.auth.getSession();

  if (session) {

    await startTeacherSession(session);

  } else {

    showLogin();

  }

}


sb.auth.onAuthStateChange(async (event, session) => {

  if (session) {

    await startTeacherSession(session);

  } else {

    showLogin();

  }

});


async function startTeacherSession(session) {

  currentUser = session.user;

  const hasTeacherRole = await checkTeacherRole();

  if (!hasTeacherRole) {

    showLoginMessage(
      'Ce compte ne possède pas encore le rôle Enseignant.'
    );

    await sb.auth.signOut();

    return;
  }

  updateAccountInterface();

  await loadTeacherData();

  showTeacherApp();

}


/* =========================================================
   ROLE
========================================================= */

async function checkTeacherRole() {

  const { data, error } =
    await sb.rpc('core_get_my_roles');

  if (error) {

    console.error(error);

    return false;
  }

  const roles = Array.isArray(data) ? data : [];

  return roles.some(
    role => role.role_code === 'TEACHER'
  );

}


/* =========================================================
   DONNEES
========================================================= */

async function loadTeacherData() {

  const disciplinesResult = await sb
    .from('teacher_disciplines')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (!disciplinesResult.error) {

    disciplines = disciplinesResult.data || [];

  }


  const resourcesResult = await sb
    .from('teacher_discipline_resources')
    .select(`
      *,
      teacher_disciplines (
        id,
        code,
        name,
        level_scope
      )
    `)
    .eq('status', 'published')
    .order('title');

  if (!resourcesResult.error) {

    resources = resourcesResult.data || [];

  }


  const themesResult = await sb
    .from('teacher_professional_themes')
    .select('*')
    .eq('status', 'published')
    .order('title');

  if (!themesResult.error) {

    professionalThemes = themesResult.data || [];

  }

}


/* =========================================================
   INTERFACE COMPTE
========================================================= */

function updateAccountInterface() {

  const metadata = currentUser.user_metadata || {};

  const name =
    metadata.full_name ||
    metadata.name ||
    currentUser.email?.split('@')[0] ||
    'Enseignant';

  const email = currentUser.email || '';

  const firstLetter =
    name.trim().charAt(0).toUpperCase() || 'E';

  document.getElementById('teacher-name').textContent = name;
  document.getElementById('teacher-email').textContent = email;

  document.getElementById('avatar').textContent = firstLetter;

  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-email').textContent = email;
  document.getElementById('profile-avatar').textContent = firstLetter;

  document.getElementById('welcome-name').textContent =
    name ? `, ${name.split(' ')[0]}` : '';

}


/* =========================================================
   LOGIN
========================================================= */

document.getElementById('google-login')
  .addEventListener('click', async () => {

    const redirectTarget =
      window.location.origin + window.location.pathname;

    const { error } =
      await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTarget,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

    if (error) {

      showLoginMessage(error.message);

    }

  });


function showLogin() {

  document
    .getElementById('login-screen')
    .classList.remove('hidden');

  document
    .getElementById('teacher-app')
    .classList.add('hidden');

}


function showTeacherApp() {

  document
    .getElementById('login-screen')
    .classList.add('hidden');

  document
    .getElementById('teacher-app')
    .classList.remove('hidden');

}


function showLoginMessage(message) {

  const element =
    document.getElementById('login-message');

  element.textContent = message;

}


/* =========================================================
   NAVIGATION
========================================================= */

function bindNavigation() {

  document
    .querySelectorAll('.nav-item')
    .forEach(button => {

      button.addEventListener('click', () => {

        const view = button.dataset.view;

        openView(view);

      });

    });

}


function openView(view) {

  document
    .querySelectorAll('.view')
    .forEach(section => {
      section.classList.add('hidden');
    });

  const target =
    document.getElementById(`view-${view}`);

  if (target) {

    target.classList.remove('hidden');

  }


  document
    .querySelectorAll('.nav-item')
    .forEach(button => {

      button.classList.toggle(
        'active',
        button.dataset.view === view
      );

    });


  if (view === 'teachings') {

    showOrderSelection();

  }

  if (view === 'resources') {

    renderResources();

  }

  if (view === 'professional') {

    renderProfessionalThemes();

  }

}


/* =========================================================
   ORDRES D'ENSEIGNEMENT
========================================================= */

function bindOrderCards() {

  document
    .querySelectorAll('.order-card')
    .forEach(card => {

      card.addEventListener('click', () => {

        const order = card.dataset.order;

        openTeachingOrder(order);

      });

    });

}


function openTeachingOrder(order) {

  currentOrder = order;
  currentLevel = null;
  currentDiscipline = null;

  openView('teachings');

  showLevelSelection();

}


/* =========================================================
   SELECTION ORDRE
========================================================= */

function showOrderSelection() {

  currentOrder = null;
  currentLevel = null;
  currentDiscipline = null;

  const container =
    document.getElementById('teaching-selector');

  document.getElementById('breadcrumb').innerHTML = '';

  container.innerHTML = `

    <div class="selector-header">
      <p class="eyebrow">ÉTAPE 1</p>
      <h1>Choisir mon ordre d'enseignement</h1>
      <p>
        Sélectionnez l'ordre dans lequel vous enseignez.
        Vous serez ensuite guidé vers votre niveau puis votre discipline.
      </p>
    </div>

    <div class="selection-grid">

      ${Object.entries(ORDER_NAMES)
        .map(([key, value]) => `
          <button class="selection-card"
                  data-select-order="${key}">
            <strong>${value}</strong>
            <span>
              ${getOrderDescription(key)}
            </span>
          </button>
        `)
        .join('')}

    </div>

  `;


  container
    .querySelectorAll('[data-select-order]')
    .forEach(button => {

      button.addEventListener('click', () => {

        openTeachingOrder(
          button.dataset.selectOrder
        );

      });

    });

}


function getOrderDescription(order) {

  const descriptions = {

    maternelle:
      'Choisir ensuite la section de maternelle.',

    primaire:
      'Choisir ensuite CI, CP, CE1, CE2, CM1 ou CM2.',

    secondaire_general:
      'Choisir ensuite 6e, 5e, 4e, 3e, 2nde, 1ère ou Terminale.',

    secondaire_technique:
      'Choisir le domaine technique ou professionnel.',

    superieur:
      'Choisir votre niveau universitaire puis votre discipline.'
  };

  return descriptions[order] || '';

}


/* =========================================================
   NIVEAUX
========================================================= */

function showLevelSelection() {

  const levels = LEVELS[currentOrder] || [];

  const container =
    document.getElementById('teaching-selector');

  updateBreadcrumb([
    {
      label: 'Mes enseignements',
      action: showOrderSelection
    },
    {
      label: ORDER_NAMES[currentOrder],
      current: true
    }
  ]);


  container.innerHTML = `

    <div class="selector-header">

      <p class="eyebrow">ÉTAPE 2</p>

      <h1>
        Choisir votre niveau ou promotion
      </h1>

      <p>
        Vous êtes dans :
        <strong>${ORDER_NAMES[currentOrder]}</strong>.
        Sélectionnez maintenant votre niveau.
      </p>

    </div>

    <div class="selection-grid">

      ${levels.map(level => `

        <button
          class="selection-card"
          data-level="${level.id}">

          <strong>${level.name}</strong>

          <span>
            ${level.description}
          </span>

        </button>

      `).join('')}

    </div>

  `;


  container
    .querySelectorAll('[data-level]')
    .forEach(button => {

      button.addEventListener('click', () => {

        currentLevel = button.dataset.level;

        showDisciplineSelection();

      });

    });

}


/* =========================================================
   DISCIPLINES
========================================================= */

function showDisciplineSelection() {

  const container =
    document.getElementById('teaching-selector');

  const filtered =
    getDisciplinesForOrder(currentOrder);


  updateBreadcrumb([
    {
      label: 'Mes enseignements',
      action: showOrderSelection
    },
    {
      label: ORDER_NAMES[currentOrder],
      action: showLevelSelection
    },
    {
      label: currentLevel,
      current: true
    }
  ]);


  container.innerHTML = `

    <div class="selector-header">

      <p class="eyebrow">ÉTAPE 3</p>

      <h1>
        Choisir votre discipline
      </h1>

      <p>
        ${ORDER_NAMES[currentOrder]}
        → ${currentLevel}
      </p>

    </div>

    ${
      filtered.length
      ? `
        <div class="selection-grid">

          ${filtered.map(discipline => `

            <button
              class="selection-card"
              data-discipline="${discipline.id}">

              <strong>${escapeHtml(discipline.name)}</strong>

              <span>
                ${discipline.source_authority
                  ? escapeHtml(discipline.source_authority)
                  : 'Ressources pédagogiques'}
              </span>

            </button>

          `).join('')}

        </div>
      `
      : `
        <div class="empty-state">

          <div class="empty-icon">📚</div>

          <h3>
            Discipline en cours de référencement
          </h3>

          <p>
            La discipline correspondant à votre choix
            sera affichée dès qu'elle sera disponible
            dans le référentiel enseignant.
          </p>

        </div>
      `
    }

  `;


  container
    .querySelectorAll('[data-discipline]')
    .forEach(button => {

      button.addEventListener('click', () => {

        const id = button.dataset.discipline;

        currentDiscipline =
          disciplines.find(d => d.id === id);

        openCourseWorkspace();

      });

    });

}


/* =========================================================
   FILTRE DISCIPLINES
========================================================= */

function getDisciplinesForOrder(order) {

  return disciplines.filter(discipline => {

    return (
      discipline.level_scope === order ||
      discipline.level_scope === 'all'
    );

  });

}


/* =========================================================
   DOSSIER PEDAGOGIQUE
========================================================= */

function openCourseWorkspace() {

  openView('course');

  const disciplineName =
    currentDiscipline?.name || 'Discipline';

  document.getElementById(
    'course-breadcrumb'
  ).innerHTML = `

    <button id="course-back-order">
      Mes enseignements
    </button>

    <span>›</span>

    <button id="course-back-level">
      ${escapeHtml(ORDER_NAMES[currentOrder])}
    </button>

    <span>›</span>

    <button id="course-back-discipline">
      ${escapeHtml(currentLevel)}
    </button>

    <span>›</span>

    <span class="current">
      ${escapeHtml(disciplineName)}
    </span>

  `;


  document
    .getElementById('course-back-order')
    .onclick = showOrderSelection;

  document
    .getElementById('course-back-level')
    .onclick = showLevelSelection;

  document
    .getElementById('course-back-discipline')
    .onclick = showDisciplineSelection;


  document.getElementById('course-header').innerHTML = `

    <div class="course-header">

      <p class="eyebrow">DOSSIER PÉDAGOGIQUE</p>

      <h1>${escapeHtml(disciplineName)}</h1>

      <p>
        ${escapeHtml(ORDER_NAMES[currentOrder])}
        ·
        ${escapeHtml(currentLevel)}
      </p>

      <div class="course-tags">

        <span class="tag">
          Programme
        </span>

        <span class="tag">
          Cours
        </span>

        <span class="tag">
          Évaluation
        </span>

        <span class="tag">
          Supports & références
        </span>

      </div>

    </div>

  `;


  renderCourseTab('programme');

}


function bindCourseTabs() {

  document
    .querySelectorAll('.course-menu-item')
    .forEach(button => {

      button.addEventListener('click', () => {

        renderCourseTab(
          button.dataset.courseTab
        );

      });

    });

}


function renderCourseTab(tab) {

  document
    .querySelectorAll('.course-menu-item')
    .forEach(button => {

      button.classList.toggle(
        'active',
        button.dataset.courseTab === tab
      );

    });


  const content =
    document.getElementById('course-content');


  const tabs = {

    programme: {
      title: 'Programme',
      intro:
        'Le cadre officiel et la progression du programme correspondant à votre niveau et à votre discipline.',
      items: [
        'Objectifs du programme',
        'Thèmes et unités d’apprentissage',
        'Progression annuelle',
        'Volume horaire',
        'Documents officiels de référence'
      ]
    },

    competences: {
      title: 'Compétences',
      intro:
        'Les compétences que l’apprenant doit développer à travers l’enseignement.',
      items: [
        'Compétences disciplinaires',
        'Compétences transdisciplinaires',
        'Compétences transversales',
        'Résultats d’apprentissage attendus'
      ]
    },

    contenus: {
      title: 'Contenus',
      intro:
        'Les notions, connaissances et savoirs à traiter dans le cours.',
      items: [
        'Notions essentielles',
        'Concepts',
        'Vocabulaire',
        'Connaissances à construire',
        'Prérequis'
      ]
    },

    capacites: {
      title: 'Capacités & habiletés',
      intro:
        'Ce que l’apprenant doit être capable de faire à l’issue de l’apprentissage.',
      items: [
        'Capacités attendues',
        'Habiletés',
        'Savoir-faire',
        'Performances attendues'
      ]
    },

    situations: {
      title: 'Situations d’apprentissage',
      intro:
        'Des situations permettant de mettre l’apprenant en activité et de construire les apprentissages.',
      items: [
        'Situation de départ',
        'Situation-problème',
        'Activités individuelles',
        'Activités de groupe',
        'Activités de consolidation'
      ]
    },

    strategies: {
      title: 'Stratégies pédagogiques',
      intro:
        'Les approches et méthodes que l’enseignant peut mobiliser selon le contenu et le niveau.',
      items: [
        'Approches pédagogiques',
        'Méthodes d’enseignement',
        'Techniques d’animation',
        'Différenciation pédagogique',
        'Pédagogie inclusive'
      ]
    },

    consignes: {
      title: 'Consignes',
      intro:
        'Les consignes à donner aux apprenants pour réaliser correctement les activités.',
      items: [
        'Consignes de découverte',
        'Consignes d’activité',
        'Consignes de recherche',
        'Consignes de production',
        'Consignes d’évaluation'
      ]
    },

    deroulement: {
      title: 'Déroulement de la séance',
      intro:
        'La préparation concrète de la séance, de l’introduction jusqu’à la synthèse.',
      items: [
        'Mise en situation',
        'Annonce des objectifs',
        'Activités d’apprentissage',
        'Mise en commun',
        'Institutionnalisation',
        'Synthèse'
      ]
    },

    synthese: {
      title: 'Synthèse / trace écrite',
      intro:
        'Le contenu essentiel que l’apprenant doit retenir après la séance.',
      items: [
        'Points essentiels',
        'Définitions',
        'Règles',
        'Formules',
        'Trace écrite',
        'Résumé'
      ]
    },

    evaluation: {
      title: 'Évaluation',
      intro:
        'Les outils permettant de vérifier les apprentissages.',
      items: [
        'Évaluation diagnostique',
        'Évaluation formative',
        'Évaluation sommative',
        'Exercices',
        'Critères de réussite',
        'Barèmes et grilles'
      ]
    },

    remediation: {
      title: 'Remédiation',
      intro:
        'Les actions à mettre en œuvre lorsque les apprentissages ne sont pas suffisamment maîtrisés.',
      items: [
        'Identification des difficultés',
        'Erreurs fréquentes',
        'Activités de remédiation',
        'Exercices différenciés',
        'Réévaluation'
      ]
    },

    supports: {
      title: 'Supports de cours & références',
      intro:
        'Tous les supports associés à votre discipline et à votre niveau, avec leur provenance.',
      items: [
        'Cours et fiches de cours',
        'Manuels scolaires',
        'Guides de l’enseignant',
        'Fiches pédagogiques',
        'Exercices et activités',
        'Évaluations',
        'Documents officiels',
        'Supports audio et vidéo',
        'Références bibliographiques',
        'Sources institutionnelles'
      ]
    },

    progression: {
      title: 'Ma progression',
      intro:
        'Votre suivi personnel de l’avancement du programme.',
      items: [
        'Contenus déjà enseignés',
        'Contenu en cours',
        'Prochaine séance',
        'Contenus restant à traiter',
        'Avancement annuel'
      ]
    }

  };


  const selected = tabs[tab];

  if (!selected) return;


  content.innerHTML = `

    <h2 class="content-title">
      ${selected.title}
    </h2>

    <p class="content-intro">
      ${selected.intro}
    </p>

    <div class="structure-list">

      ${selected.items.map(item => `

        <div class="structure-item">
          ${item}
        </div>

      `).join('')}

    </div>

  `;


  if (tab === 'supports') {

    renderCourseResources(content);

  }

}


/* =========================================================
   SUPPORTS DU COURS
========================================================= */

function renderCourseResources(container) {

  const matchingResources =
    resources.filter(resource => {

      return (
        resource.discipline_id === currentDiscipline?.id
        &&
        (
          resource.level_scope === currentOrder
          ||
          resource.level_scope === 'all'
        )
      );

    });


  const resourcesHtml =
    matchingResources.length

      ? matchingResources.map(resource => `

          <div class="resource-card">

            <h3>
              ${escapeHtml(resource.title)}
            </h3>

            <div class="resource-meta">

              <span class="tag">
                ${escapeHtml(resource.resource_type || 'Support')}
              </span>

              ${
                resource.is_official
                ? `<span class="tag">Document officiel</span>`
                : ''
              }

              ${
                resource.version_label
                ? `<span class="tag">
                    ${escapeHtml(resource.version_label)}
                   </span>`
                : ''
              }

            </div>

            ${
              resource.content
              ? `<p>${escapeHtml(resource.content)}</p>`
              : ''
            }

            <div class="resource-source">

              <strong>Référence :</strong>
              ${escapeHtml(
                resource.source_name ||
                'Source non renseignée'
              )}

              ${
                resource.source_url
                ? `
                  <br>
                  <a
                    href="${escapeAttribute(resource.source_url)}"
                    target="_blank"
                    rel="noopener noreferrer">
                    Consulter la source
                  </a>
                `
                : ''
              }

              ${
                resource.reviewed_at
                ? `
                  <br>
                  <span>
                    Vérifié le :
                    ${formatDate(resource.reviewed_at)}
                  </span>
                `
                : ''
              }

            </div>

          </div>

        `).join('')

      : `

          <div class="empty-state">

            <div class="empty-icon">📚</div>

            <h3>
              Aucun support spécifique trouvé
            </h3>

            <p>
              Aucun support publié n'est encore rattaché
              à cette discipline et à cet ordre d'enseignement.
            </p>

          </div>

        `;


  container.insertAdjacentHTML(
    'beforeend',
    `
      <div class="content-box">

        <h3>
          Supports disponibles
        </h3>

        <p>
          Les ressources ci-dessous sont filtrées selon
          votre ordre d'enseignement et votre discipline.
        </p>

      </div>

      <div class="resource-list">
        ${resourcesHtml}
      </div>
    `
  );

}


/* =========================================================
   RESSOURCES GENERALES
========================================================= */

function bindResourceFilters() {

  const level =
    document.getElementById('resource-level');

  const search =
    document.getElementById('resource-search');

  level.addEventListener(
    'change',
    renderResources
  );

  search.addEventListener(
    'input',
    renderResources
  );

}


function renderResources() {

  const level =
    document.getElementById('resource-level').value;

  const search =
    document.getElementById('resource-search').value
      .trim()
      .toLowerCase();


  const filtered =
    resources.filter(resource => {

      const levelMatch =
        !level ||
        resource.level_scope === level ||
        resource.level_scope === 'all';

      const title =
        (resource.title || '').toLowerCase();

      const source =
        (resource.source_name || '').toLowerCase();

      const searchMatch =
        !search ||
        title.includes(search) ||
        source.includes(search);

      return levelMatch && searchMatch;

    });


  const container =
    document.getElementById('resource-list');


  if (!filtered.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">📚</div>

        <h3>Aucun support trouvé</h3>

        <p>
          Aucun support ne correspond aux critères sélectionnés.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    filtered.map(resource => `

      <div class="resource-card">

        <h3>
          ${escapeHtml(resource.title)}
        </h3>

        <div class="resource-meta">

          <span class="tag">
            ${escapeHtml(
              resource.resource_type || 'Support'
            )}
          </span>

          <span class="tag">
            ${escapeHtml(
              resource.level_scope || 'Tous niveaux'
            )}
          </span>

          ${
            resource.is_official
            ? `<span class="tag">
                Officiel
               </span>`
            : ''
          }

        </div>

        ${
          resource.content
          ? `<p>${escapeHtml(resource.content)}</p>`
          : ''
        }

        <div class="resource-source">

          <strong>Référence :</strong>

          ${escapeHtml(
            resource.source_name ||
            'Source non renseignée'
          )}

          ${
            resource.source_url
            ? `
              <br>
              <a
                href="${escapeAttribute(resource.source_url)}"
                target="_blank"
                rel="noopener noreferrer">
                Consulter la source
              </a>
            `
            : ''
          }

        </div>

      </div>

    `).join('');

}


/* =========================================================
   VIE PROFESSIONNELLE
========================================================= */

function renderProfessionalThemes() {

  const container =
    document.getElementById('professional-list');


  if (!professionalThemes.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">◎</div>

        <h3>Aucune ressource professionnelle disponible</h3>

        <p>
          Les thèmes professionnels seront affichés ici.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    professionalThemes.map(theme => `

      <article class="professional-card">

        <div class="resource-meta">

          <span class="tag">
            ${formatThemeType(theme.theme_type)}
          </span>

        </div>

        <h3>
          ${escapeHtml(theme.title)}
        </h3>

        ${
          theme.context
          ? `<p>${escapeHtml(theme.context)}</p>`
          : ''
        }

        ${
          theme.objectives
          ? `
            <p>
              <strong>Objectifs :</strong>
              ${escapeHtml(theme.objectives)}
            </p>
          `
          : ''
        }

        ${
          theme.references_text
          ? `
            <p>
              <strong>Références :</strong>
              ${escapeHtml(theme.references_text)}
            </p>
          `
          : ''
        }

      </article>

    `).join('');

}


function formatThemeType(type) {

  const names = {

    conseil_etablissement:
      'Conseil d’établissement',

    animation_pedagogique:
      'Animation pédagogique',

    formation_continue:
      'Formation continue',

    enseignement_superieur:
      'Enseignement supérieur'

  };

  return names[type] || type;

}


/* =========================================================
   PROFIL
========================================================= */

function bindProfileMenu() {

  const button =
    document.getElementById('profile-button');

  const menu =
    document.getElementById('profile-menu');


  button.addEventListener('click', event => {

    event.stopPropagation();

    menu.classList.toggle('hidden');

  });


  document.addEventListener('click', () => {

    menu.classList.add('hidden');

  });


  document
    .getElementById('profile-link')
    .addEventListener('click', () => {

      menu.classList.add('hidden');

      openView('profile');

    });


  document
    .getElementById('logout-button')
    .addEventListener('click', async () => {

      await sb.auth.signOut();

      currentUser = null;

      showLogin();

    });

}


/* =========================================================
   BREADCRUMB
========================================================= */

function updateBreadcrumb(items) {

  const container =
    document.getElementById('breadcrumb');

  container.innerHTML =
    items.map((item, index) => {

      if (item.current) {

        return `
          <span class="current">
            ${escapeHtml(item.label)}
          </span>
        `;

      }

      return `
        <button
          data-breadcrumb-index="${index}">
          ${escapeHtml(item.label)}
        </button>

        ${
          index < items.length - 1
          ? '<span>›</span>'
          : ''
        }
      `;

    }).join('');


  items.forEach((item, index) => {

    if (item.action) {

      const button =
        container.querySelector(
          `[data-breadcrumb-index="${index}"]`
        );

      if (button) {

        button.onclick = item.action;

      }

    }

  });

}


/* =========================================================
   UTILITAIRES
========================================================= */

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


function escapeAttribute(value) {

  return escapeHtml(value);

}


function formatDate(value) {

  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    'fr-FR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  );

}
