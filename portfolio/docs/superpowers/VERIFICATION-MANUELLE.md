# Verification manuelle — navigation aux gestes

Rien de cette fonctionnalite n'a encore tourne avec une vraie webcam. Tout ce qui
suit a ete verifie par lecture, par tests unitaires ou par build, jamais a l'ecran.

```
cd portfolio
npm run dev
```

## 1. Le site sans les gestes (a faire en premier)

Avant de toucher au bouton camera, confirme que rien n'a bouge pour un visiteur
ordinaire : navigation a la molette, transitions entre pages, menu, theme clair/sombre,
terminal (Ctrl + Alt + T), menu deroulant du bouton Contact, carrousel de projets.

Si quelque chose casse ici, c'est un probleme serieux : la couche gestes est censee
etre totalement inerte tant qu'on n'appuie pas sur le bouton.

## 2. Demarrage

Ouvre l'onglet Reseau des outils de developpement **avant** de cliquer.

1. Bouton camera en bas a droite → la modale s'ouvre avec les trois gestes et la note
   sur l'absence d'espionnage.
2. Echap, « Cancel » et un clic sur le fond la ferment tous les trois.
3. « Enable camera » → le navigateur demande la permission.
4. Pendant « Loading model… », **note dans l'onglet Reseau quels fichiers sont
   reellement demandes** parmi ceux de `public/mediapipe/wasm/` (il y en a six, ~33 Mo).
   En principe une seule paire `vision_wasm_*` plus le modele. Ceux qui ne sont jamais
   demandes pourront etre supprimes : environ 11 Mo de depot par paire inutile.
   Verifie aussi qu'aucun ne renvoie 404.

Le modele fait 7,8 Mo et se telecharge **apres** l'allumage de la camera, derriere un
texte fixe sans progression. Sur une connexion lente, ca peut ressembler a un blocage
avec la camera qui regarde. Si l'effet est desagreable, c'est un point a retravailler.

## 3. Les trois gestes

- **Paume** : le curseur suit la main, en miroir (main a droite → curseur a droite).
- **Pincement bref** : clique. Teste sur les liens de la navbar et sur le bouton de
  theme, les plus petites cibles du site.
- **Pincement maintenu + glisse** : fait defiler. Vers le haut = la page descend.

Le point le plus incertain est la precision du clic. Pincer deplace physiquement la
paume ; si ce deplacement depasse 40 px une fois ramene a l'ecran, le clic est
reclassifie en glisse et **ne fait rien, silencieusement**. Si les clics semblent
capricieux, augmente `clickMaxPx` dans `src/lib/gestureEngine.js` avant de toucher aux
seuils de pincement, qui eux sont couverts par des tests.

## 4. Le point le plus fragile : le scroll a travers une transition

Descends jusqu'en bas d'une page en pincant, et continue. Le site doit passer a la page
suivante, et la nouvelle page doit arriver **en haut**, pas deja defilee.

C'est le defaut qui a demande le plus de corrections. Si la nouvelle page arrive
defilee, ou si deux transitions s'enchainent d'un coup, signale-le.

Verifie aussi que le scroll fonctionne toujours quand le curseur passe **sur la
vignette** en bas a droite.

## 5. Sortie et confidentialite

C'est la promesse affichee dans la modale, donc le test qui compte le plus.

Apres chaque sortie, **le voyant de la camera doit s'eteindre** :

- clic sur le bouton (devenu rouge avec une icone stop)
- touche Echap
- Echap **pendant** « Loading model… », puis rouvrir et relancer — le cas qui fuyait

Autre chose a savoir : changer d'onglet **met en pause** la detection mais garde le flux
ouvert, donc le voyant reste allume dans un onglet en arriere-plan. C'est voulu (la
promesse porte sur la sortie), mais c'est le genre de detail qu'un visiteur attentif
remarque.

## 6. Cas d'erreur

- Refuser la permission → message explicatif, pas de plantage.
- Debrancher la webcam ou revoquer la permission en cours de session → message
  « The camera was disconnected… ». Sans ce correctif, le curseur gelait sans rien dire.

## 7. Accessibilite de la modale

Au clavier seul : `Tab` doit rester **dans** la modale et ne jamais atteindre la navbar
derriere. Teste aussi apres avoir clique sur « Enable camera » : ce bouton se desactive,
ce qui faisait auparavant s'echapper le focus.

## 8. Menu Contact

Survole « Contact » a la main pour ouvrir son menu deroulant, puis sors du mode gestes
par Echap. Le menu doit se refermer — il restait ouvert avant correction.

## 9. Les deux themes

Bouton, modale et vignette doivent rester lisibles en clair comme en sombre.
