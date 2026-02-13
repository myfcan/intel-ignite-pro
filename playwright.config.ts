import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * Documentação: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Artifacts output */
  outputDir: './test-results',
  
  /* Timeout máximo por teste */
  timeout: 120 * 1000,
  
  /* Expect timeout */
  expect: {
    timeout: 10000
  },
  
  /* Rodar testes em paralelo */
  fullyParallel: true,
  
  /* Falhar build no CI se deixou test.only */
  forbidOnly: !!process.env.CI,
  
  /* Retry em caso de falha */
  retries: process.env.CI ? 2 : 0,
  
  /* Número de workers */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  /* Configuração compartilhada */
  use: {
    /* URL base da aplicação */
    baseURL: 'http://localhost:8080',
    
    /* Collect trace quando teste falhar */
    trace: 'on-first-retry',
    
    /* Screenshot apenas em falhas */
    screenshot: 'only-on-failure',
    
    /* Vídeo apenas em falhas */
    video: 'retain-on-failure',
    
    /* Timeout de navegação */
    navigationTimeout: 30000,
  },

  /* Configurar projetos para diferentes browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Testes mobile */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Servidor de desenvolvimento */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
