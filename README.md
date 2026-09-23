# ZNAEDU Web V3 — Portail connecté

Frontend mobile-first du portail ZNAEDU connecté au backend Supabase.

Connexions : Supabase Auth, `platform_catalog`, `search_public_znaedu()`, Edge Function `znaedu-portal` et snapshot `get_my_znaedu_portal()`.

Univers préparés : `/academy`, `/bon-plan-229`, `/school-control`.

Le frontend utilise uniquement la clé publishable Supabase. Aucune service_role key n'est incluse.

Le package doit encore être déployé sur l'hébergement web choisi pour devenir le portail public. Les interfaces internes des trois univers doivent ensuite être raccordées à leurs routes réelles.
