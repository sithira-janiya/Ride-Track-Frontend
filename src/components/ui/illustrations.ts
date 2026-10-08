// Decorative artwork. Sources are in assets/source/; re-render with scripts/render-assets.js.
// Relative paths (not @/assets) so Jest's @/ mapping to src/ still resolves them.
export const illustrations = {
  authHero: require('../../../assets/images/illustrations/auth-hero.png'),
  alerts: require('../../../assets/images/illustrations/empty-alerts.png'),
  routes: require('../../../assets/images/illustrations/empty-routes.png'),
  tickets: require('../../../assets/images/illustrations/empty-tickets.png'),
} as const;

export type IllustrationName = keyof typeof illustrations;
