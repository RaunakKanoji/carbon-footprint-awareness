import { config, library } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import {
  faBicycle,
  faBolt,
  faBus,
  faCar,
  faChartPie,
  faCouch,
  faLeaf,
  faPersonRunning,
  faShoppingBag,
  faTrash,
  faTree,
  faUser,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';

// Prevent Font Awesome from dynamically adding its CSS since we did it above
config.autoAddCss = false;

// Add icons to the library
library.add(
  faCar,
  faBus,
  faBicycle,
  faUtensils,
  faBolt,
  faShoppingBag,
  faTrash,
  faChartPie,
  faLeaf,
  faPersonRunning,
  faTree,
  faUser,
  faCouch,
);

// Map string keys to the icon objects to prevent singleton bugs in Next.js Server/Client bundles
export const iconMap = {
  car: faCar,
  bus: faBus,
  bicycle: faBicycle,
  utensils: faUtensils,
  bolt: faBolt,
  'shopping-bag': faShoppingBag,
  trash: faTrash,
  'chart-pie': faChartPie,
  leaf: faLeaf,
  'person-running': faPersonRunning,
  tree: faTree,
  user: faUser,
  couch: faCouch,
} as const;
