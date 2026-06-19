import type { Country, Level2Region, Level3Region } from './types';

// ─── Level 1: Countries ───────────────────────────────────────────────────────────────────────────────

export const COUNTRIES: Country[] = [
{ id: 'us', name: 'United States', emoji: '🇺🇸' },
{ id: 'nz', name: 'New Zealand', emoji: '🇳🇿' },
{ id: 'fr', name: 'France', emoji: '🇫🇷' },
{ id: 'de', name: 'Germany', emoji: '🇩🇪' },
{ id: 'ch', name: 'Switzerland', emoji: '🇨🇭' },
{ id: 'it', name: 'Italy', emoji: '🇮🇹' }];


// ─── Level 2: Regions ─────────────────────────────────────────────────────────────────────────────
// US has three Level 2 regions; the sidebar will offer them as sub-navigation.
// NZ splits into North/South Island.
// European countries each have a single Level 2 entry (sidebar skips to Level 3).

export const LEVEL2_REGIONS: Level2Region[] = [
// United States
{ id: 'us-norcal', name: 'Northern California', countryId: 'us' },
{ id: 'us-socal', name: 'Southern California', countryId: 'us' },
{ id: 'us-pnw', name: 'Pacific Northwest', countryId: 'us' },

// New Zealand
{ id: 'nz-north', name: 'North Island', countryId: 'nz' },
{ id: 'nz-south', name: 'South Island', countryId: 'nz' },

// Europe (single Level 2 per country — sidebar skips this level automatically)
{ id: 'fr-main', name: 'France', countryId: 'fr' },
{ id: 'de-main', name: 'Germany', countryId: 'de' },
{ id: 'ch-main', name: 'Switzerland', countryId: 'ch' },
{ id: 'it-main', name: 'Italy', countryId: 'it' }];


// ─── Level 3: Sub-regions ────────────────────────────────────────────────────────────────────────

export const LEVEL3_REGIONS: Level3Region[] = [
// US — Northern California
{ id: 'sf-bay-area', name: 'San Francisco Bay Area', level2Id: 'us-norcal', countryId: 'us' },
{ id: 'yosemite', name: 'Yosemite National Park', level2Id: 'us-norcal', countryId: 'us' },
{ id: 'sierra-nevada', name: 'Sierra Nevada', level2Id: 'us-norcal', countryId: 'us' },
{ id: 'sequoia-kings', name: 'Sequoia & Kings Canyon', level2Id: 'us-norcal', countryId: 'us' },
{ id: 'marble-mountains', name: 'Marble Mountains Wilderness', level2Id: 'us-norcal', countryId: 'us' },

// US — Southern California
{ id: 'big-bear', name: 'Big Bear & San Bernardino', level2Id: 'us-socal', countryId: 'us' },

// US — Pacific Northwest
{ id: 'washington-cascades', name: 'Washington Cascades', level2Id: 'us-pnw', countryId: 'us' },
{ id: 'oregon', name: 'Oregon', level2Id: 'us-pnw', countryId: 'us' },

// NZ — North Island
{ id: 'auckland-northland', name: 'Auckland & Northland', level2Id: 'nz-north', countryId: 'nz' },
{ id: 'waikato-bop', name: 'Waikato & Bay of Plenty', level2Id: 'nz-north', countryId: 'nz' },
{ id: 'central-north', name: 'Central North Island', level2Id: 'nz-north', countryId: 'nz' },
{ id: 'wellington', name: 'Wellington', level2Id: 'nz-north', countryId: 'nz' },

// NZ — South Island
{ id: 'queenstown-fiordland', name: 'Queenstown & Fiordland', level2Id: 'nz-south', countryId: 'nz' },
{ id: 'wanaka-aspiring', name: 'Wanaka & Aspiring', level2Id: 'nz-south', countryId: 'nz' },
{ id: 'canterbury-mtcook', name: 'Canterbury & Mt Cook', level2Id: 'nz-south', countryId: 'nz' },
{ id: 'west-coast', name: 'West Coast', level2Id: 'nz-south', countryId: 'nz' },
{ id: 'nelson-tasman', name: 'Nelson & Tasman', level2Id: 'nz-south', countryId: 'nz' },

// France
{ id: 'paris', name: 'Paris', level2Id: 'fr-main', countryId: 'fr' },
{ id: 'burgundy', name: 'Burgundy', level2Id: 'fr-main', countryId: 'fr' },
{ id: 'alsace', name: 'Alsace', level2Id: 'fr-main', countryId: 'fr' },

// Germany
{ id: 'black-forest', name: 'Black Forest', level2Id: 'de-main', countryId: 'de' },
{ id: 'rhine-valley', name: 'Rhine Valley', level2Id: 'de-main', countryId: 'de' },

// Switzerland
{ id: 'ch-basel', name: 'Basel', level2Id: 'ch-main', countryId: 'ch' },
{ id: 'bernese-oberland', name: 'Bernese Oberland', level2Id: 'ch-main', countryId: 'ch' },
{ id: 'zurich-region', name: 'Zurich Region', level2Id: 'ch-main', countryId: 'ch' },
{ id: 'central-switzerland', name: 'Central Switzerland', level2Id: 'ch-main', countryId: 'ch' },
{ id: 'ticino', name: 'Ticino', level2Id: 'ch-main', countryId: 'ch' },
{ id: 'lake-geneva', name: 'Lake Geneva', level2Id: 'ch-main', countryId: 'ch' },

// Italy
{ id: 'dolomites', name: 'Dolomites', level2Id: 'it-main', countryId: 'it' },
{ id: 'milan', name: 'Milan', level2Id: 'it-main', countryId: 'it' },
{ id: 'amalfi-coast', name: 'Amalfi Coast', level2Id: 'it-main', countryId: 'it' }];


// ─── Helpers ──────────────────────────────────────────────────────────────────────────────────

export function getLevel2ForCountry(countryId: string): Level2Region[] {
  return LEVEL2_REGIONS.filter((r) => r.countryId === countryId);
}

export function getLevel3ForLevel2(level2Id: string): Level3Region[] {
  return LEVEL3_REGIONS.filter((r) => r.level2Id === level2Id);
}

export function getLevel3ForCountry(countryId: string): Level3Region[] {
  return LEVEL3_REGIONS.filter((r) => r.countryId === countryId);
}

/** Returns true if a country should skip Level 2 and go straight to Level 3 */
export function countrySkipsLevel2(countryId: string): boolean {
  return getLevel2ForCountry(countryId).length === 1;
}