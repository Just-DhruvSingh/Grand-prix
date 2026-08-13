/**
 * venues.js — Preset Venue Spatial Node Definitions
 * Complete coordinate + neighbor topology for each venue.
 * Used by NodeGraph to build the spatial graph without an SVG upload.
 */

/**
 * Generate venue spatial nodes and edge connections for a given venue name.
 * All coordinates are in a 1000x600 viewBox space.
 *
 * @param {string} venueName - Display name of the venue
 * @returns {{ nodes: Object[], connections: string[][] }}
 */
export function getVenueTopology(venueName) {
  const topologies = {
    'Central Railway Terminal': {
      nodes: [
        { id: 'N_GATE1',           name: 'Gate 1 (Platforms 1-4)',    x: 140, y: 70,  type: 'entry',        capacity: 8000  },
        { id: 'N_MAIN_IN',         name: 'Main Entry Concourse',      x: 500, y: 70,  type: 'entry',        capacity: 15000 },
        { id: 'N_TICKET_IN',       name: 'Ticketing Plaza Entry',     x: 840, y: 70,  type: 'entry',        capacity: 6000  },
        { id: 'N_WEST_UPPER',      name: 'West Upper Promenade',      x: 140, y: 180, type: 'corridor',     capacity: 5000  },
        { id: 'N_MID_UPPER',       name: 'Central Upper Passage',     x: 500, y: 180, type: 'corridor',     capacity: 8000  },
        { id: 'N_EAST_UPPER',      name: 'East Upper Promenade',      x: 840, y: 180, type: 'corridor',     capacity: 5000  },
        { id: 'N_WEST_CHOKE',      name: 'West Corridor Bottleneck',  x: 260, y: 300, type: 'corridor',     capacity: 3000  },
        { id: 'N_MAIN_CHOKE',      name: 'Main Concourse Choke Point',x: 500, y: 300, type: 'intersection', capacity: 2000,  isChoke: true },
        { id: 'N_EAST_CHOKE',      name: 'East Corridor Bottleneck',  x: 740, y: 300, type: 'corridor',     capacity: 3000  },
        { id: 'N_WEST_BYPASS',     name: 'West Emergency Bypass',     x: 140, y: 420, type: 'corridor',     capacity: 6000  },
        { id: 'N_CENTRAL_BYPASS',  name: 'Central Distribution Hall', x: 500, y: 420, type: 'corridor',     capacity: 10000 },
        { id: 'N_EAST_BYPASS',     name: 'East Emergency Bypass',     x: 840, y: 420, type: 'corridor',     capacity: 6000  },
        { id: 'N_SOUTH_EXIT',      name: 'South Concourse Exit',      x: 160, y: 530, type: 'exit',         capacity: 12000, isExit: true },
        { id: 'N_CENTRAL_EXIT',    name: 'Main Terminal Exit',        x: 500, y: 530, type: 'exit',         capacity: 20000, isExit: true },
        { id: 'N_NORTH_EXIT',      name: 'Emergency Exit North',      x: 840, y: 530, type: 'exit',         capacity: 8000,  isExit: true },
      ],
      connections: [
        ['N_GATE1', 'N_WEST_UPPER'],
        ['N_MAIN_IN', 'N_MID_UPPER'],
        ['N_TICKET_IN', 'N_EAST_UPPER'],
        ['N_WEST_UPPER', 'N_MID_UPPER'],
        ['N_MID_UPPER', 'N_EAST_UPPER'],
        ['N_WEST_UPPER', 'N_WEST_CHOKE'],
        ['N_MID_UPPER', 'N_MAIN_CHOKE'],
        ['N_EAST_UPPER', 'N_EAST_CHOKE'],
        ['N_WEST_CHOKE', 'N_MAIN_CHOKE'],
        ['N_MAIN_CHOKE', 'N_EAST_CHOKE'],
        ['N_WEST_CHOKE', 'N_WEST_BYPASS'],
        ['N_MAIN_CHOKE', 'N_CENTRAL_BYPASS'],
        ['N_EAST_CHOKE', 'N_EAST_BYPASS'],
        ['N_WEST_BYPASS', 'N_CENTRAL_BYPASS'],
        ['N_CENTRAL_BYPASS', 'N_EAST_BYPASS'],
        ['N_WEST_BYPASS', 'N_SOUTH_EXIT'],
        ['N_CENTRAL_BYPASS', 'N_CENTRAL_EXIT'],
        ['N_EAST_BYPASS', 'N_NORTH_EXIT'],
      ],
    },

    'IPL Cricket Stadium': {
      nodes: [
        { id: 'N_GATE_A',            name: 'Turnstile Gate A',           x: 140, y: 70,  type: 'entry',        capacity: 10000 },
        { id: 'N_GATE_B',            name: 'Main Gate B',                x: 500, y: 70,  type: 'entry',        capacity: 20000 },
        { id: 'N_GATE_C',            name: 'VIP Gate C',                 x: 840, y: 70,  type: 'entry',        capacity: 5000  },
        { id: 'N_NORTH_STAND',       name: 'North Stand Corridor',       x: 140, y: 180, type: 'corridor',     capacity: 12000 },
        { id: 'N_CONCOURSE_INNER',   name: 'Inner Ring Concourse',       x: 500, y: 180, type: 'corridor',     capacity: 15000 },
        { id: 'N_SOUTH_STAND',       name: 'South Stand Corridor',       x: 840, y: 180, type: 'corridor',     capacity: 12000 },
        { id: 'N_WEST_STAND',        name: 'West Stand Choke',           x: 260, y: 300, type: 'corridor',     capacity: 4000  },
        { id: 'N_CONCOURSE_OUTER',   name: 'Outer Ring Ramp (Choke)',    x: 500, y: 300, type: 'intersection', capacity: 3000,  isChoke: true },
        { id: 'N_EAST_STAND',        name: 'East Stand Choke',           x: 740, y: 300, type: 'corridor',     capacity: 4000  },
        { id: 'N_VIP_LOBBY',         name: 'VIP Lobby Bypass',           x: 140, y: 420, type: 'corridor',     capacity: 3000  },
        { id: 'N_GATE_D',            name: 'Gate D Food Court Plaza',    x: 500, y: 420, type: 'corridor',     capacity: 8000  },
        { id: 'N_CAR_PARK',          name: 'Car Park Exit Corridor',     x: 840, y: 420, type: 'corridor',     capacity: 6000  },
        { id: 'N_EXIT_EMERGENCY_1',  name: 'Emergency Exit Gate 8',      x: 160, y: 530, type: 'exit',         capacity: 10000, isExit: true },
        { id: 'N_EXIT_EMERGENCY_2',  name: 'Sector Ground Exit',         x: 500, y: 530, type: 'exit',         capacity: 20000, isExit: true },
        { id: 'N_EXIT_CAR_PARK',     name: 'Car Park Exit',              x: 840, y: 530, type: 'exit',         capacity: 8000,  isExit: true },
      ],
      connections: [
        ['N_GATE_A', 'N_NORTH_STAND'],
        ['N_GATE_B', 'N_CONCOURSE_INNER'],
        ['N_GATE_C', 'N_SOUTH_STAND'],
        ['N_NORTH_STAND', 'N_CONCOURSE_INNER'],
        ['N_CONCOURSE_INNER', 'N_SOUTH_STAND'],
        ['N_NORTH_STAND', 'N_WEST_STAND'],
        ['N_CONCOURSE_INNER', 'N_CONCOURSE_OUTER'],
        ['N_SOUTH_STAND', 'N_EAST_STAND'],
        ['N_WEST_STAND', 'N_CONCOURSE_OUTER'],
        ['N_CONCOURSE_OUTER', 'N_EAST_STAND'],
        ['N_WEST_STAND', 'N_VIP_LOBBY'],
        ['N_CONCOURSE_OUTER', 'N_GATE_D'],
        ['N_EAST_STAND', 'N_CAR_PARK'],
        ['N_VIP_LOBBY', 'N_GATE_D'],
        ['N_GATE_D', 'N_CAR_PARK'],
        ['N_VIP_LOBBY', 'N_EXIT_EMERGENCY_1'],
        ['N_GATE_D', 'N_EXIT_EMERGENCY_2'],
        ['N_CAR_PARK', 'N_EXIT_CAR_PARK'],
      ],
    },

    'Kumbh Mela Ghat Sector': {
      nodes: [
        { id: 'N_MAIN_GHAT',     name: 'Main Ghat Steps',         x: 500, y: 70,  type: 'entry',        capacity: 50000 },
        { id: 'N_UPPER_PATH',    name: 'Upper Pathway',            x: 250, y: 130, type: 'entry',        capacity: 20000 },
        { id: 'N_LOWER_PATH',    name: 'Lower Pathway',            x: 750, y: 130, type: 'entry',        capacity: 20000 },
        { id: 'N_BRIDGE_A',      name: 'Pontoon Bridge A',         x: 180, y: 220, type: 'corridor',     capacity: 8000,  isChoke: true },
        { id: 'N_SECTOR_NORTH',  name: 'North Sector Plaza',       x: 500, y: 220, type: 'corridor',     capacity: 30000 },
        { id: 'N_BRIDGE_B',      name: 'Pontoon Bridge B',         x: 820, y: 220, type: 'corridor',     capacity: 8000,  isChoke: true },
        { id: 'N_RIVER_EDGE',    name: 'River Edge (Danger Zone)', x: 350, y: 330, type: 'intersection', capacity: 5000,  isChoke: true },
        { id: 'N_SECTOR_SOUTH',  name: 'South Sector Plaza',       x: 650, y: 330, type: 'corridor',     capacity: 25000 },
        { id: 'N_CAMP_ZONE',     name: 'Camp Zone',                x: 200, y: 430, type: 'corridor',     capacity: 40000 },
        { id: 'N_MEDICAL_POST',  name: 'Medical Post',             x: 500, y: 430, type: 'corridor',     capacity: 3000  },
        { id: 'N_EXIT_HIGHWAY',  name: 'Highway Exit',             x: 300, y: 530, type: 'exit',         capacity: 30000, isExit: true },
        { id: 'N_EXIT_BOAT',     name: 'Boat Evacuation Point',    x: 700, y: 530, type: 'exit',         capacity: 10000, isExit: true },
      ],
      connections: [
        ['N_MAIN_GHAT', 'N_SECTOR_NORTH'],
        ['N_UPPER_PATH', 'N_BRIDGE_A'],
        ['N_LOWER_PATH', 'N_BRIDGE_B'],
        ['N_BRIDGE_A', 'N_SECTOR_NORTH'],
        ['N_SECTOR_NORTH', 'N_BRIDGE_B'],
        ['N_BRIDGE_A', 'N_RIVER_EDGE'],
        ['N_SECTOR_NORTH', 'N_SECTOR_SOUTH'],
        ['N_BRIDGE_B', 'N_SECTOR_SOUTH'],
        ['N_RIVER_EDGE', 'N_CAMP_ZONE'],
        ['N_RIVER_EDGE', 'N_MEDICAL_POST'],
        ['N_SECTOR_SOUTH', 'N_MEDICAL_POST'],
        ['N_CAMP_ZONE', 'N_MEDICAL_POST'],
        ['N_CAMP_ZONE', 'N_EXIT_HIGHWAY'],
        ['N_MEDICAL_POST', 'N_EXIT_HIGHWAY'],
        ['N_MEDICAL_POST', 'N_EXIT_BOAT'],
        ['N_SECTOR_SOUTH', 'N_EXIT_BOAT'],
      ],
    },

    'Open-Air Music Festival': {
      nodes: [
        { id: 'N_ENTRY_ARCH',   name: 'Entry Arch',            x: 500, y: 70,  type: 'entry',        capacity: 15000 },
        { id: 'N_MAIN_STAGE',   name: 'Main Stage Area',       x: 300, y: 160, type: 'corridor',     capacity: 20000 },
        { id: 'N_STAGE_B',      name: 'Stage B Zone',          x: 700, y: 160, type: 'corridor',     capacity: 10000 },
        { id: 'N_MOSH_PIT',     name: 'Mosh Pit (Danger)',     x: 300, y: 270, type: 'intersection', capacity: 3000,  isChoke: true },
        { id: 'N_VIP_PIT',      name: 'VIP Viewing Pit',       x: 500, y: 270, type: 'corridor',     capacity: 2000  },
        { id: 'N_STAGE_C',      name: 'Stage C Lounge',        x: 700, y: 270, type: 'corridor',     capacity: 8000  },
        { id: 'N_FOOD_ZONE',    name: 'Food Court Zone',       x: 200, y: 380, type: 'corridor',     capacity: 8000  },
        { id: 'N_BAR_AREA',     name: 'Bar Area',              x: 500, y: 380, type: 'corridor',     capacity: 5000,  isChoke: true },
        { id: 'N_CAMPING',      name: 'Camping Grounds',       x: 800, y: 380, type: 'corridor',     capacity: 12000 },
        { id: 'N_MEDICAL',      name: 'Medical Tent',          x: 500, y: 470, type: 'corridor',     capacity: 1000  },
        { id: 'N_EXIT_LEFT',    name: 'Exit Gate Left',        x: 200, y: 530, type: 'exit',         capacity: 10000, isExit: true },
        { id: 'N_EXIT_RIGHT',   name: 'Exit Gate Right',       x: 800, y: 530, type: 'exit',         capacity: 10000, isExit: true },
      ],
      connections: [
        ['N_ENTRY_ARCH', 'N_MAIN_STAGE'],
        ['N_ENTRY_ARCH', 'N_STAGE_B'],
        ['N_MAIN_STAGE', 'N_MOSH_PIT'],
        ['N_MAIN_STAGE', 'N_VIP_PIT'],
        ['N_STAGE_B', 'N_VIP_PIT'],
        ['N_STAGE_B', 'N_STAGE_C'],
        ['N_MOSH_PIT', 'N_FOOD_ZONE'],
        ['N_VIP_PIT', 'N_BAR_AREA'],
        ['N_STAGE_C', 'N_CAMPING'],
        ['N_FOOD_ZONE', 'N_BAR_AREA'],
        ['N_BAR_AREA', 'N_CAMPING'],
        ['N_FOOD_ZONE', 'N_MEDICAL'],
        ['N_BAR_AREA', 'N_MEDICAL'],
        ['N_CAMPING', 'N_MEDICAL'],
        ['N_FOOD_ZONE', 'N_EXIT_LEFT'],
        ['N_MEDICAL', 'N_EXIT_LEFT'],
        ['N_MEDICAL', 'N_EXIT_RIGHT'],
        ['N_CAMPING', 'N_EXIT_RIGHT'],
      ],
    },
  };

  return topologies[venueName] || topologies['Central Railway Terminal'];
}

export default { getVenueTopology };
