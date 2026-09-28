const URL = 'https://dpxghtjhjylofxhmnfxf.supabase.co';

const KEY = 'sb_publishable_sH-gCONkuPsuGPE5zpgHwg_u4e0rup1';

const sb = supabase.createClient(URL, KEY, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true
  }
});

const $ = (id) => document.getElementById(id);

function redirectTarget() {
  return window.location.origin + window.location.pathname;
}

async function google() {
  $('msg').textContent = 'Redirection vers Google…';

  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTarget(),
      queryParams: {
        prompt: 'select_account'
      }
    }
  });

  if (error) {
    $('msg').textContent = 'Erreur Google : ' + error.message;
  }
}

$('googleBtn').onclick = google;
$('googleBtn2').onclick = google;

$('logout').onclick = async () => {
  await sb.auth.signOut();
  location.reload();
};

document.querySelectorAll('nav button').forEach((button) => {
  button.onclick = () => {
    document.querySelectorAll('.view').forEach((view) => {
      view.hidden = view.id !== button.dataset.view;
    });

    if (button.dataset.view === 'disciplines') {
      loadDisciplines();
    }

    if (button.dataset.view === 'themes') {
      loadThemes();
    }
  };
});

async function start() {
  const { data, error } = await sb.auth.getSession();

  if (error) {
    $('msg').textContent = error.message;
    return;
  }

  if (data.session) {
    showApp(data.session);
  }
}

async function showApp(session) {
  $('login').hidden = true;
  $('app').hidden = false;
  $('logout').hidden = false;
  $('googleBtn').hidden = true;

  const user = session.user;

  $('authState').textContent = 'Connecté';

  $('name').textContent =
    'Bonjour ' +
    (
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'enseignant'
    );

  $('email').textContent = user.email || '';

  const { data, error } = await sb.rpc('core_get_my_roles');

  if (error) {
    $('role').textContent = 'Rôle à vérifier';

    notice(
      'Authentification réussie, mais le rôle enseignant n’a pas pu être vérifié.'
    );
  } else {
    const roles = Array.isArray(data) ? data : [];

    const teacher = roles.some((role) =>
      (
        role.code ||
        role.role_code ||
        role.name ||
        ''
      )
        .toString()
        .toUpperCase() === 'TEACHER'
    );

    $('role').textContent = teacher
      ? 'Enseignant vérifié'
      : 'Compte connecté — rôle TEACHER à attribuer';

    if (!teacher) {
      notice(
        'Compte Google authentifié. Le rôle TEACHER doit être attribué côté système pour l’accès professionnel complet.'
      );
    }
  }

  loadDisciplines();
  loadThemes();
}

async function loadDisciplines() {
  const { data, error } = await sb
    .from('teacher_disciplines')
    .select(
      'name,code,level_scope,source_authority'
    )
    .eq('is_active', true)
    .order('name');

  const search =
    ($('search')?.value || '').toLowerCase();

  if (error) {
    $('disciplinesList').innerHTML =
      '<article>Erreur de chargement.</article>';

    return;
  }

  $('disciplinesList').innerHTML =
    (data || [])
      .filter((item) =>
        item.name.toLowerCase().includes(search)
      )
      .map(
        (item) => `
          <article>
            <small>${esc(item.level_scope)}</small>
            <h3>${esc(item.name)}</h3>
            <p>${esc(
              item.source_authority ||
              'Source à préciser'
            )}</p>
          </article>
        `
      )
      .join('') ||
    '<article>Aucune discipline.</article>';
}

if ($('search')) {
  $('search').oninput = loadDisciplines;
}

async function loadThemes() {
  let query = sb
    .from('teacher_professional_themes')
    .select('*')
    .eq('status', 'published')
    .order('created_at', {
      ascending: false
    });

  const filter = $('filter')?.value || 'all';

  if (filter !== 'all') {
    query = query.eq(
      'theme_type',
      filter
    );
  }

  const { data, error } = await query;

  if (error) {
    $('themesList').innerHTML =
      '<article>Erreur de chargement.</article>';

    return;
  }

  $('themesList').innerHTML =
    (data || [])
      .map(
        (theme) => `
          <div class="theme">
            <small>
              ${esc(theme.theme_type)}
              ·
              ${esc(theme.level_scope)}
            </small>

            <h3>${esc(theme.title)}</h3>

            <p>
              <b>Contexte :</b>
              ${esc(theme.context || '')}
            </p>

            <p>
              <b>Objectifs :</b>
              ${esc(theme.objectives || '')}
            </p>

            <p>
              <b>Questions :</b>
              ${esc(
                theme.discussion_questions || ''
              )}
            </p>

            <p>
              <b>Actions :</b>
              ${esc(theme.action_points || '')}
            </p>

            <p>
              ${esc(
                theme.source_authority || ''
              )}
            </p>
          </div>
        `
      )
      .join('') ||
    '<article>Aucun thème publié.</article>';
}

if ($('filter')) {
  $('filter').onchange = loadThemes;
}

function notice(message) {
  $('notice').textContent = message;
  $('notice').hidden = false;
}

function esc(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[character])
  );
}

sb.auth.onAuthStateChange(
  (_event, session) => {
    if (session) {
      showApp(session);
    }
  }
);

start();
