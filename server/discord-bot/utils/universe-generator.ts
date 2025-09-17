export class UniverseGenerator {
  private readonly sectorPrefixes = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
    'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho',
    'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'
  ];

  private readonly sectorSuffixes = [
    'Nebula', 'Cluster', 'System', 'Void', 'Expanse', 'Region', 'Zone',
    'Sector', 'Quadrant', 'Territory', 'Domain', 'Realm', 'Space',
    'Field', 'Belt', 'Ring', 'Haven', 'Reach', 'Frontier', 'Outpost'
  ];

  private readonly sectorTypes = [
    'asteroid_field', 'gas_giant', 'planetary_system', 'nebula', 
    'binary_star', 'black_hole', 'ancient_ruins', 'space_station',
    'wormhole', 'quantum_storm', 'dark_matter_cloud', 'pulsar_system',
    'neutron_star', 'red_giant', 'white_dwarf', 'protostar',
    'planetary_ring', 'comet_field', 'magnetic_anomaly', 'time_distortion'
  ];

  private readonly resources = [
    'iron', 'titanium', 'platinum', 'nexium_crystals', 'dark_matter',
    'quantum_energy', 'cosmic_dust', 'helium_3', 'deuterium', 'tritium',
    'rare_earth_metals', 'exotic_matter', 'antimatter', 'zero_point_energy',
    'crystalline_matrix', 'bio_neural_gel', 'photonic_matter', 'tachyon_particles'
  ];

  private readonly hazards = [
    'radiation', 'gravity_wells', 'plasma_storms', 'space_pirates',
    'temporal_anomalies', 'ion_storms', 'solar_flares', 'magnetic_interference',
    'quantum_fluctuations', 'gravity_distortions', 'energy_vampires',
    'sentient_gas_clouds', 'dimensional_rifts', 'null_space_pockets'
  ];

  generateCoordinates(): string {
    const x = Math.floor(Math.random() * 2000) - 1000; // -1000 to 1000
    const y = Math.floor(Math.random() * 2000) - 1000;
    const z = Math.floor(Math.random() * 200) - 100;   // -100 to 100
    return `X${x}:Y${y}:Z${z}`;
  }

  generateSectorName(): string {
    const prefix = this.sectorPrefixes[Math.floor(Math.random() * this.sectorPrefixes.length)];
    const suffix = this.sectorSuffixes[Math.floor(Math.random() * this.sectorSuffixes.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    // Sometimes include a number, sometimes not
    if (Math.random() < 0.6) {
      return `${prefix} ${suffix} ${number}`;
    } else {
      return `${prefix} ${suffix}`;
    }
  }

  randomSectorType(): string {
    return this.sectorTypes[Math.floor(Math.random() * this.sectorTypes.length)];
  }

  generateResources(): object {
    const result: any = {};
    const numResources = Math.floor(Math.random() * 4); // 0-3 resources
    
    for (let i = 0; i < numResources; i++) {
      const resource = this.resources[Math.floor(Math.random() * this.resources.length)];
      if (!result[resource]) {
        result[resource] = Math.floor(Math.random() * 500) + 50; // 50-549
      }
    }
    
    return result;
  }

  generateHazards(): object {
    const result: any = {};
    const numHazards = Math.floor(Math.random() * 3); // 0-2 hazards
    
    for (let i = 0; i < numHazards; i++) {
      const hazard = this.hazards[Math.floor(Math.random() * this.hazards.length)];
      if (!result[hazard]) {
        result[hazard] = Math.floor(Math.random() * 10) + 1; // 1-10 intensity
      }
    }
    
    return result;
  }

  generatePlanetName(): string {
    const prefixes = ['Kepler', 'Gliese', 'Trappist', 'Proxima', 'Wolf', 'Ross', 'Tau', 'HD'];
    const suffixes = ['Prime', 'Alpha', 'Beta', 'Secundus', 'Major', 'Minor', 'Tertius'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 9999) + 1;
    
    if (Math.random() < 0.3) {
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      return `${prefix}-${number} ${suffix}`;
    } else {
      const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // a-z
      return `${prefix}-${number}${letter}`;
    }
  }

  generateArtifactName(): string {
    const origins = ['Ancient', 'Forgotten', 'Lost', 'Mysterious', 'Alien', 'Precursor'];
    const types = ['Codex', 'Relic', 'Core', 'Matrix', 'Shard', 'Beacon', 'Archive', 'Key'];
    const materials = ['Crystal', 'Metal', 'Stone', 'Energy', 'Data', 'Neural', 'Quantum'];
    
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (Math.random() < 0.4) {
      const material = materials[Math.floor(Math.random() * materials.length)];
      return `${origin} ${material} ${type}`;
    } else {
      return `${origin} ${type}`;
    }
  }

  generateEncounterDescription(sectorType: string): string {
    const encounters: { [key: string]: string[] } = {
      asteroid_field: [
        'You navigate through a dense field of slowly rotating asteroids.',
        'Mining drones detect valuable ore deposits in the asteroid clusters.',
        'Ancient ship wrecks drift among the asteroids, telling tales of past battles.',
        'Unexpected gravity fluctuations make navigation challenging.'
      ],
      gas_giant: [
        'The massive planet\'s storms rage across its surface in hypnotic patterns.',
        'Floating cities of an unknown civilization orbit in the upper atmosphere.',
        'Your sensors detect rare gases that could power your ship for months.',
        'Strange bio-luminescent creatures swim through the dense gas layers.'
      ],
      planetary_system: [
        'Multiple worlds orbit a stable star, showing signs of terraforming.',
        'Trade beacons indicate this system is part of an active commerce route.',
        'Defense satellites challenge your approach with automated hails.',
        'One planet shows clear signs of recent industrial development.'
      ],
      nebula: [
        'Brilliant colors swirl around your ship as you enter the nebula.',
        'Communication systems are disrupted by the dense particle clouds.',
        'Your ship\'s hull begins to glow with accumulated static charge.',
        'Hidden within the nebula, you discover a previously unknown space station.'
      ],
      black_hole: [
        'Time dilation effects make your chronometer spin wildly.',
        'The accretion disk provides a spectacular but dangerous light show.',
        'Gravitational lensing reveals distant galaxies behind the singularity.',
        'Your ship\'s AI calculates a narrow corridor of stable spacetime.'
      ],
      ancient_ruins: [
        'Massive structures drift in space, clearly of non-human origin.',
        'Faint energy signatures suggest some systems are still active.',
        'Hieroglyphic-like symbols cover the hull of the alien construct.',
        'Your approach triggers ancient defense systems that scan your ship.'
      ]
    };

    const descriptions = encounters[sectorType] || [
      'Your sensors detect unusual readings from this uncharted region.',
      'The void of space here seems different somehow, charged with potential.',
      'Navigation charts will need updating after this discovery.'
    ];

    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  calculateDistance(coord1: string, coord2: string): number {
    const parse = (coord: string) => {
      const parts = coord.split(':');
      return {
        x: parseInt(parts[0].substring(1)),
        y: parseInt(parts[1].substring(1)),
        z: parseInt(parts[2].substring(1))
      };
    };

    const p1 = parse(coord1);
    const p2 = parse(coord2);

    return Math.sqrt(
      Math.pow(p2.x - p1.x, 2) +
      Math.pow(p2.y - p1.y, 2) +
      Math.pow(p2.z - p1.z, 2)
    );
  }

  generateNearbyCoordinates(baseCoord: string, maxDistance: number = 50): string {
    const parse = (coord: string) => {
      const parts = coord.split(':');
      return {
        x: parseInt(parts[0].substring(1)),
        y: parseInt(parts[1].substring(1)),
        z: parseInt(parts[2].substring(1))
      };
    };

    const base = parse(baseCoord);
    const offset = () => Math.floor(Math.random() * maxDistance * 2) - maxDistance;

    const newX = base.x + offset();
    const newY = base.y + offset();
    const newZ = base.z + offset();

    return `X${newX}:Y${newY}:Z${newZ}`;
  }
}
