# @datagouv/components-next

Le package `@datagouv/components-next` est installe dans le Prototype Lab.

## Ce que le projet utilise directement

- le package npm comme dependance versionnee ;
- le CSS compile via `@import "@datagouv/components-next/dist/components.css";` dans `app/globals.css` ;
- les assets publies par le package comme reference visuelle ;
- l'inventaire des composants pour guider les transpositions React locales.

## Limite importante

Malgre son nom, `components-next` ne designe pas Next.js. Le package expose une bibliotheque Vue :

- `src/main.ts` declare un plugin Vue `datagouv` ;
- les composants publies sont des fichiers `.vue` ;
- les peer dependencies attendues sont `vue`, `vue-router` et `echarts`.

Dans ce projet Next/React, ne pas importer les composants depuis la racine du package dans une page ou un composant React. Cela forcerait Next a traiter des Single File Components Vue.

## Regle d'integration

Pour un prototype, partir du composant Vue officiel comme reference fonctionnelle et visuelle, puis creer une version React locale dans `/components` uniquement quand elle est utile au Prototype Lab.

Les imports directs acceptables sont les assets/CSS publics du package, par exemple :

```css
@import "@datagouv/components-next/dist/components.css";
```

Le layout racine contient aussi `<div id="tooltips" />`, requis par la documentation du package pour les toggletips.
