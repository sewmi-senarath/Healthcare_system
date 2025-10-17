#!/usr/bin/env node

/**
 * Test runner script for comprehensive controller testing
 * Provides detailed test execution and reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test configuration
const config = {
  testDirectory: 'src/__tests__',
  coverageThreshold: 80,
  testTimeout: 30000,
  verbose: false
};

// Test statistics
let stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  coverage: 0
};

/**
 * Print colored output
 */
function printColor(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print header
 */
function printHeader() {
  printColor('\n' + '='.repeat(80), 'cyan');
  printColor('🏥 HEALTHCARE SYSTEM CONTROLLER TESTS', 'bright');
  printColor('='.repeat(80), 'cyan');
  printColor(`📁 Test Directory: ${config.testDirectory}`, 'blue');
  printColor(`🎯 Coverage Threshold: ${config.coverageThreshold}%`, 'blue');
  printColor(`⏱️  Timeout: ${config.testTimeout}ms`, 'blue');
  printColor('='.repeat(80), 'cyan');
}

/**
 * Print test file information
 */
function printTestFiles() {
  printColor('\n📋 TEST FILES:', 'yellow');
  
  const testFiles = [
    'UserController.test.js - User authentication and management',
    'PatientController.test.js - Patient registration and profile management',
    'AppointmentController.test.js - Appointment booking and management',
    'AppointmentBookingController.test.js - Detailed booking logic',
    'PrescriptionController.test.js - Prescription management',
    'EmployeeController.test.js - Employee management (all types)'
  ];

  testFiles.forEach((file, index) => {
    printColor(`  ${index + 1}. ${file}`, 'blue');
  });
}

/**
 * Print test categories
 */
function printTestCategories() {
  printColor('\n🧪 TEST CATEGORIES:', 'yellow');
  
  const categories = [
    '✅ Positive Cases - Successful operations with valid data',
    '❌ Negative Cases - Invalid input and error conditions',
    '🔍 Edge Cases - Boundary values and special scenarios',
    '💥 Error Cases - Database and system failures',
    '🔐 Authentication - Login, tokens, and authorization',
    '📊 Statistics - Dashboard and analytics functionality',
    '🔍 Search - Patient and employee search operations',
    '📝 Validation - Input validation and business rules'
  ];

  categories.forEach((category, index) => {
    printColor(`  ${category}`, 'green');
  });
}

/**
 * Run Jest tests
 */
function runTests() {
  printColor('\n🚀 RUNNING TESTS...', 'yellow');
  
  try {
    const jestCommand = [
      'jest',
      '--config=package.json',
      '--testPathPattern=src/__tests__/controllers',
      '--coverage',
      '--coverageReporters=text-summary',
      '--coverageReporters=html',
      '--coverageReporters=lcov',
      '--coverageDirectory=coverage',
      '--coverageThreshold.global.branches=80',
      '--coverageThreshold.global.functions=80',
      '--coverageThreshold.global.lines=80',
      '--coverageThreshold.global.statements=80',
      '--verbose',
      '--detectOpenHandles',
      '--forceExit'
    ].join(' ');

    printColor(`Command: ${jestCommand}`, 'magenta');
    
    const output = execSync(jestCommand, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });

    printColor('\n✅ TESTS COMPLETED SUCCESSFULLY!', 'green');
    console.log(output);
    
    return { success: true, output };
  } catch (error) {
    printColor('\n❌ TESTS FAILED!', 'red');
    console.log(error.stdout || error.message);
    return { success: false, output: error.stdout || error.message };
  }
}

/**
 * Parse test results
 */
function parseResults(output) {
  // Extract test statistics from Jest output
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (line.includes('Tests:')) {
      const match = line.match(/(\d+) passed/);
      if (match) stats.passed = parseInt(match[1]);
    }
    
    if (line.includes('Coverage summary')) {
      const coverageMatch = line.match(/(\d+\.?\d*)%/);
      if (coverageMatch) stats.coverage = parseFloat(coverageMatch[1]);
    }
  }
  
  stats.total = stats.passed + stats.failed;
}

/**
 * Print coverage report
 */
function printCoverageReport() {
  printColor('\n📊 COVERAGE REPORT:', 'yellow');
  
  const coverageDir = path.join(process.cwd(), 'coverage');
  const coverageFile = path.join(coverageDir, 'lcov-report', 'index.html');
  
  if (fs.existsSync(coverageFile)) {
    printColor(`📁 Coverage report generated: ${coverageFile}`, 'blue');
    printColor('🌐 Open in browser to view detailed coverage', 'blue');
  }
  
  if (stats.coverage >= config.coverageThreshold) {
    printColor(`✅ Coverage: ${stats.coverage}% (Target: ${config.coverageThreshold}%)`, 'green');
  } else {
    printColor(`❌ Coverage: ${stats.coverage}% (Target: ${config.coverageThreshold}%)`, 'red');
  }
}

/**
 * Print test summary
 */
function printSummary() {
  printColor('\n📈 TEST SUMMARY:', 'yellow');
  printColor(`Total Tests: ${stats.total}`, 'blue');
  printColor(`✅ Passed: ${stats.passed}`, 'green');
  printColor(`❌ Failed: ${stats.failed}`, 'red');
  printColor(`⏭️  Skipped: ${stats.skipped}`, 'yellow');
  printColor(`📊 Coverage: ${stats.coverage}%`, 'cyan');
  
  if (stats.failed === 0 && stats.coverage >= config.coverageThreshold) {
    printColor('\n🎉 ALL TESTS PASSED AND COVERAGE REQUIREMENTS MET!', 'green');
  } else if (stats.failed > 0) {
    printColor('\n⚠️  SOME TESTS FAILED - PLEASE REVIEW THE OUTPUT ABOVE', 'red');
  } else {
    printColor('\n⚠️  TESTS PASSED BUT COVERAGE BELOW THRESHOLD', 'yellow');
  }
}

/**
 * Print recommendations
 */
function printRecommendations() {
  printColor('\n💡 RECOMMENDATIONS:', 'yellow');
  
  const recommendations = [
    '🔍 Review failed tests and fix issues',
    '📝 Add more tests for uncovered code paths',
    '🧪 Test edge cases and error scenarios',
    '📊 Aim for 90%+ coverage for critical paths',
    '🔄 Run tests regularly during development',
    '📋 Keep test data realistic and comprehensive',
    '🔧 Update tests when controllers change',
    '📖 Document test scenarios and expectations'
  ];

  recommendations.forEach((rec, index) => {
    printColor(`  ${rec}`, 'blue');
  });
}

/**
 * Main execution function
 */
function main() {
  try {
    printHeader();
    printTestFiles();
    printTestCategories();
    
    const result = runTests();
    parseResults(result.output);
    printCoverageReport();
    printSummary();
    printRecommendations();
    
    printColor('\n' + '='.repeat(80), 'cyan');
    printColor('🏁 TEST RUN COMPLETED', 'bright');
    printColor('='.repeat(80), 'cyan');
    
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    printColor(`\n💥 ERROR: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printColor('\n📖 USAGE:', 'yellow');
  printColor('  node run-tests.js [options]', 'blue');
  printColor('\n🔧 OPTIONS:', 'yellow');
  printColor('  --help, -h     Show this help message', 'blue');
  printColor('  --verbose      Enable verbose output', 'blue');
  printColor('  --watch        Run tests in watch mode', 'blue');
  printColor('  --coverage     Generate coverage report', 'blue');
  process.exit(0);
}

if (process.argv.includes('--verbose')) {
  config.verbose = true;
}

if (process.argv.includes('--watch')) {
  printColor('\n👀 Running tests in watch mode...', 'yellow');
  execSync('npm run test:watch', { stdio: 'inherit' });
  process.exit(0);
}

// Run the tests
main();
