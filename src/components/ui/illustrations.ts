// Decorative artwork. Sources are in assets/source/; re-render with scripts/render-assets.js.
// Relative paths (not @/assets) so Jest's @/ mapping to src/ still resolves them.
export const illustrations = {
  authHero: require('../../../assets/images/illustrations/auth-hero.png'),
  alerts: require('../../../assets/images/illustrations/empty-alerts.png'),
  routes: require('../../../assets/images/illustrations/empty-routes.png'),
  tickets: require('../../../assets/images/illustrations/empty-tickets.png'),
  // Dashboard heroes: drawn for the matching heroColors card (src/theme), not for the page background.
  heroPassenger: require('../../../assets/images/illustrations/hero-passenger.png'),
  heroStaff: require('../../../assets/images/illustrations/hero-staff.png'),
  heroAuthority: require('../../../assets/images/illustrations/hero-authority.png'),
  heroAdmin: require('../../../assets/images/illustrations/hero-admin.png'),
} as const;

export type IllustrationName = keyof typeof illustrations;
