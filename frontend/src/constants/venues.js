/**
 * venues.js — Preset Venue Configurations & Schedule Phases
 * Each venue defines its spatial node topology used by SVGParser, NodeGraph, and A* engine.
 */

export const PRESET_VENUES = [
  {
    id: 'railway-terminal',
    name: 'Central Railway Terminal',
    description: 'Mumbai-scale terminus, 12 platforms',
    nodes: [
      'N_MAIN_HALL', 'N_PLATFORM_A', 'N_PLATFORM_B', 'N_PLATFORM_C',
      'N_GATE_EAST', 'N_GATE_WEST', 'N_CONCOURSE', 'N_EXIT_NORTH',
      'N_EXIT_SOUTH', 'N_TICKET_HALL', 'N_FOOTBRIDGE', 'N_TAXI_BAY'
    ],
    defaultCrowd: 45000,
    maxCrowd: 200000,
    svg: null,
  },
  {
    id: 'ipl-stadium',
    name: 'IPL Cricket Stadium',
    description: '80,000-seat cricket ground',
    nodes: [
      'N_GATE_A', 'N_GATE_B', 'N_GATE_C', 'N_GATE_D',
      'N_NORTH_STAND', 'N_SOUTH_STAND', 'N_EAST_STAND', 'N_WEST_STAND',
      'N_VIP_LOBBY', 'N_CONCOURSE_INNER', 'N_CONCOURSE_OUTER',
      'N_EXIT_EMERGENCY_1', 'N_EXIT_EMERGENCY_2', 'N_CAR_PARK'
    ],
    defaultCrowd: 78000,
    maxCrowd: 100000,
    svg: null,
  },
  {
    id: 'kumbh-ghat',
    name: 'Kumbh Mela Ghat Sector',
    description: 'Riverbank pilgrimage sector',
    nodes: [
      'N_MAIN_GHAT', 'N_UPPER_PATH', 'N_LOWER_PATH', 'N_BRIDGE_A',
      'N_BRIDGE_B', 'N_SECTOR_NORTH', 'N_SECTOR_SOUTH', 'N_RIVER_EDGE',
      'N_CAMP_ZONE', 'N_MEDICAL_POST', 'N_EXIT_HIGHWAY', 'N_EXIT_BOAT'
    ],
    defaultCrowd: 500000,
    maxCrowd: 5000000,
    svg: null,
  },
  {
    id: 'music-festival',
    name: 'Open-Air Music Festival',
    description: 'Multi-stage outdoor festival grounds',
    nodes: [
      'N_MAIN_STAGE', 'N_STAGE_B', 'N_STAGE_C', 'N_ENTRY_ARCH',
      'N_FOOD_ZONE', 'N_BAR_AREA', 'N_VIP_PIT', 'N_MOSH_PIT',
      'N_CAMPING', 'N_EXIT_LEFT', 'N_EXIT_RIGHT', 'N_MEDICAL'
    ],
    defaultCrowd: 25000,
    maxCrowd: 80000,
    svg: null,
  }
];

export const SCHEDULE_PHASES = [
  'Pre-Event Arrival',
  'Event In Progress',
  'Halftime / Intermission',
  'Post-Event Mass Exit',
  'Emergency Evacuation'
];

/**
 * Get a preset venue by its ID string.
 * @param {string} id - Venue ID (e.g. 'railway-terminal')
 * @returns {Object|undefined}
 */
export const getVenueById = (id) => PRESET_VENUES.find(v => v.id === id);

/**
 * Get a preset venue by its display name.
 * @param {string} name - Venue display name (e.g. 'Central Railway Terminal')
 * @returns {Object|undefined}
 */
export const getVenueByName = (name) => PRESET_VENUES.find(v => v.name === name);

export default { PRESET_VENUES, SCHEDULE_PHASES, getVenueById, getVenueByName };
