# ZNAEDU Web V4

Version corrigée du portail ZNAEDU.

Cette version affiche toujours les trois univers principaux même si le catalogue Supabase ou une fonction distante est momentanément indisponible.

Supabase est ensuite utilisé pour enrichir le portail.

## Univers ZNAEDU

- Zénith Nova Academy
- BON PLAN 229
- SCHOOL CONTROL

## Déploiement GitHub Pages

1. Remplacer les anciens fichiers du dépôt par ceux de cette version.
2. Conserver `index.html`, `style.css`, `app.js` et `README.md` à la racine du dépôt.
3. Cliquer sur **Commit changes**.
4. Ouvrir l'URL GitHub Pages.
5. Effectuer un rechargement de la page.

## Supabase

Le portail utilise Supabase pour :

- l'authentification ;
- le catalogue des plateformes ;
- le portail personnel ;
- la recherche globale ;
- les fonctions ZNAEDU.

La clé présente dans `app.js` est une clé publishable destinée au navigateur.

Aucune clé secrète ou service-role ne doit être placée dans GitHub.
