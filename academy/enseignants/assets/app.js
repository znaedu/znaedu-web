/* =========================================================
   ZNA ENSEIGNANTS
   Espace professionnel des enseignants
   ZNAEDU - Zénith Nova Academy
   ========================================================= */

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


/* =========================================================
   UTILITAIRES
   ========================================================= */

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function $(selector) {
  return document.querySelector(selector);
}

function showMessage(message, type = 'info') {
  const box = $('#app-message');
  if (!box) return;

  box.className = `app-message ${type}`;
  box.textContent = message;
  box.hidden = false;
}

function hideMessage() {
  const box = $('#app-message');
  if (box) box.hidden = true;
}

function currentRedirectUrl() {
  return window.location.origin + window.location.pathname;
}


/* =========================================================
   AUTHENTIFICATION GOOGLE / GMAIL
   ========================================================= */

async function signInWithGoogle() {
  hideMessage();

  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: currentRedirectUrl(),
      queryParams: {
        prompt: 'select_account'
      }
    }
  });

  if (error) {
    showMessage(
      `Connexion Google impossible : ${error.message}`,
      'error'
    );
  }
}

async function signOut() {
  await sb.auth.signOut();
  window.location.reload();
}


/* =========================================================
   RÔLE ENSEIGNANT
   ========================================================= */

async function getTeacherRole() {
  const { data, error } =
    await sb.rpc('core_get_my_roles');

  if (error) {
    console.error(error);
    return {
      allowed: false,
      error: error.message,
      roles: []
    };
  }

  const roles = Array.isArray(data) ? data : [];

  const teacherRole = roles.find(
    role => role.role_code === 'TEACHER'
  );

  return {
    allowed: Boolean(teacherRole),
    role: teacherRole || null,
    roles
  };
}


/* =========================================================
   STRUCTURE DU PORTAIL
   ========================================================= */

function renderTeacherShell(user) {
  const app = $('#app');

  if (!app) return;

  const email =
    user?.email ||
    user?.user_metadata?.email ||
    '';

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    email ||
    'Enseignant';

  app.innerHTML = `
    <div class="teacher-portal">

      <header class="teacher-header">

        <div class="teacher-brand">
          <div class="teacher-brand-title">
            ZNA Enseignants
          </div>

          <div class="teacher-brand-subtitle">
            Espace professionnel enseignant
          </div>
        </div>

        <div class="teacher-account">
          <div class="teacher-account-name">
            ${escapeHTML(fullName)}
          </div>

          <div class="teacher-account-email">
            ${escapeHTML(email)}
          </div>

          <button
            id="logout-button"
            type="button"
            class="secondary-button">
            Se déconnecter
          </button>
        </div>

      </header>


      <nav class="teacher-nav" aria-label="Navigation enseignant">

        <button
          class="nav-button active"
          data-view="accueil">
          Accueil
        </button>

        <button
          class="nav-button"
          data-view="disciplines">
          Disciplines & ressources
        </button>

        <button
          class="nav-button"
          data-view="pedagogie">
          Pratiques pédagogiques
        </button>

        <button
          class="nav-button"
          data-view="professionnel">
          Vie professionnelle
        </button>

        <button
          class="nav-button"
          data-view="superieur">
          Enseignement supérieur
        </button>

        <button
          class="nav-button"
          data-view="mes-ressources">
          Mes ressources
        </button>

      </nav>


      <main id="teacher-content" class="teacher-content"></main>

    </div>
  `;

  $('#logout-button')?.addEventListener(
    'click',
    signOut
  );

  document
    .querySelectorAll('.nav-button')
    .forEach(button => {
      button.addEventListener('click', () => {

        document
          .querySelectorAll('.nav-button')
          .forEach(item =>
            item.classList.remove('active')
          );

        button.classList.add('active');

        renderView(
          button.dataset.view
        );
      });
    });

  renderView('accueil');
}


/* =========================================================
   ACCUEIL
   ========================================================= */

function renderAccueil() {

  const content = $('#teacher-content');
  if (!content) return;

  content.innerHTML = `

    <section class="page-section">

      <div class="page-heading">
        <div>
          <h1>Espace professionnel enseignant</h1>

          <p>
            Un espace consacré aux ressources, pratiques,
            formations et besoins professionnels des enseignants.
          </p>
        </div>
      </div>


      <div class="content-grid">

        <article class="content-card">

          <h2>Disciplines & ressources</h2>

          <p>
            Accédez aux ressources organisées par discipline,
            niveau d'enseignement et type de ressource.
          </p>

          <button
            class="card-button"
            data-open-view="disciplines">
            Consulter
          </button>

        </article>


        <article class="content-card">

          <h2>Pratiques pédagogiques</h2>

          <p>
            Préparation, enseignement, évaluation,
            remédiation, inclusion et accompagnement
            des apprentissages.
          </p>

          <button
            class="card-button"
            data-open-view="pedagogie">
            Ouvrir
          </button>

        </article>


        <article class="content-card">

          <h2>Vie professionnelle</h2>

          <p>
            Ressources pour les animations pédagogiques,
            conseils d'établissement et formation continue.
          </p>

          <button
            class="card-button"
            data-open-view="professionnel">
            Consulter
          </button>

        </article>


        <article class="content-card">

          <h2>Enseignement supérieur</h2>

          <p>
            Ressources liées aux cours, TD, TP,
            évaluations, pédagogie universitaire
            et recherche.
          </p>

          <button
            class="card-button"
            data-open-view="superieur">
            Ouvrir
          </button>

        </article>

      </div>


      <section class="information-panel">

        <h2>Principes de la base documentaire</h2>

        <p>
          Les ressources institutionnelles et pédagogiques
          sont distinguées des ressources créées ou adaptées
          par les enseignants.
        </p>

        <ul>
          <li>Documents institutionnels et officiels</li>
          <li>Références pédagogiques et didactiques</li>
          <li>Ressources de formation continue</li>
          <li>Ressources créées ou adaptées par les enseignants</li>
        </ul>

      </section>

    </section>
  `;

  attachViewButtons();
}


/* =========================================================
   DISCIPLINES
   ========================================================= */

async function renderDisciplines() {

  const content = $('#teacher-content');

  content.innerHTML = `

    <section class="page-section">

      <div class="page-heading">

        <div>
          <h1>Disciplines & ressources</h1>

          <p>
            Base documentaire organisée par discipline,
            niveau d'enseignement et source.
          </p>
        </div>

      </div>


      <div class="information-panel">

        <h2>Organisation des ressources</h2>

        <p>
          Chaque discipline peut disposer de ressources
          adaptées à son niveau et à son contexte
          d'enseignement.
        </p>

        <div class="tag-list">

          <span>Maternelle</span>
          <span>Primaire</span>
          <span>Secondaire général</span>
          <span>Technique</span>
          <span>Professionnel</span>
          <span>Supérieur</span>

        </div>

      </div>


      <div id="discipline-list">

        <div class="loading-state">
          Chargement des disciplines...
        </div>

      </div>

    </section>
  `;

  const { data, error } = await sb
    .from('teacher_disciplines')
    .select(`
      id,
      code,
      name,
      level_scope,
      source_authority,
      is_active
    `)
    .eq('is_active', true)
    .order('name');

  const list = $('#discipline-list');

  if (error) {

    list.innerHTML = `
      <div class="empty-state">
        <h3>Données momentanément indisponibles</h3>
        <p>
          La base des disciplines n'a pas pu être chargée.
        </p>
      </div>
    `;

    console.error(error);
    return;
  }

  if (!data || data.length === 0) {

    list.innerHTML = `
      <div class="empty-state">

        <h3>Aucune discipline enregistrée pour le moment</h3>

        <p>
          La base disciplinaire est prête à recevoir
          les disciplines et leurs ressources vérifiées.
        </p>

      </div>
    `;

    return;
  }

  list.innerHTML = data.map(discipline => `

    <article class="discipline-card">

      <div class="discipline-code">
        ${escapeHTML(discipline.code)}
      </div>

      <h3>
        ${escapeHTML(discipline.name)}
      </h3>

      <p>
        Niveau :
        ${escapeHTML(
          discipline.level_scope || 'Non précisé'
        )}
      </p>

      <p>
        Référence :
        ${escapeHTML(
          discipline.source_authority ||
          'Source à préciser'
        )}
      </p>

      <button
        class="card-button"
        data-discipline-id="${discipline.id}">
        Voir les ressources
      </button>

    </article>

  `).join('');

  document
    .querySelectorAll('[data-discipline-id]')
    .forEach(button => {

      button.addEventListener('click', () => {

        loadDisciplineResources(
          button.dataset.disciplineId
        );

      });

    });
}


/* =========================================================
   RESSOURCES D'UNE DISCIPLINE
   ========================================================= */

async function loadDisciplineResources(disciplineId) {

  const content = $('#teacher-content');

  content.innerHTML = `
    <section class="page-section">

      <button
        class="secondary-button"
        id="back-disciplines">
        ← Retour aux disciplines
      </button>

      <div id="discipline-resources">

        <div class="loading-state">
          Chargement des ressources...
        </div>

      </div>

    </section>
  `;

  $('#back-disciplines')
    ?.addEventListener(
      'click',
      renderDisciplines
    );

  const { data, error } = await sb
    .from('teacher_discipline_resources')
    .select(`
      id,
      title,
      resource_type,
      level_scope,
      source_name,
      source_url,
      content,
      version_label,
      published_at,
      reviewed_at,
      is_official,
      status
    `)
    .eq('discipline_id', disciplineId)
    .eq('status', 'published')
    .order('title');

  const container = $('#discipline-resources');

  if (error) {

    container.innerHTML = `
      <div class="empty-state">

        <h2>Ressources</h2>

        <p>
          Les ressources de cette discipline
          ne peuvent pas être chargées actuellement.
        </p>

      </div>
    `;

    console.error(error);
    return;
  }

  if (!data || data.length === 0) {

    container.innerHTML = `
      <div class="empty-state">

        <h2>Aucune ressource publiée</h2>

        <p>
          Aucune ressource vérifiée et publiée n'est
          actuellement enregistrée pour cette discipline.
        </p>

        <p>
          Aucune donnée fictive n'est affichée.
        </p>

      </div>
    `;

    return;
  }

  container.innerHTML = `

    <div class="page-heading">

      <div>
        <h1>Ressources de la discipline</h1>

        <p>
          Documents et ressources actuellement publiés
          dans la base ZNA Enseignants.
        </p>
      </div>

    </div>

    <div class="resource-list">

      ${data.map(resource => `

        <article class="resource-card">

          <div class="resource-meta">

            <span>
              ${escapeHTML(
                resource.resource_type ||
                'Ressource'
              )}
            </span>

            ${
              resource.is_official
                ? '<span>Institutionnel</span>'
                : '<span>Pédagogique</span>'
            }

          </div>

          <h2>
            ${escapeHTML(resource.title)}
          </h2>

          <p>
            Niveau :
            ${escapeHTML(
              resource.level_scope ||
              'Non précisé'
            )}
          </p>

          <p>
            Source :
            ${escapeHTML(
              resource.source_name ||
              'Non précisée'
            )}
          </p>

          ${
            resource.version_label
              ? `
                <p>
                  Version :
                  ${escapeHTML(resource.version_label)}
                </p>
              `
              : ''
          }

          ${
            resource.content
              ? `
                <div class="resource-content">
                  ${escapeHTML(resource.content)}
                </div>
              `
              : ''
          }

          ${
            resource.source_url
              ? `
                <a
                  href="${escapeHTML(resource.source_url)}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Consulter la source
                </a>
              `
              : ''
          }

        </article>

      `).join('')}

    </div>
  `;
}


/* =========================================================
   PRATIQUES PÉDAGOGIQUES
   ========================================================= */

function renderPedagogie() {

  const content = $('#teacher-content');

  content.innerHTML = `

    <section class="page-section">

      <div class="page-heading">

        <div>
          <h1>Pratiques pédagogiques</h1>

          <p>
            Ressources destinées à accompagner
            la préparation, l'enseignement et l'évaluation.
          </p>

        </div>

      </div>


      <div class="content-grid">

        <article class="content-card">

          <h2>Préparation de l'enseignement</h2>

          <ul>
            <li>Planification</li>
            <li>Préparation de cours</li>
            <li>Séquences et séances</li>
            <li>Objectifs d'apprentissage</li>
            <li>Supports pédagogiques</li>
          </ul>

        </article>


        <article class="content-card">

          <h2>Évaluation</h2>

          <ul>
            <li>Évaluation diagnostique</li>
            <li>Évaluation formative</li>
            <li>Évaluation sommative</li>
            <li>Critères et indicateurs</li>
            <li>Correction et analyse</li>
          </ul>

        </article>


        <article class="content-card">

          <h2>Remédiation</h2>

          <ul>
            <li>Identification des difficultés</li>
            <li>Analyse des erreurs</li>
            <li>Activités de remédiation</li>
            <li>Suivi des apprentissages</li>
          </ul>

        </article>


        <article class="content-card">

          <h2>Éducation inclusive</h2>

          <ul>
            <li>Prise en compte des besoins des apprenants</li>
            <li>Adaptation des activités</li>
            <li>Accessibilité pédagogique</li>
            <li>Accompagnement différencié</li>
          </ul>

        </article>

      </div>


      <div class="information-panel">

        <h2>Références institutionnelles</h2>

        <p>
          Les ressources institutionnelles doivent être
          identifiées par leur organisme source et leur
          version avant publication dans la base.
        </p>

        <ul>
          <li>INFRE</li>
          <li>INIFRCF</li>
          <li>Structures d'inspection pédagogique</li>
          <li>Ministère chargé des enseignements</li>
        </ul>

      </div>

    </section>
  `;
}


/* =========================================================
   VIE PROFESSIONNELLE
   ========================================================= */

async function renderProfessionnel() {

  const content = $('#teacher-content');

  content.innerHTML = `

    <section class="page-section">

      <div class="page-heading">

        <div>

          <h1>Vie professionnelle</h1>

          <p>
            Ressources pour la formation continue,
            les animations pédagogiques et les conseils
            d'établissement.
          </p>

        </div>

      </div>


      <div class="content-grid">

        <article class="content-card">

          <h2>Animation pédagogique</h2>

          <p>
            Thèmes, objectifs, questions de discussion,
            ressources et pistes d'action destinés aux
            activités d'animation pédagogique.
          </p>

        </article>


        <article class="content-card">

          <h2>Conseil d'établissement</h2>

          <p>
            Ressources permettant à l'enseignant de
            préparer et documenter les thèmes abordés
            dans les conseils d'établissement.
          </p>

        </article>


        <article class="content-card">

          <h2>Formation continue</h2>

          <p>
            Ressources et thèmes liés au développement
            professionnel continu des enseignants.
          </p>

        </article>

      </div>


      <div id="professional-themes">

        <div class="loading-state">
          Chargement des thèmes disponibles...
        </div>

      </div>

    </section>
  `;

  const { data, error } = await sb
    .from('teacher_professional_themes')
    .select(`
      id,
      title,
      theme_type,
      level_scope,
      context,
      objectives,
      discussion_questions,
      action_points,
      references_text,
      source_authority,
      status
    `)
    .eq('status', 'published')
    .order('title');

  const container = $('#professional-themes');

  if (error) {

    container.innerHTML = `
      <div class="empty-state">

        <h3>Thèmes non disponibles</h3>

        <p>
          Aucun thème ne peut être chargé actuellement.
        </p>

      </div>
    `;

    console.error(error);
    return;
  }

  if (!data || data.length === 0) {

    container.innerHTML = `
      <div class="empty-state">

        <h3>Aucun thème publié pour le moment</h3>

        <p>
          Les thèmes seront affichés ici lorsqu'ils
          auront été réellement enregistrés et publiés.
        </p>

      </div>
    `;

    return;
  }

  container.innerHTML = `

    <div class="resource-list">

      ${data.map(theme => `

        <article class="resource-card">

          <div class="resource-meta">

            <span>
              ${escapeHTML(
                theme.theme_type ||
                'Thème professionnel'
              )}
            </span>

            <span>
              ${escapeHTML(
                theme.level_scope ||
                'Tous niveaux'
              )}
            </span>

          </div>

          <h2>
            ${escapeHTML(theme.title)}
          </h2>

          ${
            theme.context
              ? `
                <h3>Contexte</h3>
                <p>
                  ${escapeHTML(theme.context)}
                </p>
              `
              : ''
          }

          ${
            theme.objectives
              ? `
                <h3>Objectifs</h3>
                <p>
                  ${escapeHTML(theme.objectives)}
                </p>
              `
              : ''
          }

          ${
            theme.discussion_questions
              ? `
                <h3>Questions de discussion</h3>
                <p>
                  ${escapeHTML(
                    theme.discussion_questions
                  )}
                </p>
              `
              : ''
          }

          ${
            theme.action_points
              ? `
                <h3>Pistes d'action</h3>
                <p>
                  ${escapeHTML(theme.action_points)}
                </p>
              `
              : ''
          }

          ${
            theme.references_text
              ? `
                <h3>Références</h3>
                <p>
                  ${escapeHTML(theme.references_text)}
                </p>
              `
              : ''
          }

          ${
            theme.source_authority
              ? `
                <p>
                  <strong>Source :</strong>
                  ${escapeHTML(theme.source_authority)}
                </p>
              `
              : ''
          }

        </article>

      `).join('')}

    </div>
  `;
}


/* =========================================================
   ENSEIGNEMENT SUPÉRIEUR
   ========================================================= */

function renderSuperieur() {

  const content = $('#teacher-content');

  content.innerHTML = `

    <section class="page-section">

      <div class="page-heading">

        <div>

          <h1>Enseignement supérieur</h1>

          <p>
            Espace destiné aux enseignants des universités,
            instituts et établissements d'enseignement supérieur.
          </p>

        </div>

      </div>


      <div class="content-grid">

        <article class="content-card">

          <h2>Organisation des enseignements</h2>

          <ul>
            <li>Plans de cours</li>
            <li>Objectifs d'apprentissage</li>
            <li>Progression pédagogique</li>
            <li>Cours magistraux</li>
            <li>Travaux dirigés</li>
            <li>Travaux pratiques</li>
          </ul>

        </article>


        <article class="content-card">

          <h2>Pédagogie universitaire</h2>

          <ul>
            <li>Conception des enseignements</li>
            <li>Approches pédagogiques</li>
            <li>Accompagnement des étudiants</li>
            <li>Évaluation des apprentissages</li>
            <li>Critères et rubriques d'évaluation</li>
          </ul>

        </article>


        <article class="content-card">

          <h2>Recherche & documentation</h2>

          <ul>
            <li>Documentation scientifique</li>
            <li>Méthodologie de recherche</li>
            <li>Références bibliographiques</li>
            <li>Encadrement des travaux</li>
          </ul>

        </article>


        <article class="content-card">

          <h2>Ressources disciplinaires</h2>

          <p>
            Chaque discipline de l'enseignement supérieur
            pourra disposer de son propre espace documentaire,
            sans être mélangée avec les disciplines d'autres
            niveaux d'enseignement.
          </p>

        </article>

      </div>


      <div class="empty-state">

        <h3>Ressources universitaires</h3>

        <p>
          Aucune ressource universitaire publiée n'est
          actuellement affichée ici tant qu'aucune donnée
          réelle n'a été enregistrée dans la base.
        </p>

      </div>

    </section>
  `;
}


/* =========================================================
   MES RESSOURCES
   ========================================================= */

async function renderMesRessources() {

  const content = $('#teacher-content');

  content.innerHTML = `

    <section class="page-section">

      <div class="page-heading">

        <div>

          <h1>Mes ressources</h1>

          <p>
            Ressources personnelles créées ou adaptées
            par l'enseignant connecté.
          </p>

        </div>

      </div>


      <div class="information-panel">

        <h2>Votre espace professionnel</h2>

        <p>
          Les ressources personnelles sont distinctes
          des documents institutionnels.
        </p>

        <p>
          Aucune ressource n'est inventée automatiquement :
          seules les ressources réellement enregistrées
          dans votre compte sont affichées.
        </p>

      </div>


      <div id="my-resources">

        <div class="loading-state">
          Chargement de vos ressources...
        </div>

      </div>

    </section>
  `;

  const {
    data: userData
  } = await sb.auth.getUser();

  const user = userData?.user;

  if (!user) {
    renderAccessDenied();
    return;
  }

  const { data, error } = await sb
    .from('teacher_portal_resources')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', {
      ascending: false
    });

  const container = $('#my-resources');

  if (error) {

    container.innerHTML = `
      <div class="empty-state">

        <h3>Impossible de charger vos ressources</h3>

        <p>
          ${escapeHTML(error.message)}
        </p>

      </div>
    `;

    console.error(error);
    return;
  }

  if (!data || data.length === 0) {

    container.innerHTML = `
      <div class="empty-state">

        <h3>Vous n'avez encore aucune ressource</h3>

        <p>
          Cet espace se remplira lorsque vous créerez
          réellement vos premières ressources professionnelles.
        </p>

      </div>
    `;

    return;
  }

  container.innerHTML = `

    <div class="resource-list">

      ${data.map(resource => `

        <article class="resource-card">

          <h2>
            ${escapeHTML(
              resource.title ||
              resource.name ||
              'Ressource sans titre'
            )}
          </h2>

          <p>
            ${escapeHTML(
              resource.description ||
              resource.content ||
              ''
            )}
          </p>

        </article>

      `).join('')}

    </div>
  `;
}


/* =========================================================
   NAVIGATION DES CARTES
   ========================================================= */

function attachViewButtons() {

  document
    .querySelectorAll('[data-open-view]')
    .forEach(button => {

      button.addEventListener(
        'click',
        () => {

          const view =
            button.dataset.openView;

          document
            .querySelectorAll('.nav-button')
            .forEach(item => {

              item.classList.toggle(
                'active',
                item.dataset.view === view
              );

            });

          renderView(view);
        }
      );

    });
}


/* =========================================================
   ROUTAGE DES VUES
   ========================================================= */

function renderView(view) {

  switch (view) {

    case 'accueil':
      renderAccueil();
      break;

    case 'disciplines':
      renderDisciplines();
      break;

    case 'pedagogie':
      renderPedagogie();
      break;

    case 'professionnel':
      renderProfessionnel();
      break;

    case 'superieur':
      renderSuperieur();
      break;

    case 'mes-ressources':
      renderMesRessources();
      break;

    default:
      renderAccueil();
  }
}


/* =========================================================
   ACCÈS REFUSÉ
   ========================================================= */

function renderAccessDenied() {

  const app = $('#app');

  if (!app) return;

  app.innerHTML = `

    <section class="access-denied">

      <div class="access-box">

        <h1>Accès enseignant refusé</h1>

        <p>
          Votre compte Google est bien connecté,
          mais le rôle TEACHER n'est pas associé
          à ce compte.
        </p>

        <button
          id="access-logout"
          type="button"
          class="secondary-button">
          Se déconnecter
        </button>

      </div>

    </section>
  `;

  $('#access-logout')
    ?.addEventListener(
      'click',
      signOut
    );
}


/* =========================================================
   ÉCRAN DE CONNEXION
   ========================================================= */

function renderLogin() {

  const app = $('#app');

  if (!app) return;

  app.innerHTML = `

    <section class="login-page">

      <div class="login-box">

        <div class="login-logo">
          ZNA
        </div>

        <h1>ZNA Enseignants</h1>

        <p>
          Espace professionnel des enseignants
          de Zénith Nova Academy.
        </p>

        <button
          id="google-login"
          type="button"
          class="google-button">

          Se connecter avec Google / Gmail

        </button>

        <p class="login-note">
          La connexion permet d'identifier votre
          compte et de vérifier votre accès enseignant.
        </p>

      </div>

    </section>
  `;

  $('#google-login')
    ?.addEventListener(
      'click',
      signInWithGoogle
    );
}


/* =========================================================
   INITIALISATION
   ========================================================= */

async function initialize() {

  try {

    const {
      data: {
        session
      }
    } = await sb.auth.getSession();

    if (!session?.user) {

      renderLogin();
      return;
    }

    const roleResult =
      await getTeacherRole();

    if (!roleResult.allowed) {

      renderAccessDenied();
      return;
    }

    renderTeacherShell(
      session.user
    );

  } catch (error) {

    console.error(error);

    showMessage(
      'Une erreur est survenue lors du chargement de ZNA Enseignants.',
      'error'
    );
  }
}


/* =========================================================
   SURVEILLANCE DE SESSION
   ========================================================= */

sb.auth.onAuthStateChange(
  async (event, session) => {

    if (
      event === 'SIGNED_OUT' ||
      !session?.user
    ) {

      renderLogin();
      return;
    }

    if (
      event === 'SIGNED_IN' ||
      event === 'INITIAL_SESSION'
    ) {

      const roleResult =
        await getTeacherRole();

      if (roleResult.allowed) {

        renderTeacherShell(
          session.user
        );

      } else {

        renderAccessDenied();

      }
    }
  }
);


/* =========================================================
   DÉMARRAGE
   ========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  initialize
);
