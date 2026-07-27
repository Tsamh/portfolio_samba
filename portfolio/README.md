# Portfolio — Samba

Portfolio interactif construit avec React 18, Vite et la librairie d'animation `motion` (Framer Motion).

Ce document explique, fonctionnalite par fonctionnalite, comment le site est construit dans le code. Il est mis a jour a chaque evolution du site.

## Sommaire

1. [Demarrage](#demarrage)
2. [Architecture generale](#architecture-generale)
3. [Navigation entre les pages](#navigation-entre-les-pages)
4. [Intro : l'avatar interactif](#intro--lavatar-interactif)
5. [Easter egg de la poche](#easter-egg-de-la-poche)
6. [Outro : sortir de la tete](#outro--sortir-de-la-tete)
7. [Carrousel 3D des projets](#carrousel-3d-des-projets)
8. [Galeries d'activites (Extra et Random)](#galeries-dactivites-extra-et-random)
9. [Scenes avatar par page](#scenes-avatar-par-page)
10. [Effet machine a ecrire (About)](#effet-machine-a-ecrire-about)
11. [Theme clair / sombre](#theme-clair--sombre)
12. [Terminal de navigation](#terminal-de-navigation)
13. [Navigation aux gestes de la main](#navigation-aux-gestes-de-la-main)
14. [Animations d'apparition des sections](#animations-dapparition-des-sections)
15. [Page Contact](#page-contact)
16. [Personnalisation rapide](#personnalisation-rapide)

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
    avatar/normal.png      L'avatar de l'intro et de l'outro
    projects/              Les images du carrousel (deposees par l'utilisateur)
```

Le site est une single-page : les six pages existent toutes dans le DOM, seule la page active est visible (`.page.active`). L'ordre des pages est defini dans `App.jsx` (`PAGES`) et doit rester synchronise avec `NavList.jsx` et `Terminal.jsx`.

## Navigation entre les pages

Fichier : `hooks/usePortfolio.js`

Deux modes de navigation :

- Clic (menu, boutons) : `goTo(index)` declenche un overlay qui balaie l'ecran (animation CSS `slide`) pendant que la page change en dessous.
- Scroll : chaque page a son propre conteneur scrollable (`.page-scroll`). Quand l'utilisateur atteint le bas d'une page et continue de scroller, `handleWheel` detecte la position (`scrollTop + clientHeight >= scrollHeight`) et passe a la page suivante avec une animation d'entree (`enterFromBelow` / `enterFromAbove` dans `App.css`). Un cooldown (`cooling.current`) empeche les changements en rafale.

Cas particulier : en bas de la toute derniere page (Contact), le callback `onEndReached` est appele au lieu de changer de page — c'est lui qui ouvre l'outro.

## Intro : l'avatar interactif

Fichiers : `components/Intro.jsx`, `components/Avatar.jsx`, `css/Intro.css`, `css/Avatar.css`

L'avatar (`assets/avatar/normal.png`) est place a gauche de l'ecran, avec le titre "Samba's Portfolio" a sa droite. L'origine du zoom (les cheveux) est calculee dynamiquement en pixels au chargement (`setHairOrigin`), ce qui garde le zoom exact quelle que soit la mise en page.

Comment ca marche :

- Zoom au scroll : une boucle `requestAnimationFrame` fait tendre une valeur `current` (0 a 1) vers une cible `target` modifiee par la molette (lerp = interpolation lineaire douce). Le conteneur `.intro-zoom` recoit `scale(1 + p * 34)` avec `transform-origin` place sur les cheveux noirs (`ZOOM_ORIGIN = '51% 22%'` dans `Avatar.jsx`). Le fond passe du blanc au noir pendant la plongee, puis l'overlay entier devient transparent et revele le site. La vitesse est volontairement lente (facteur molette 0.0022).
- Yeux qui suivent la souris : les pupilles imprimees sur l'image sont recouvertes par deux pastilles couleur peau positionnees en pourcentage de l'image (constante `EYES`). A chaque `mousemove`, la pupille redessinee est translatee vers le curseur, avec une amplitude maximale proportionnelle a la taille de l'oeil.
- Clignement : un `setTimeout` recursif avec un delai aleatoire (2.2 a 5.5 s) ajoute brievement la classe `blink`, qui ecrase la pupille (`scaleY(0.08)`). Une chance sur quatre de double clignement.
- Respiration : animation CSS `avatar-breathe` (legere translation verticale), mise en pause pendant le zoom via `animationPlayState`.
- Inclinaison de tete : le conteneur `.avatar-bob` pivote de quelques degres vers le curseur, desactive pendant le zoom (attribut `data-zooming` pose par l'Intro et lu par l'Avatar).

## Easter egg de la poche

Fichier : `components/Avatar.jsx` (constantes `POCKET` et `PAPER_MESSAGE`)

Une zone cliquable invisible recouvre la poche de la veste. Un compteur d'etapes (`paperStage`, 0 a 3) avance a chaque clic :

- Etapes 1 et 2 : un bout de papier depasse progressivement de la poche. L'effet de sortie est obtenu avec un conteneur a `overflow: hidden` aligne sur le haut de la poche, dans lequel le papier est translate verticalement (`translateY 101% -> 72% -> 38%`).
- Etape 3 : le bout de papier est masque et une note complete apparait au-dessus de la poche (animation `note-pop`) avec le message en anglais. Un clic supplementaire range le papier (retour a l'etape 0).

## Outro : sortir de la tete

Fichiers : `components/Outro.jsx`, fin de `pages/Contact.jsx`

En bas de la page Contact se trouve une section entierement noire (`.void-section`). En continuant de scroller tout en bas, `usePortfolio` appelle `onEndReached`, qui monte l'overlay `Outro`.

L'outro est le miroir exact de l'intro, entierement pilote au scroll (rien d'automatique) :

- Le declenchement est double, pour etre facile et fluide : arriver en bas de la derniere page a la molette, ou simplement faire defiler la section noire jusqu'a ce qu'elle occupe 85 % de l'ecran (IntersectionObserver dans `Contact.jsx` qui emet l'evenement `portfolio:outro`, ecoute par `App.jsx`).
- On demarre a `p = 1` : ecran noir, camera "dans les cheveux". La transition avec la section noire est donc invisible.
- Scroller vers le bas fait baisser la cible -> dezoom progressif -> on ressort de la tete de l'avatar.
- Arrive a `p ~ 0`, l'avatar affiche une bulle "Goodbye! Thanks for visiting." avec une main qui salue, et deux boutons : retour au debut ou retour au site.
- Scroller vers le haut re-plonge dans les cheveux et referme l'outro.

## Carrousel 3D des projets

Fichiers : `components/ProjectCarousel.jsx`, `css/ProjectCarousel.css`, integration dans `pages/Projects.jsx`

Replique du rendu de reference (`assets/carroussel.mp4`) : une cascade diagonale profonde de plans portrait qui fuit vers le coin haut-droit, sur fond noir.

- Position : chaque plan est place le long d'une diagonale : `x` avance par pas de `DX`, `y = -x * SLOPE` (montee), `z = -x * DEPTH` (recul en profondeur, la perspective CSS du viewport fait converger la file vers un point de fuite).
- Boucle infinie : la position est passee dans une fonction `wrap(min, max, v)` (modulo) : un plan qui sort par un bout reapparait par l'autre.
- Vague liee a la vitesse : chaque plan suit l'offset global de scroll a travers son propre `useSpring` avec une masse croissante (`FOLLOW(index)`). Pendant un scroll rapide, les plans lourds trainent derriere : l'espacement s'etire puis se retasse elastiquement — c'est exactement l'effet de la video.
- Hover : les navigateurs sont peu fiables pour detecter le survol d'elements transformes en 3D, donc le survol est calcule manuellement : a chaque mouvement de souris (et pendant que les cartes defilent), le rectangle projete de chaque plan (`getBoundingClientRect`, exact pour des plans non pivotes) est teste contre le curseur ; parmi les plans touches, le plus proche de la camera (projection la plus large) gagne. Le plan survole bondit vers la camera (ressort sur `z`) et une ligne horizontale se deploie a sa droite avec le nom du projet revele par un effet de brouillage (`ScrambleText`).
- Numeros : petit index monospace au-dessus de chaque plan.
- Zones laterales : le carrousel capture la molette avec un listener natif non passif (`addEventListener('wheel', ..., { passive: false })` + `preventDefault`) : seules les cartes bougent, la page ne defile pas. Deux couloirs avec chevrons animes l'encadrent : la molette y est laissee au navigateur, ce qui permet de continuer a faire defiler la page.
- Images : chargees automatiquement depuis `src/assets/projects/` via `import.meta.glob`, triees par nom de fichier. Sans images, des photos de remplacement (picsum.photos) sont utilisees.

Constantes de reglage en haut du fichier : `DX` (espacement), `SLOPE` (pente), `DEPTH` (profondeur), `HOVER_LIFT`, `FOLLOW` (ressorts de la vague).

## Galeries d'activites (Extra et Random)

Fichiers : `components/ActivityRow.jsx`, `css/Activity.css`, `pages/Extra.jsx`, `pages/Random.jsx`

Les pages Extra (ex Social) et Random (ex Fun) affichent chaque activite avec :

- Un conteneur "creative hover" reproduisant l'effet de `assets/ref` : les trois premieres photos sont decoupees en tranches diagonales via `clip-path: polygon(...)`. Survoler le conteneur replie toutes les tranches, sauf celle sous le curseur qui s'etend en plein cadre (transition CSS sur `clip-path`).
- Un clic sur une tranche ouvre une lightbox : grande image centree, bandeau de vignettes en dessous (au moins 5 photos par activite), navigation par fleches a l'ecran ou au clavier (gauche/droite, Echap pour fermer).

Chargement automatique des photos (`lib/activities.js`) : les dossiers `src/assets/extra/` et `src/assets/random/` sont scannes par `import.meta.glob`. Les fichiers partageant un meme prefixe appartiennent a la meme activite (`indabax_1.jpg`, `indabax_2.jpg` -> activite `indabax`). Les tirets et underscores sont ignores dans le regroupement : `graduation25_1.jpg` et `graduation_25_2.jpg` tombent dans le meme groupe. Deposer une nouvelle photo suffit : elle est appliquee au site sans modification de code. Un prefixe inconnu cree meme automatiquement une nouvelle rangee d'activite (titre genere depuis le nom du fichier). Chaque galerie est completee a 5 images minimum avec des photos de remplacement (picsum.photos). Le fichier HEIC d'IndabaX a ete converti en JPG pour etre affichable par les navigateurs, et `vite.config.js` accepte les extensions en majuscules.

## Scenes avatar par page

Fichiers : `components/AvatarScene.jsx`, `css/AvatarScene.css`

Sur le modele de `assets/avatar/ref.png`, l'avatar est mis en situation differemment sur chaque page grace a des accessoires dessines en CSS pur par-dessus l'image, dans la vignette circulaire :

- Home : bulle de dialogue "Hello!" animee.
- Projects : ordinateur portable ouvert devant lui, lignes de code qui clignotent a l'ecran.
- Extra : badge de conference avec lanieres sur la poitrine.
- Random : manette de jeu dans les mains, qui bascule doucement.
- Contact : telephone a l'oreille avec ondes d'appel animees.

Chaque variante a aussi son degrade de fond et sa legende (constante `VARIANTS`). La vignette flotte doucement (animation `scene-float`).

## Effet machine a ecrire (Home)

Fichier : `components/TypingText.jsx`

L'ancienne page About est devenue la page Home du site. Son titre tape puis efface successivement les metiers (`ROLES` dans `Home.jsx`). Machine a etats simple : taper caractere par caractere -> pause -> effacer -> mot suivant. Le curseur clignotant est un simple `|` anime en CSS (`typing-cursor`).

## Theme clair / sombre

Fichiers : `css/index.css` (variables), `components/ThemeToggle.jsx`, etat dans `App.jsx`

Toutes les couleurs du site sont des variables CSS definies sur `:root` (theme clair, par defaut) et surchargees par `[data-theme='dark']`. Le bouton soleil/lune bascule un etat React qui pose `data-theme` sur `<html>` et persiste le choix dans `localStorage`. Une transition globale sur `background-color` et `color` rend le changement fluide. Le carrousel et la section noire restent noirs quel que soit le theme (choix volontaire).

Le terminal permet aussi de changer le theme (`theme light|dark|toggle`).

## Terminal de navigation

Fichiers : `components/Terminal.jsx`, `css/Terminal.css`

Bouton `>_` dans la navbar (entre le logo et le menu) — survoler le bouton affiche le raccourci clavier, et la combinaison Ctrl + Alt + T ouvre ou ferme le terminal depuis n'importe ou. Ouvre une fenetre de terminal simulee : un tableau de lignes (`lines`) fait office d'ecran, un champ texte fait office de prompt. Chaque commande est un `case` d'un `switch` : `ls`, `cd <page>`, `theme`, `whoami`, `clear`, `exit`... La navigation appelle simplement `goTo(index)` du hook central. Echap ou le point rouge ferment la fenetre.

## Navigation aux gestes de la main

Fichiers : `components/GestureNav.jsx`, `components/GesturePreview.jsx`, `lib/gestureEngine.js`, `lib/gestureDispatch.js`, `lib/handTracker.js`, `css/GestureNav.css`

Bouton camera en bas a droite. Il ouvre une modale qui explique les trois gestes puis demande l'acces a la camera. Une fois le mode actif, la paume deplace un curseur a l'ecran, un pincement bref clique, et un pincement maintenu puis glisse fait defiler la page. Une vignette repliable montre le flux et le squelette de la main detectee. Le bouton est masque sous 900 px et sur ecran tactile.

La detection tourne entierement dans le navigateur via MediaPipe. La video n'est ni envoyee, ni enregistree, ni stockee nulle part, et tous les tracks du flux sont liberes des la sortie : le voyant de la camera s'eteint, ce qui rend la promesse verifiable.

Le principe interne : `gestureEngine.js` transforme les 21 points de la main en position de curseur et en actions (clic, defilement) — c'est du calcul pur, sans DOM ni camera, et c'est le seul module couvert par des tests unitaires. `gestureDispatch.js` rejoue ensuite ces actions sous forme de vrais evenements DOM sur l'element vise. Le reste du site n'a donc rien eu a changer : tout ce qui repondait deja a la souris repond a la main, y compris le passage d'une page a l'autre.

Le runtime MediaPipe est auto-heberge dans `public/mediapipe/wasm/` et le modele dans `public/models/hand_landmarker.task`. La bibliotheque est chargee a la demande : un visiteur qui n'appuie jamais sur le bouton ne la telecharge pas.

## Animations d'apparition des sections

Fichiers : `components/Reveal.jsx`, `components/FeatureRow.jsx`

Toutes les sections de contenu du site glissent en entrant dans le viewport :

- `Reveal` enveloppe le contenu d'une section et anime `opacity` + `x` (±80 px) avec `whileInView` de motion (`viewport={{ once: true }}` : l'animation ne joue qu'une fois). Les sections alternent gauche / droite.
- `FeatureRow` (pages Social et Fun) fait la meme chose pour les rangees image + texte, la direction suivant l'alternance des rangees.

`whileInView` repose sur IntersectionObserver, ce qui fonctionne aussi dans les conteneurs scrollables internes du site.

## Page Contact

Fichier : `pages/Contact.jsx`

Structure classique de portfolio : grande accroche avec bouton mailto, cartes de contact (Email, LinkedIn, GitHub), colonne d'informations pratiques (lieu, fuseau, delai de reponse, langues), badge de disponibilite, et un immense "Let's work together" cliquable en pied de page. La section noire finale prepare la transition vers l'outro.

## Navbar

Fichiers : `components/Navbar.jsx`, `css/Navbar.css`

Fond opaque suivant le theme (avec fine bordure basse), grille CSS a cinq colonnes egales : logo, bouton terminal, burger du menu, toggle de theme, bouton Contact. Les colonnes egales placent naturellement le terminal a mi-chemin logo/menu et le toggle a mi-chemin menu/Contact. Le burger se transforme en croix en CSS pur. Le logo s'adapte au theme via un filtre CSS (`--logo-filter`).

## Personnalisation rapide

- Images du carrousel : deposer des fichiers dans `src/assets/projects/` (`01.jpg`, `02.jpg`, ... — l'ordre suit le nom).
- Projets : tableau `PROJECTS` dans `pages/Projects.jsx`.
- Metiers du typing : tableau `ROLES` dans `pages/Home.jsx`.
- Message de l'easter egg : `PAPER_MESSAGE` dans `components/Avatar.jsx`.
- Position des yeux / poche de l'avatar : constantes `EYES` et `POCKET` dans `components/Avatar.jsx`.
- Contenu Extra et Random : tableaux `DEFS` dans `pages/Extra.jsx` et `pages/Random.jsx` (slug, titre, description).
- Photos des activites : simplement deposer les fichiers dans `src/assets/extra/` ou `src/assets/random/` avec le bon prefixe de nom — elles sont appliquees automatiquement.
- Email et reseaux : `pages/Contact.jsx` et `components/ContactButton.jsx`.
