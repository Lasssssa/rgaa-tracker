# Roadmap — Plateforme de suivi d'audits RGAA

Approche : valider d'abord la chaîne de valeur cœur (ingestion → erreurs exploitables → regroupement → suivi de conformité) en mono-utilisateur, avant d'ajouter la complexité GitLab (OAuth, sync, multi-instance) et la gestion d'équipe.

---

## Phase 0 — Cadrage & données de test
**Objectif : sécuriser les hypothèses avant de coder.**

- Rassembler 3 à 5 vrais audits (CSV + PDF, anonymisés si besoin) pour couvrir la variabilité réelle des rapports
- Vérifier la régularité de mise en page des PDF (même outil d'audit ou plusieurs ?)
- Figer le modèle de données (Project / Page / Criterion / Erreur) sur la base de ces exemples réels, pas seulement de la spec théorique
- Choisir la stack définitive (backend, DB, parsing)

*Livrable : modèle de données validé + jeu de données de test.*

---

## Phase 1 — Ingestion CSV
**Objectif : lire un audit et afficher son état de conformité.**

- Upload d'un CSV
- Parsing de l'onglet Projet + onglet Critère + onglets P0-Pn
- Stockage en base : Project, Pages, Criterion (référentiel RGAA chargé une fois), PageCriterionStatus
- Vue simple : tableau de conformité par page et par critère (conforme / non conforme / non applicable), taux global

*Livrable : je peux uploader un CSV et voir l'état de conformité du projet dans l'app.*

---

## Phase 2 — Extraction des erreurs depuis le PDF
**Objectif : ne plus lire le PDF à la main.**

- Upload du PDF lié au projet
- Parsing texte (+ captures d'écran associées) : découpage par critère / constat / solution proposée / page(s) concernée(s)
- Rattachement automatique de chaque erreur au bon Criterion et à la/les bonnes Page(s) (croisement avec les données de la Phase 1)
- Vue liste exhaustive des erreurs, filtrable par critère, par page, par thématique RGAA

*Livrable : je peux uploader le PDF et obtenir la liste structurée de toutes les erreurs, sans les relire manuellement.*

⚠️ Phase la plus risquée techniquement (fiabilité du parsing) — prévoir du temps pour ajuster les règles d'extraction sur les vrais rapports de la Phase 0.

---

## Phase 3 — Regroupement en thématiques
**Objectif : passer de "N erreurs" à "M causes à corriger".**

- Regroupement automatique proposé par grande thématique RGAA
- Interface drag & drop : déplacer une erreur d'une thématique à une autre, exclure une erreur, créer/fusionner/renommer des thématiques
- Une thématique liste : titre, critères concernés, pages concernées, erreurs incluses, solution consolidée

*Livrable : je peux organiser mes erreurs en groupes de correction cohérents, prêts à devenir des tickets plus tard.*

---

## Phase 4 — Suivi & mise à jour de conformité
**Objectif : fermer la boucle sans ressaisir le CSV à la main.**

- Marquer une thématique comme "corrigée" → répercussion automatique sur le statut des critères/pages concernés
- Recalcul du taux de conformité global
- Export du CSV mis à jour dans le format d'origine (mêmes onglets P0-Pn)

*Livrable : je corrige dans l'app, le CSV de suivi se met à jour tout seul.*

---

## Phase 5 (bonus, si le temps le permet avant GitLab) — Base de solutions
**Objectif : capitaliser d'un projet à l'autre.**

- Historique des solutions déjà appliquées par critère, réutilisable sur un nouveau projet
- Suggestion automatique de solution quand un critère connu revient

---

## Phase 6 — Intégration GitLab (mise de côté pour l'instant)
**Objectif : suivi externe + traçabilité dev.**

- Connexion OAuth GitLab
- Export d'une thématique validée en issue GitLab (labels, description formatée)
- Sync retour du statut des issues vers l'app
- Gestion multi-utilisateurs / rôles d'équipe

---

## Ce qui reste volontairement hors scope pour l'instant
- Connexion GitLab / création automatique de tickets (Phase 6)
- Gestion d'équipe multi-rôles (dépend de Phase 6)
- Multi-instance GitLab (SaaS + self-hosted)
- Suggestions de regroupement par similarité de texte (au-delà du critère RGAA) — amélioration possible après Phase 3 si le regroupement par critère seul s'avère insuffisant
