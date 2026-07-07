# Spec — Plateforme de suivi des audits RGAA avec export GitLab

## 1. Objectif

Remplacer le traitement manuel des audits RGAA (lecture du PDF page par page, correction, mise à jour du CSV) par un outil qui :
- extrait automatiquement les erreurs du PDF et les relie aux critères du CSV,
- permet de les regrouper en thématiques de correction (au lieu d'un ticket par erreur),
- exporte ces thématiques comme issues GitLab,
- et donne un suivi de conformité par projet, par page et par équipe.

## 2. Rôles & accès

| Rôle | Droits |
|---|---|
| Admin | Crée/supprime des projets, gère les membres de l'équipe, configure la connexion GitLab |
| Contributeur | Upload des audits, regroupe les erreurs, édite les thématiques, exporte vers GitLab |
| Lecteur | Consulte le suivi de conformité, sans droit d'édition |

Connexion : OAuth GitLab pour l'auth des utilisateurs (évite de gérer des mots de passe séparés, et donne directement le token nécessaire à l'export d'issues — sous réserve que ton instance GitLab (SaaS gitlab.com ou self-hosted) autorise la création d'une OAuth App).

## 3. Modèle de données

```
Team
 ├─ id, nom
 └─ Membres (User, rôle)

Project
 ├─ id, team_id, nom, client
 ├─ date_audit
 ├─ gitlab_project_id (lié pour l'export d'issues)
 ├─ taux_conformité_global (calculé)
 └─ raw_csv, raw_pdf (fichiers sources conservés)

Page
 ├─ id, project_id
 ├─ label (P0, P1...)
 └─ url ou nom de la page

Criterion  (référentiel fixe RGAA, ~106 lignes, chargé une fois pour toutes)
 ├─ id, numero (ex: 3.2), thématique_rgaa (ex: "Multimédia"), intitulé, lien_doc

PageCriterionStatus
 ├─ page_id, criterion_id
 └─ statut (conforme / non_conforme / non_applicable)

Erreur  (extraite du PDF)
 ├─ id, project_id, criterion_id
 ├─ pages_concernées (liste de page_id — une erreur peut toucher plusieurs pages)
 ├─ constat (texte)
 ├─ solution_proposée (texte)
 ├─ capture_écran (fichier, optionnel)
 ├─ statut (à_traiter / regroupée / exclue)

Thematique  (= futur ticket GitLab)
 ├─ id, project_id
 ├─ titre, description
 ├─ criterion_ids (un ou plusieurs)
 ├─ erreurs (liste d'Erreur, ajout/retrait manuel drag & drop)
 ├─ statut (brouillon / exportée / synchronisée)
 └─ gitlab_issue_iid, gitlab_issue_url (une fois exportée)
```

## 4. Flux utilisateur

1. **Créer un projet** dans une team, lier au projet GitLab cible.
2. **Upload CSV + PDF.**
3. **Parsing automatique** :
   - CSV → statuts conforme/non conforme/non applicable par page et par critère.
   - PDF → extraction des erreurs (regex/heuristiques sur la structure du rapport : n° de critère, constat, solution, capture). *Point d'attention : la fiabilité du parsing PDF dépend de la régularité de mise en page — à valider sur 2-3 vrais rapports avant de figer le parseur.*
4. **Écran de regroupement** :
   - L'app propose un premier découpage par grande thématique RGAA (ex: "Contraste et couleurs", "Formulaires", "Multimédia", "Navigation").
   - Vue type kanban/drag & drop : tu déplaces des erreurs entre thématiques, tu peux en exclure, en créer de nouvelles, fusionner.
5. **Validation & export GitLab** :
   - Pour chaque thématique validée → création d'une issue GitLab (titre, description formatée avec la liste des erreurs, critères, solutions, captures en pièces jointes ou liens), labels auto (`rgaa`, `critere-X.X`, nom du projet).
   - Les thématiques déjà exportées sont grisées / liées à l'URL de l'issue.
6. **Suivi** :
   - Tableau de bord : taux de conformité par page/critère, statut des thématiques (brouillon / exportée / issue fermée).
   - (V2) Sync retour : quand l'issue GitLab passe "closed", proposer de repasser les critères/pages concernés en "conforme" dans l'app, avec re-génération du CSV à jour.

## 5. Scope MVP vs V2

**MVP**
- Upload + parsing CSV/PDF
- Liste exhaustive des erreurs, éditable
- Regroupement par thématique (auto par critère RGAA + drag & drop manuel)
- Export GitLab via OAuth (création d'issues, sens unique app → GitLab)
- Dashboard de conformité basique (par page, par critère)
- Gestion d'équipe simple (rôles admin/contributeur/lecteur)

**V2**
- Sync retour GitLab → statuts de conformité
- Génération/export du CSV RGAA à jour (réinjection dans le format d'origine, onglets P0-Pn)
- Suggestions de regroupement plus fines (similarité de texte entre constats, au-delà du simple critère)
- Base de solutions réutilisable entre projets (mémoriser "critère 3.2 → pattern X" pour accélérer les futurs audits)
- Multi-instance GitLab (SaaS + self-hosted) si besoin

## 6. Stack technique proposée (à ajuster selon vos préférences internes)

- **Backend** : Node.js (NestJS) ou Python (FastAPI) — API REST, gestion OAuth GitLab, parsing PDF/CSV
- **DB** : PostgreSQL (relationnel, adapté au modèle ci-dessus)
- **Frontend** : React + une lib de drag & drop (dnd-kit) pour l'écran de regroupement
- **Parsing PDF** : pdfplumber (Python) ou pdf-parse (Node) pour l'extraction texte, à coupler à des règles regex spécifiques au format de vos rapports
- **Stockage fichiers** (CSV/PDF/captures) : S3-compatible (ou stockage local si hébergement interne)
- **Hébergement** : dépend de vos contraintes internes (interne à l'organisation vs cloud) — à préciser

## 7. Points encore ouverts à trancher avant le dev

- Le PDF d'audit a-t-il toujours la même mise en page d'un auditeur/outil à l'autre, ou faut-il gérer plusieurs formats ?
- GitLab SaaS (gitlab.com) ou self-hosted ? (impacte la config de l'OAuth App)
- Faut-il gérer plusieurs projets GitLab différents par audit, ou un seul repo cible par équipe ?
- Hébergement : interne ou cloud ?

## 8. Prochaine étape suggérée

Cette appli (auth OAuth réelle, DB persistante, multi-utilisateurs) doit être construite et déployée avec un outil de développement réel — **Claude Code** (ou **Cowork** pour piloter le projet de bout en bout, y compris la partie non-code comme la doc et le suivi). Cette conversation peut servir de cahier des charges de départ.

En parallèle, si tu veux valider l'UX du flow (upload → parsing → regroupement drag & drop → export) avant d'investir dans le vrai build, je peux te faire un prototype interactif (mono-utilisateur, données simulées) directement ici.
