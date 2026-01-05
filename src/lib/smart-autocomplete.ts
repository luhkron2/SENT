// Smart auto-complete and prediction utilities

/**
 * Predict severity based on description keywords
 */
export function predictSeverity(description: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const lowerDesc = description.toLowerCase();

  // Critical keywords
  const criticalKeywords = [
    'stopped',
    'won\'t start',
    'can\'t drive',
    'unsafe',
    'brake failure',
    'no brakes',
    'steering failure',
    'fire',
    'smoke',
    'leaking fuel',
    'dangerous',
  ];

  // High priority keywords
  const highKeywords = [
    'warning light',
    'check engine',
    'overheating',
    'grinding',
    'loud noise',
    'vibrating',
    'shaking',
    'leaking',
    'not working',
    'urgent',
    'asap',
  ];

  // Medium priority keywords
  const mediumKeywords = [
    'intermittent',
    'sometimes',
    'occasionally',
    'minor',
    'needs attention',
  ];

  // Check for critical issues
  if (criticalKeywords.some((keyword) => lowerDesc.includes(keyword))) {
    return 'CRITICAL';
  }

  // Check for high priority issues
  if (highKeywords.some((keyword) => lowerDesc.includes(keyword))) {
    return 'HIGH';
  }

  // Check for medium priority issues
  if (mediumKeywords.some((keyword) => lowerDesc.includes(keyword))) {
    return 'MEDIUM';
  }

  // Default to LOW if no keywords match
  return 'LOW';
}

/**
 * Suggest category based on description
 */
export function suggestCategory(description: string): string | null {
  const lowerDesc = description.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    Mechanical: [
      'engine',
      'motor',
      'clutch',
      'transmission',
      'gearbox',
      'oil',
      'coolant',
      'radiator',
      'belt',
      'chain',
      'gasket',
      'pump',
    ],
    Electrical: [
      'light',
      'battery',
      'alternator',
      'wiring',
      'fuse',
      'switch',
      'dashboard',
      'indicator',
      'headlight',
      'taillight',
      'horn',
      'ac',
      'heater',
    ],
    Brakes: [
      'brake',
      'braking',
      'stopping',
      'brake pad',
      'brake disc',
      'brake drum',
      'handbrake',
      'park brake',
      'abs',
    ],
    Tyres: [
      'tyre',
      'tire',
      'wheel',
      'puncture',
      'flat',
      'pressure',
      'tread',
      'rim',
    ],
    Body: [
      'door',
      'window',
      'mirror',
      'panel',
      'bumper',
      'paint',
      'dent',
      'scratch',
      'body',
      'cabin',
    ],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
      return category;
    }
  }

  return null;
}

/**
 * Predict if vehicle is safe to continue driving
 */
export function predictSafeToContinue(
  description: string,
  severity?: string
): 'Yes' | 'No' | 'Unsure' {
  const lowerDesc = description.toLowerCase();

  // Definitely not safe keywords
  const notSafeKeywords = [
    'can\'t drive',
    'unsafe',
    'dangerous',
    'brake failure',
    'no brakes',
    'steering failure',
    'smoke',
    'fire',
    'leaking fuel',
  ];

  // Unsure keywords
  const unsureKeywords = [
    'warning light',
    'check engine',
    'grinding',
    'loud noise',
    'vibrating',
    'shaking',
  ];

  if (severity === 'CRITICAL') {
    return 'No';
  }

  if (notSafeKeywords.some((keyword) => lowerDesc.includes(keyword))) {
    return 'No';
  }

  if (severity === 'HIGH' || unsureKeywords.some((keyword) => lowerDesc.includes(keyword))) {
    return 'Unsure';
  }

  return 'Yes';
}

/**
 * Generate smart suggestions based on partial description
 */
export function generateSuggestions(partialDescription: string): string[] {
  const lowerDesc = partialDescription.toLowerCase().trim();

  if (lowerDesc.length < 3) return [];

  const suggestions: Record<string, string[]> = {
    engine: [
      'Engine warning light is illuminated',
      'Engine making unusual knocking noise',
      'Engine overheating',
      'Engine won\'t start',
    ],
    brake: [
      'Brakes not responding properly',
      'Brake warning light on',
      'Brakes making grinding noise',
      'Brake pedal feels soft',
    ],
    tire: [
      'Tire pressure warning light on',
      'Tire has visible damage',
      'Tire tread is worn',
      'Tire making noise while driving',
    ],
    light: [
      'Headlights not working',
      'Warning lights on dashboard',
      'Brake lights not functioning',
      'Turn signal not working',
    ],
    leak: [
      'Leaking coolant underneath vehicle',
      'Oil leak visible',
      'Fuel leak detected',
      'Air leak from brake system',
    ],
    noise: [
      'Unusual noise from engine',
      'Grinding noise when braking',
      'Squeaking noise from suspension',
      'Rattling noise from exhaust',
    ],
  };

  const matchedSuggestions: string[] = [];

  for (const [keyword, suggestionList] of Object.entries(suggestions)) {
    if (lowerDesc.includes(keyword)) {
      matchedSuggestions.push(...suggestionList);
    }
  }

  return matchedSuggestions.slice(0, 5);
}

/**
 * Extract vehicle-related information from description
 */
export function extractVehicleInfo(description: string): {
  hasOdometer?: number;
  hasMileage?: number;
  hasPSI?: number;
  hasTemperature?: boolean;
} {
  const result: ReturnType<typeof extractVehicleInfo> = {};

  // Extract odometer reading (e.g., "123,456 km" or "123456km")
  const odometerMatch = description.match(/(\d+[,.]?\d*)\s*(km|kilometers)/i);
  if (odometerMatch) {
    result.hasOdometer = parseInt(odometerMatch[1].replace(/[,]/g, ''));
  }

  // Extract PSI reading (e.g., "60 PSI" or "60psi")
  const psiMatch = description.match(/(\d+)\s*psi/i);
  if (psiMatch) {
    result.hasPSI = parseInt(psiMatch[1]);
  }

  // Check for temperature mentions
  if (/temp|temperature|hot|overheating|cold/i.test(description)) {
    result.hasTemperature = true;
  }

  return result;
}

/**
 * Suggest recommended actions based on issue
 */
export function suggestActions(
  category: string,
  severity: string
): string[] {
  const actions: string[] = [];

  if (severity === 'CRITICAL') {
    actions.push('Contact operations immediately');
    actions.push('Do not operate the vehicle');
  }

  if (category === 'Brakes' && (severity === 'HIGH' || severity === 'CRITICAL')) {
    actions.push('Have vehicle towed to workshop');
  }

  if (category === 'Mechanical' && severity !== 'LOW') {
    actions.push('Check fluid levels before driving');
  }

  if (category === 'Tyres') {
    actions.push('Check tire pressure');
    actions.push('Inspect for visible damage');
  }

  if (category === 'Electrical' && severity === 'LOW') {
    actions.push('Safe to continue with caution');
    actions.push('Schedule maintenance at next opportunity');
  }

  return actions;
}

/**
 * Enhance description with additional context
 */
export function enhanceDescription(
  description: string,
  metadata: {
    fleetNumber?: string;
    location?: string;
    time?: string;
  }
): string {
  let enhanced = description;

  // Add metadata if available
  const additions: string[] = [];

  if (metadata.fleetNumber) {
    additions.push(`Fleet: ${metadata.fleetNumber}`);
  }

  if (metadata.location) {
    additions.push(`Location: ${metadata.location}`);
  }

  if (metadata.time) {
    additions.push(`Time: ${metadata.time}`);
  }

  if (additions.length > 0) {
    enhanced += `\n\n[${additions.join(' | ')}]`;
  }

  return enhanced;
}
