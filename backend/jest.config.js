/**
 * Las pruebas viven en /tests/backend (fuera de /backend) según la estructura del proyecto.
 * modulePaths permite que esos archivos resuelvan las dependencias de backend/node_modules.
 */
module.exports = {
  testEnvironment: 'node',
  rootDir: __dirname,
  roots: ['<rootDir>/../tests/backend'],
  modulePaths: ['<rootDir>/node_modules'],
  collectCoverageFrom: ['src/**/*.js', '!src/config/db.js'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text-summary', 'lcov', 'cobertura'],
  coverageThreshold: {
    global: { lines: 70, statements: 70, functions: 65, branches: 60 }
  },
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: '<rootDir>/reports', outputName: 'junit-backend.xml' }]
  ]
};
