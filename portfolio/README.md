# Portfolio — Samba

Portfolio interactif construit avec React 18, Vite et la librairie d'animation `motion` (Framer Motion).

Ce document explique, fonctionnalite par fonctionnalite, comment le site est construit dans le code. Il est mis a jour a chaque evolution du site.

## Sommaire

1. [Demarrage](#demarrage)
2. [Architecture generale](#architecture-generale)
3. [Navigation entre les pages](#navigation-entre-les-pages)
4. [Chargement et avatar interactif](#chargement)
5. [Easter egg de la poche](#easter-egg-de-la-poche)
6. [Outro : sortir de la tete](#outro--sortir-de-la-tete)
7. [Page Projects](#page-projects), [Icones](#icones-lordicon), [CV et liens](#cv-et-liens)
8. [Galeries d'activites (Extra et Random)](#galeries-dactivites-extra-et-random)
9. [Effet machine a ecrire (Home)](#effet-machine-a-ecrire-home)
10. [Theme clair / sombre](#theme-clair--sombre)
11. [Terminal de navigation](#terminal-de-navigation)
12. [Navigation aux gestes de la main](#navigation-aux-gestes-de-la-main)
13. [Animations d'apparition des sections](#animations-dapparition-des-sections)
14. [Page Contact](#page-contact)
15. [Personnalisation rapide](#personnalisation-rapide)
16. [Publication (GitHub Pages)](#publication-github-pages)

## Demarrage

```
cd portfolio
npm install
npm run dev
```

## Architecture generale

```
src/
  App.jsx                  Assemblage global : navbar, pages, overlays
  hooks/usePortfolio.js    Etat central : page active, menu, navigation au scroll
  components/              Composants reutilisables
  pages/                   Une page = un composant (Home, Projects, Extra, Random, Contact)
  lib/activities.js        Chargement automatique des photos d'activites
  css/                     Un fichier CSS par composant + variables de theme
  assets/
    avatar/normal.png      L'avatar de l'outro
    avatar/chibime.png     Le chibi du hero de Home
    projects/              Photos des projets, <slug>.jpg (optionnel)
    icons/                 Icones Lordicon (SVG)
    skills/                Logos officiels des competences
```

Le site est une single-page : les six pages existent toutes dans le DOM, seule la page active est visible (`.page.active`). L'ordre des pages est defini dans `App.jsx` (`PAGES`) et doit rester synchronise avec `NavList.jsx` et `Terminal.jsx`.

## Navigation entre les pages

Fichier : `hooks/usePortfolio.js`

Deux modes de navigation :

- Clic (menu, boutons) : `goTo(index)` declenche un overlay qui balaie l'ecran (animation CSS `slide`) pendant que la page change en dessous.
- Scroll : chaque page a son propre conteneur scrollable (`.page-scroll`). Quand l'utilisateur atteint le bas d'une page et continue de scroller, `handleWheel` detecte la position (`scrollTop + clientHeight >= scrollHeight`) et passe a la page suivante avec une animation d'entree. En remontant, on arrive en bas de la page precedente, sur sa derniere section, plutot qu'en haut (`enterFromBelow` / `enterFromAbove` dans `App.css`). Un cooldown (`cooling.current`) empeche les changements en rafale. Sur mobile, `handleTouchStart` / `handleTouchMove` / `handleTouchEnd` font la meme chose au doigt, et de la meme facon : une molette continue d'emettre des evenements quand la page est deja en butee, c'est ce qui fait changer de page d'un seul geste sur PC. Le doigt fait pareil : on cumule la distance tiree une fois la page bloquee sur son bord et, passe 48 px, la page change pendant le geste, sans avoir a relacher et recommencer. `overscroll-behavior: contain` evite que le navigateur recharge la page ou rebondisse a la place.

Cas particulier : en bas de la toute derniere page (Contact), le callback `onEndReached` est appele au lieu de changer de page — c'est lui qui ouvre l'outro.

## Chargement

Fichiers : `components/Loader.jsx`, `css/Loader.css`, `lib/smoke.js` (inspire de mattjinn.com)

- Le mot "samba" en serif minuscule (Libre Caslon Display) : chaque lettre monte et fonce l'une apres l'autre, en vague qui se repete (animation CSS decalee de 70 ms par lettre).
- Des que les polices et la page sont chargees (au moins 2,4 s, au plus 7 s), le mot s'efface, puis l'ecran se dissout comme de la fumee (2,8 s) : un petit shader WebGL (`smoke.js`) dessine un calque de la couleur du fond, troue du centre vers les bords le long de bords en bruit fractal qui derivent. Le bord du trou devient une fumee contrastee : noire si le fond est clair, blanche s'il est sombre. Le site devient visible au debut de la fumee (`onReveal`), le loader est retire a la fin (`onComplete`).
- Sans WebGL ou avec "reduire les animations" : simple fondu.

## L'avatar interactif (fin du site)

Fichiers : `components/Avatar.jsx`, `css/Avatar.css`

L'avatar (`assets/avatar/normal.png`) apparait dans l'outro, apres le pied de page de Contact.

- Yeux qui suivent la souris : les pupilles imprimees sur l'image sont recouvertes par deux pastilles couleur peau positionnees en pourcentage de l'image (constante `EYES`). A chaque `mousemove`, la pupille redessinee est translatee vers le curseur, avec une amplitude maximale proportionnelle a la taille de l'oeil.
- Clignement : un `setTimeout` recursif avec un delai aleatoire (2.2 a 5.5 s) ajoute brievement la classe `blink`, qui ecrase la pupille (`scaleY(0.08)`). Une chance sur quatre de double clignement.
- Respiration : animation CSS `avatar-breathe` (legere translation verticale).
- Inclinaison de tete : le conteneur `.avatar-bob` pivote de quelques degres vers le curseur, desactive pendant le zoom (attribut `data-zooming` pose par l'Outro et lu par l'Avatar).

## Easter egg de la poche

Fichier : `components/Avatar.jsx` (constantes `POCKET` et `PAPER_MESSAGE`), active dans `Outro.jsx`

L'easter egg est sur l'avatar de fin, une fois sorti de sa tete.

Une zone cliquable invisible recouvre la poche de la veste. Un compteur d'etapes (`paperStage`, 0 a 3) avance a chaque clic :

- Etapes 1 et 2 : un bout de papier depasse progressivement de la poche. L'effet de sortie est obtenu avec un conteneur a `overflow: hidden` aligne sur le haut de la poche, dans lequel le papier est translate verticalement (`translateY 101% -> 72% -> 38%`).
- Etape 3 : le bout de papier est masque et une note complete apparait au-dessus de la poche (animation `note-pop`) avec le message en anglais. Un clic supplementaire range le papier (retour a l'etape 0).

## Outro : sortir de la tete

Fichiers : `components/Outro.jsx`, `css/Outro.css`, fin de `pages/Contact.jsx`

En bas de la page Contact se trouve une section entierement noire (`.void-section`). En continuant de scroller tout en bas, `usePortfolio` appelle `onEndReached`, qui monte l'overlay `Outro`.

L'outro est pilotee au scroll : une boucle `requestAnimationFrame` fait tendre une valeur `current` (0 a 1) vers une cible `target` modifiee par la molette (lerp), et le conteneur `.intro-zoom` recoit `scale(1 + p * 34)` avec l'origine sur les cheveux (`HAIR_POINT`) :

- Le declenchement est double, pour etre facile et fluide : arriver en bas de la derniere page a la molette, ou simplement faire defiler la section noire jusqu'a ce qu'elle occupe 60 % de l'ecran (IntersectionObserver dans `Contact.jsx` qui emet l'evenement `portfolio:outro`, ecoute par `App.jsx`).
- On demarre a `p = 1` : ecran noir, camera "dans les cheveux". La transition avec la section noire est donc invisible.
- Scroller vers le bas fait baisser la cible -> dezoom progressif -> on ressort de la tete de l'avatar (plus d'indication "Keep scrolling" par-dessus l'avatar ; celle de la section noire, avant l'outro, reste).
- Sur mobile, la bulle est centree au-dessus de l'avatar (ancree a sa droite, sa fin sortait de l'ecran).
- Arrive a `p ~ 0`, l'avatar affiche une bulle "Goodbye! Thanks for visiting." avec une main qui salue, et un seul bouton centre : retour au debut (pour revenir au site, il suffit de remonter).
- Scroller vers le haut re-plonge dans les cheveux et referme l'outro.
- Sur ecran tactile, l'avatar ressort tout seul des l'ouverture ; glisser vers le bas replonge. Au lacher du doigt, l'animation se termine seule dans le sens du geste (`onTouchEnd`).
- L'outro ne se referme vers le site qu'apres en etre sortie au moins un peu (`leftHair`) : elle s'ouvre a `p = 1`, et sans cette garde elle se refermait des sa premiere image quand aucun scroll n'etait en cours — le cas sur telephone.

## Page Projects

Fichiers : `pages/Projects.jsx`, `css/Projects.css`, `lib/projects.js`, `components/ProjectModal.jsx`, `css/ProjectModal.css` (references : `assets/ref/projects_left.png`, `assets/ref/projects_right.png`, anubi.io)

- A droite, les domaines (Data, Software, AI Engineering), toujours sur une seule ligne, precedes d'un "Pick a domain" et d'un tiret qui s'allonge au survol pour montrer qu'ils se cliquent. Le domaine selectionne passe en rouge, en plus grand, avec trois mots-cles en monospace autour de lui. Au survol, un domaine glisse vers la gauche et rougit, comme les liens du menu.
- A gauche, une version reduite de la reference : le mot du domaine au centre, sa legende juste en dessous, et une illustration dessinee a la main propre au domaine (deux barres verticales vertes de part et d'autre de Data, spirale jaune pour Software, boucle rouge serree autour du I de AI), redessinee a chaque changement, et les projets du domaine en orbite autour. Une boucle `requestAnimationFrame` place les cartes sur une ellipse ; celles du bas sont plus grandes et passent devant. La boucle ne tourne que quand la page est active.
- Survol d'une carte : l'orbite s'arrete, la carte se redresse, grossit et prend un bord rouge, et une bulle affiche le titre et le resume.
- Clic sur une carte : une fenetre de details (image en grand, description, technologies, liens GitHub et site deploye) s'ouvre au centre sans couvrir toute la page. Elle "sort" de la carte : l'image de la fenetre a le meme ratio 4:3 que la carte, donc une seule mise a l'echelle uniforme (Web Animations API) la fait partir exactement de la carte, puis le fond et le texte apparaissent ; a la fermeture elle rentre dans la carte. Echap ou un clic a cote ferment.
- Donnees (`lib/projects.js`) : objets `PROJECTS` (textes repris des README des depots GitHub, `github`, `live`) et `DOMAINS` (libelle, mot central, mots-cles, illustration `mark`, liste de slugs ; un projet peut apparaitre dans plusieurs domaines).
- Images : deposer `src/assets/projects/<slug>.jpg` (ou png/webp) remplace la photo du projet (`photo` permet un autre nom de fichier, ex. `bikes` pour Kabir Service) ; sinon une photo Unsplash est utilisee.

## Certificats et attestations

Fichiers : `components/Certificates.jsx`, `css/Certificates.css`, `lib/certificates.js`, photos dans `assets/certificats/`

Section placee sous les projets (la page s'appelle desormais "Projects & Certificates" dans le menu). D'abord les badges AWS Educate, presentes comme sur Credly (`assets/ref/aws.png`) : image du badge, intitule, organisme, date d'obtention. Ensuite les attestations : une grille de cartes (photo, titre, organisme, date, une ligne de contexte). Partout, cliquer sur la carte agrandit l'image ; seul le petit bouton en bas a droite d'un badge ouvre sa page Credly. Ajouter une attestation : deposer la photo dans `assets/certificats/<slug>.jpg` et ajouter l'entree correspondante dans `lib/certificates.js`.

## Popups et bouton retour

Fichier : `hooks/useBackClose.js`

Chaque popup (apercu du CV, details d'un projet, modale des gestes, lightbox des galeries et des attestations) empile une entree d'historique a l'ouverture, au tick suivant (en developpement React monte, demonte et remonte chaque effet : empiler tout de suite faisait appeler `history.back()` au demontage, et le `popstate` en retard refermait le popup juste apres son ouverture) : le bouton retour du navigateur, ou le geste retour sur telephone, referme le popup au lieu de quitter le site. Une fermeture normale retire l'entree pour que le retour continue de fonctionner ensuite.

## Barre de progression

Fichiers : `components/PageProgress.jsx`, `css/PageProgress.css`

Fine barre verticale sur le bord gauche, a mi-hauteur entre le logo et le bouton du terminal : elle se remplit selon la position dans la page courante (`scrollTop / (scrollHeight - clientHeight)` du conteneur actif). Un trait court et grise au-dessus et en dessous signale qu'il y a une page avant ou apres ; il n'y en a pas au-dessus sur Home ni en dessous sur Contact, et ils apparaissent et disparaissent en fondu. La barre s'efface quand le menu est ouvert.

## Icones (Lordicon)

Fichiers : `components/LordIcon.jsx`, `css/LordIcon.css`, SVG dans `assets/icons/`

Toutes les icones du site viennent de Lordicon, style Wired Lineal, icones gratuites. La licence gratuite de Lordicon demande une attribution : elle n'est plus affichee sur le site (retiree a la demande), ce README en tient lieu. Chaque SVG depose dans `assets/icons/` est utilisable par son nom : `<LordIcon name="logo-github" size={32} />`. Les icones gardent leurs couleurs d'origine ; en theme sombre un filtre inverse leur luminosite (le contour sombre devient clair) sans changer les teintes. Elles sont rendues en `<img>` : certaines dessinent une partie d'elles-memes avec des masques que les navigateurs composent mal quand le SVG est insere dans la page.

Trouver une icone : `https://lordicon.com/api/library/icons?family=wired&style=lineal&query=<mot>&free=true`, puis telecharger `https://media.lordicon.com/icons/wired/lineal/<index>-<nom>.svg`.

## CV et liens

Fichiers : `lib/links.js`, `components/CvPreview.jsx`, `css/CvPreview.css`

`links.js` centralise l'email, LinkedIn, GitHub et le PDF du CV ; Home, Contact et le bouton Contact de la navbar lisent tous `SOCIALS`. Les documents sont dans `src/assets/cv/` : `<Resume|CV>_Samba_Hama_TRAORE_<Data|Software|AI>_Engineer.pdf`, catalogues par `lib/cv.js`. L'apercu s'ouvre sur la version ATS ; sur mobile le cadre epouse la hauteur du document et un clic a cote des pages le ferme ; le bouton a gauche de Download bascule entre ATS (`Resume_*`, sobre) et Graphic (`CV_*`, mise en page). Un seul domaine est publie : la constante `DOMAIN` de `lib/cv.js` (Data aujourd'hui) choisit lequel. Sur mobile l'entete tient sur une seule ligne : domaines a gauche, version, telechargement (icone seule) et fermeture a droite. Le bouton "See CV" de Home ouvre d'abord un apercu : pdf.js (charge seulement a l'ouverture) dessine chaque page du PDF dans un canvas, ce qui marche aussi sur mobile ou les PDF ne s'affichent pas dans une iframe. Le bouton Download de l'apercu telecharge le fichier.

## Galeries d'activites (Extra et Random)

Fichiers : `components/ActivityRow.jsx`, `css/Activity.css`, `pages/Extra.jsx`, `pages/Random.jsx`

Les pages Extra (ex Social) et Random (ex Fun) affichent chaque activite avec :

- Un conteneur "creative hover" reproduisant l'effet de `assets/ref` : les trois premieres photos sont decoupees en tranches diagonales via `clip-path: polygon(...)`. Survoler le conteneur replie toutes les tranches, sauf celle sous le curseur qui s'etend en plein cadre (transition CSS sur `clip-path`).
- Les tranches recoivent l'image en `background-image` avec une url entre guillemets : sans cela, un nom de fichier contenant des espaces ou des parentheses (`integration (2).jpeg`) casse le `url()` et la tranche reste noire.
- Une activite peut regrouper plusieurs sujets sous un meme titre : `bullets` affiche une liste a puces, et `aliases` rassemble les photos de plusieurs dossiers (ex. Campus life = `integration` + `parc`).
- Un clic sur une tranche ouvre une lightbox : grande image centree, bandeau de vignettes en dessous (au moins 5 photos par activite), navigation par fleches a l'ecran ou au clavier (gauche/droite, Echap pour fermer).

Chargement automatique des photos (`lib/activities.js`) : une activite = un dossier, `src/assets/extra/<slug>/` ou `src/assets/random/<slug>/`, scanne par `import.meta.glob`. Toutes les photos du dossier sont appliquees sans modifier le code ; les fichiers poses directement a la racine de `extra/` ou `random/` sont ignores. Le nom du dossier est le slug (tirets et underscores ignores, `aliases` permet d'y rattacher un autre nom de dossier, ex. `hackaton`). Un dossier sans definition cree automatiquement une nouvelle rangee (titre genere depuis le nom). Les galeries de moins de 5 photos sont completees par les photos `stock` de la definition (photos Unsplash gratuites choisies pour chaque activite, via `unsplash(id)`), puis par des photos neutres. `vite.config.js` accepte les extensions en majuscules.

Les photos ne sont pas versionnees : `src/assets/extra/` et `src/assets/random/` sont dans le `.gitignore`, elles restent sur le disque. Les definitions (titres, textes, listes a puces) vivent dans `src/content/extra.js` et `src/content/random.js`, qui exportent directement le tableau d'activites. Voir [Publication](#publication-github-pages) pour le mode "Coming soon".

## Effet machine a ecrire (Home)

Fichier : `components/TypingText.jsx`

L'ancienne page About est devenue la page Home du site. Son titre tape puis efface successivement les domaines (`ROLES` dans `Home.jsx` : "Data & AI", "Software") en rouge, suivis de "Engineer" qui ne bouge pas et garde la couleur du titre. Machine a etats simple : taper caractere par caractere -> pause -> effacer -> mot suivant. Le curseur clignotant est un simple `|` anime en CSS (`typing-cursor`).

Le hero de Home a un fond blanc en theme clair et noir en theme sombre (le chibi recoit alors un fin liseré clair pour ne pas se perdre dans le noir), avec le chibi `assets/avatar/chibime.png` a droite du texte, qui flotte doucement ; sur mobile le chibi passe au-dessus du texte. Sous le sous-titre : le bouton "See CV". Sous le chibi : les icones Email, LinkedIn et GitHub, en noir et blanc (filtre `grayscale` + `contrast`). Le titre tape ne revient jamais a la ligne (`white-space: nowrap`), meme pour les metiers les plus longs. La section "Hello" affiche les competences sous forme de logos officiels (tuile blanche pour rester lisibles dans les deux themes) et trois etoiles rouges qui tournent, reparties sur toute la hauteur de la section (en haut, au milieu, en bas) dans la marge de gauche ; sous 1150 px, faute de marge, elles passent contre le bord droit, plus petites et derriere le texte.

## Theme clair / sombre

Fichiers : `css/index.css` (variables), `components/ThemeToggle.jsx`, etat dans `App.jsx`

Toutes les couleurs du site sont des variables CSS definies sur `:root` (theme clair, par defaut) et surchargees par `[data-theme='dark']`. Le bouton soleil/lune bascule un etat React qui pose `data-theme` sur `<html>` et persiste le choix dans `localStorage`. Une transition globale sur `background-color` et `color` rend le changement fluide. Le carrousel et la section noire restent noirs quel que soit le theme (choix volontaire).

Le terminal permet aussi de changer le theme (`theme light|dark|toggle`).

## Easter eggs et page 404

Fichiers : `lib/eggs.js`, `components/EggToast.jsx`, `css/EggToast.css`, `components/LostPage.jsx`, `css/LostPage.css`

Trois easter eggs : la note dans la poche de l'avatar, l'avatar de fin lui-meme, et la page 404. Le premier declenchement de chacun appelle `findEgg(id)`, qui le retient dans `localStorage` et emet `portfolio:egg` ; Un son est joue a ce moment la (`assets/sounds/`, fichiers numerotes 1, 2, 3 : le premier egg declenche le premier son, et ainsi de suite ; volume 0.25). `EggToast` affiche alors une notification "Easter egg found" avec le compteur (1/3, 2/3, 3/3) qui disparait apres 4 s. Un egg deja trouve ne renotifie plus. Le compteur est aussi affiche au-dessus des citations quand le menu est ouvert, et la commande `eggs` du terminal le donne : dans les deux cas, seuls les eggs deja trouves sont nommes, les autres restent une surprise.

La page 404 s'affiche pour l'adresse `/404`, pour un hash inconnu (ex. `/#/nowhere`) ou via la commande `404` du terminal. `public/404.html` couvre les hebergements statiques (GitHub Pages et autres) qui servent ce fichier pour toute adresse inconnue : il renvoie vers le site avec `#/404`. Elle porte un petit jeu ou le message lui-meme sert d'obstacles : un carre rouge saute par-dessus le 4, le 0 et le 4 qui defilent (espace, ou un appui sur le plateau ; le score et le meilleur score sont gardes dans `localStorage`). Tout tient dans un canvas 2D avec une boucle `requestAnimationFrame`.

## Terminal de navigation

Fichiers : `components/Terminal.jsx`, `css/Terminal.css`

Bouton rond en bas a gauche (icone animee Lordicon `browser-terminal`) (pendant du bouton camera a droite) — survoler le bouton affiche le raccourci clavier, et la combinaison Ctrl + Alt + T ouvre ou ferme le terminal depuis n'importe ou. La fenetre s'affiche juste au-dessus du bouton, sans voile sur le site. Le bouton jaune la reduit : elle se replie dans le bouton (une pastille verte signale la session en attente), et un clic sur le bouton la rend telle qu'elle etait (taille, historique, saisie). Ouvre une fenetre de terminal simulee : un tableau de lignes (`lines`) fait office d'ecran, un champ texte fait office de prompt (`samba@portfolio:~$`). Chaque commande est un `case` d'un `switch` : `ls`, `cd <page>`, `about`, `skills`, `projects [--data|--software|--ai]`, `contact`, `resume`, `whoami`, `theme`, `help`, `clear`, `exit` (plus `404`, qui marche mais ne figure pas dans la liste : c'est un easter egg). Une ligne est soit une chaine, soit `{ text, tone }` (commande tapee en bleu, erreurs en rouge, confirmations en vert), soit `{ cmd, desc }` (une ligne de la liste des commandes : le nom en jaune), soit `{ banner }` (le titre encadre). Le cadre du titre est une bordure CSS et non des caracteres de dessin : leur largeur dependait de la police, d'ou le trait vertical decale sur PC et sur mobile. Les fleches haut et bas parcourent l'historique des commandes de la session (`history`), comme dans un vrai shell. `skills` lit `lib/skills.js` (la meme liste que les logos de Home), `projects` lit `lib/projects.js`, `contact` et `resume` lisent `lib/links.js`. La navigation appelle simplement `goTo(index)` du hook central. Echap ou le bouton rouge ferment la fenetre.

## Navigation aux gestes de la main

Fichiers : `components/GestureNav.jsx`, `components/GesturePreview.jsx`, `lib/gestureEngine.js`, `lib/gestureDispatch.js`, `lib/handTracker.js`, `css/GestureNav.css`

Bouton camera en bas a droite. Il ouvre une modale qui explique les trois gestes (chacun avec une icone au trait dessinee en SVG) puis demande l'acces a la camera. Une fois le mode actif, la paume deplace un curseur a l'ecran, un pincement bref clique, et un pincement maintenu puis glisse fait defiler la page. Une vignette repliable montre le flux et le squelette de la main detectee. Sur mobile, le bouton et la vignette restent visibles, en plus petit.

La detection tourne entierement dans le navigateur via MediaPipe. La video n'est ni envoyee, ni enregistree, ni stockee nulle part, et tous les tracks du flux sont liberes des la sortie : le voyant de la camera s'eteint, ce qui rend la promesse verifiable.

Le principe interne : `gestureEngine.js` transforme les 21 points de la main en position de curseur et en actions (clic, defilement) — c'est du calcul pur, sans DOM ni camera, et c'est le seul module couvert par des tests unitaires. `gestureDispatch.js` rejoue ensuite ces actions sous forme de vrais evenements DOM sur l'element vise. Le reste du site n'a donc rien eu a changer : tout ce qui repondait deja a la souris repond a la main, y compris le passage d'une page a l'autre.

Le runtime MediaPipe est auto-heberge dans `public/mediapipe/wasm/` et le modele dans `public/models/hand_landmarker.task`. La bibliotheque est chargee a la demande : un visiteur qui n'appuie jamais sur le bouton ne la telecharge pas.

## Animations d'apparition des sections

Fichiers : `components/Reveal.jsx`, `components/FeatureRow.jsx`

Sur mobile, les heros a photo (`hero-home`, `hero-social`, `hero-fun`, `hero-contact`) passent en `background-size: cover, contain` : le degrade continue de couvrir la section, mais la photo est affichee en entier sur fond noir au lieu d'etre rognee.

Toutes les sections de contenu du site glissent en entrant dans le viewport :

- `Reveal` enveloppe le contenu d'une section et anime `opacity` + `x` (±80 px) avec `whileInView` de motion (`viewport={{ once: true }}` : l'animation ne joue qu'une fois). Les sections alternent gauche / droite.
- `FeatureRow` (pages Social et Fun) fait la meme chose pour les rangees image + texte, la direction suivant l'alternance des rangees.

`whileInView` repose sur IntersectionObserver, ce qui fonctionne aussi dans les conteneurs scrollables internes du site.

## Page Contact

Fichier : `pages/Contact.jsx`

Structure classique de portfolio : grande accroche avec bouton mailto, cartes de contact (Email, LinkedIn, GitHub, logos en noir et blanc comme sur Home), colonne d'informations pratiques (lieu, fuseau, delai de reponse, langues), badge de disponibilite, et un immense "Let's work together" cliquable en pied de page. La section noire finale prepare la transition vers l'outro.

## Navbar

Fichiers : `components/Navbar.jsx`, `css/Navbar.css`

Le menu deroulant du bouton Contact ne s'ouvre qu'au survol d'une vraie souris (`pointerType`) et le survol CSS est enferme dans `@media (hover: hover)` : sur telephone, un appui laissait le bouton allume et le menu ouvert.

Fond opaque suivant le theme (avec fine bordure basse), grille CSS a trois colonnes (`1fr auto 1fr`) : logo a gauche, burger du menu au centre, toggle de theme et bouton Contact a droite, espaces par un `gap`. Les deux colonnes exterieures egales gardent le burger exactement centre. Le burger se transforme en croix en CSS pur. Le logo s'adapte au theme via un filtre CSS (`--logo-filter`) et se penche legerement au survol.

Dans le menu (`NavList.jsx`), la page courante est en rouge, encadree seulement aux angles haut-droit et bas-gauche. La liste est ancree par son bord GAUCHE (`left: 56vw`, au plus pres de la page) : ancree a droite, le libelle le plus long ("Projects & Certificates") s'etalait vers la gauche et passait sur la page. Sous 760 px, la liste se cale juste apres la page inclinee (`left: 58vw`) et le `.nav-extra` (" & Certificates") est masque, il ne reste que "Projects". La liste commence a la hauteur du haut de la page inclinee (`top: calc(19vh - 10px)`, la page etant a l'echelle 0.62) et se tient pres d'elle (`right: 34vw`).

## Personnalisation rapide

- Projets et domaines : objets `PROJECTS` et `DOMAINS` dans `pages/Projects.jsx` ; photo d'un projet : `src/assets/projects/<slug>.jpg`.
- Competences : tableau `SKILLS` dans `pages/Home.jsx` (logo dans `src/assets/skills/`).
- Domaines du typing : tableau `ROLES` dans `pages/Home.jsx`.
- Message de l'easter egg : `PAPER_MESSAGE` dans `components/Avatar.jsx`.
- Position des yeux / poche de l'avatar : constantes `EYES` et `POCKET` dans `components/Avatar.jsx`.
- Contenu Extra et Random : tableaux `DEFS` dans `pages/Extra.jsx` et `pages/Random.jsx` (slug, titre, description ; `aliases` pour rattacher d'autres prefixes de fichiers, ex. `hackaton`).
- Photos des activites : simplement deposer les fichiers dans `src/assets/extra/` (sous-dossiers acceptes) ou `src/assets/random/` avec le bon prefixe de nom — elles sont appliquees automatiquement. Reduire les photos de telephone avant (1800 px suffisent) : les originaux des photos du hackathon sont gardes hors du bundle dans `originals/`, ignore par git.
- Email, reseaux et CV : `lib/links.js`.

## Publication (GitHub Pages)

Fichiers : `.github/workflows/pages.yml`, `vite.config.js`, `public/404.html`

Le depot est prive ; seul le site construit est publie. Un push sur `main` declenche le workflow : `npm ci`, `npm test`, puis `npm run build` depuis le dossier `portfolio/`, et l'artefact `portfolio/dist` part vers GitHub Pages.

Deux variables pilotent ce build :

- `BASE_PATH=/portfolio/` : GitHub Pages sert le site depuis `https://<compte>.github.io/portfolio/`. `vite.config.js` reprend cette valeur dans `base`, et `lib/handTracker.js` prefixe les chemins du modele MediaPipe avec `import.meta.env.BASE_URL`. Sans variable, `base` reste `/` : le `npm run dev` local ne change pas.
- `VITE_SOON=1` : active le plugin `comingSoon()` de `vite.config.js`. Il intercepte les imports de `content/extra` et `content/random` et les remplace par `export default []`. Les deux modules ne sont donc jamais analyses : ni les textes, ni les photos ne se retrouvent dans `dist/`. Les pages recoivent un tableau vide et affichent `components/ComingSoon.jsx` a la place de leurs rangees, le hero et la navigation restant intacts.

Pour publier les vraies pages Extra et Random : retirer les deux dossiers de photos du `.gitignore`, les commiter, et supprimer `VITE_SOON` du workflow.

`public/404.html` est servi par GitHub Pages pour toute adresse inconnue ; il redirige vers `<base>#/404`, ou l'application affiche sa propre page 404.
