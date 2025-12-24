/**
 * API Endpoint Validation Script
 * 
 * This script validates that all API endpoints are properly defined
 * and follow the project's standards
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  endpoint: string;
  exists: boolean;
  hasGET: boolean;
  hasPOST: boolean;
  hasPATCH: boolean;
  hasDELETE: boolean;
  hasZodValidation: boolean;
  hasErrorHandling: boolean;
  hasRateLimit: boolean;
  issues: string[];
}

const API_DIR = join(process.cwd(), 'src', 'app', 'api');

const EXPECTED_ENDPOINTS = [
  'access/route.ts',
  'auth/[...nextauth]/route.ts',
  'dashboard/route.ts',
  'export/csv/route.ts',
  'export/pdf/route.ts',
  'issues/route.ts',
  'issues/[id]/route.ts',
  'issues/[id]/comment/route.ts',
  'issues/[id]/updates/route.ts',
  'mappings/route.ts',
  'upload/route.ts',
  'workorders/route.ts',
  'workorders/[id]/route.ts',
];

function validateEndpoint(endpointPath: string): ValidationResult {
  const fullPath = join(API_DIR, endpointPath);
  const result: ValidationResult = {
    endpoint: endpointPath,
    exists: false,
    hasGET: false,
    hasPOST: false,
    hasPATCH: false,
    hasDELETE: false,
    hasZodValidation: false,
    hasErrorHandling: false,
    hasRateLimit: false,
    issues: [],
  };

  if (!existsSync(fullPath)) {
    result.issues.push('File does not exist');
    return result;
  }

  result.exists = true;
  const content = readFileSync(fullPath, 'utf-8');

  // Check for HTTP methods
  result.hasGET = /export\s+async\s+function\s+GET/.test(content);
  result.hasPOST = /export\s+async\s+function\s+POST/.test(content);
  result.hasPATCH = /export\s+async\s+function\s+PATCH/.test(content);
  result.hasDELETE = /export\s+async\s+function\s+DELETE/.test(content);

  // Check for Zod validation
  result.hasZodValidation = /z\.(object|string|number|enum|array)/.test(content) || /\.parse\(/.test(content);

  // Check for error handling
  result.hasErrorHandling = /try\s*\{[\s\S]*catch\s*\(/.test(content);

  // Check for rate limiting (where applicable)
  result.hasRateLimit = /rateLimit/.test(content);

  // Validate based on endpoint type
  if (!result.hasGET && !result.hasPOST && !result.hasPATCH && !result.hasDELETE) {
    result.issues.push('No HTTP methods exported');
  }

  if (result.hasPOST && !result.hasZodValidation && !endpointPath.includes('auth')) {
    result.issues.push('POST method without Zod validation');
  }

  if (!result.hasErrorHandling) {
    result.issues.push('Missing try-catch error handling');
  }

  return result;
}

function main() {
  console.log('🔍 Validating API Endpoints...\n');
  
  const results: ValidationResult[] = [];
  let totalIssues = 0;

  for (const endpoint of EXPECTED_ENDPOINTS) {
    const result = validateEndpoint(endpoint);
    results.push(result);
    totalIssues += result.issues.length;

    const status = result.exists ? (result.issues.length === 0 ? '✅' : '⚠️') : '❌';
    console.log(`${status} ${endpoint}`);
    
    if (result.exists) {
      const methods = [];
      if (result.hasGET) methods.push('GET');
      if (result.hasPOST) methods.push('POST');
      if (result.hasPATCH) methods.push('PATCH');
      if (result.hasDELETE) methods.push('DELETE');
      console.log(`   Methods: ${methods.join(', ') || 'None'}`);
    }

    if (result.issues.length > 0) {
      result.issues.forEach(issue => {
        console.log(`   ⚠️  ${issue}`);
      });
    }
    console.log('');
  }

  console.log('\n📊 Summary');
  console.log('─'.repeat(50));
  console.log(`Total endpoints: ${EXPECTED_ENDPOINTS.length}`);
  console.log(`Existing endpoints: ${results.filter(r => r.exists).length}`);
  console.log(`Endpoints with issues: ${results.filter(r => r.issues.length > 0).length}`);
  console.log(`Total issues found: ${totalIssues}`);

  if (totalIssues === 0) {
    console.log('\n✅ All API endpoints validated successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some issues found. Please review above.');
    process.exit(1);
  }
}

main();
