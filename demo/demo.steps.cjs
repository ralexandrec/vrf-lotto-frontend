const { Given, When, Then, Before, After, setDefaultTimeout } = require("@cucumber/cucumber");
const { chromium } = require("playwright");
const { expect } = require("chai");
const fs = require("fs");
const path = require("path");
const { setupMocks, setLocalPage } = require("../tests/step-definitions/ui.steps.cjs");

setDefaultTimeout(30000); // 30s de timeout para suportar cliques e movimentos lentos suaves

let browser;
let context;
let page;

Before({ tags: "@demo" }, async () => {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({
    locale: "en-US",
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: "demo/videos/",
      size: { width: 1280, height: 720 }
    }
  });
  page = await context.newPage();
  
  // Adiciona o init script para renderizar o cursor visual dourado e interativo na gravação de vídeo
  await page.addInitScript(() => {
    const createCursor = () => {
      if (document.getElementById('playwright-mock-cursor')) return;
      if (!document.body) {
        setTimeout(createCursor, 50);
        return;
      }
      
      const cursor = document.createElement('div');
      cursor.id = 'playwright-mock-cursor';
      cursor.style.position = 'fixed';
      cursor.style.width = '30px'; 
      cursor.style.height = '30px';
      cursor.style.borderRadius = '50%';
      cursor.style.backgroundColor = 'rgba(255, 215, 0, 0.8)'; // Dourado brilhante translúcido
      cursor.style.border = '2.5px solid #000';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '99999999'; // Fica por cima do body
      cursor.style.transition = 'transform 0.08s ease-out, background-color 0.08s';
      cursor.style.transform = 'translate(-50%, -50%)';
      cursor.style.left = '0px';
      cursor.style.top = '0px';
      cursor.style.boxShadow = '0 0 12px rgba(255, 215, 0, 0.6)';
      document.body.appendChild(cursor);

      window.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      });

      window.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        cursor.style.backgroundColor = 'rgba(255, 69, 0, 0.95)'; // Vermelho no clique
      });

      window.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = 'rgba(255, 215, 0, 0.8)';
      });
    };
    
    createCursor();
  });

  // Sincroniza a página local do ui.steps.cjs para que os passos importados usem a página da demo
  setLocalPage(page, context, browser);
  
  // Expõe no global também por segurança
  global.browser = browser;
  global.context = context;
  global.page = page;

  await setupMocks(page);
});

After({ tags: "@demo" }, async (scenario) => {
  if (scenario.result && scenario.result.status !== "PASSED") {
    if (!fs.existsSync("demo/videos")) {
      fs.mkdirSync("demo/videos", { recursive: true });
    }
    await page.screenshot({ path: "demo/videos/demo_failure.png" });
    console.log(`[DEMO FAILURE SCREENSHOT SAVED AT]: demo/videos/demo_failure.png`);
  }
  
  await browser.close();
  
  // Limpa as referências locais de ui.steps.cjs
  setLocalPage(undefined, undefined, undefined);
  
  // Limpa as referências globais pós-cenário
  global.browser = undefined;
  global.context = undefined;
  global.page = undefined;
});

// Funções para mover e clicar de forma suave com o mouse
async function moveMouseSuavementePara(selectorOrLocator, steps = 30) {
  try {
    const element = typeof selectorOrLocator === 'string' ? page.locator(selectorOrLocator) : selectorOrLocator;
    await element.waitFor({ state: "visible", timeout: 4000 });
    const box = await element.boundingBox();
    if (box) {
      const targetX = box.x + box.width / 2;
      const targetY = box.y + box.height / 2;
      await page.mouse.move(targetX, targetY, { steps });
      return { x: targetX, y: targetY };
    }
  } catch (e) {
    console.warn(`[MOUSE] Não foi possível mover para o elemento:`, e.message);
  }
  return null;
}

async function moveMouseEmCirculos(centerX, centerY, radius = 40, durationMs = 3000) {
  const steps = Math.floor(durationMs / 50);
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2 * 2; // Duas voltas completas
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    await page.mouse.move(x, y, { steps: 2 });
    await page.waitForTimeout(40);
  }
}

async function smoothClick(selectorOrLocator) {
  const element = typeof selectorOrLocator === 'string' ? page.locator(selectorOrLocator) : selectorOrLocator;
  // Move o mouse suavemente para o elemento primeiro
  await moveMouseSuavementePara(element, 25);
  await page.waitForTimeout(200);
  // Clica robustamente usando o método nativo do Playwright para disparar o React
  await element.click();
  await page.waitForTimeout(200);
}

Given("que eu inicio a gravação de vídeo do DApp Lotchain", async () => {
  await page.goto("http://localhost:5173");
  
  // Configura os estados iniciais no sessionStorage após carregar a página
  await page.evaluate(() => {
    sessionStorage.setItem("__mock_connected", "false");
    sessionStorage.setItem("__mock_balance", "0x11c37937e0800"); // 0.005 ETH (saldo baixo)
  });
  
  // Recarrega para aplicar os estados iniciais no app
  await page.reload();
  await page.waitForSelector("#connect-wallet-btn");
  
  // Inicializa o cursor no centro da tela
  await page.mouse.move(640, 360);
});

Given("eu espero {int} segundos", async (seconds) => {
  await page.waitForTimeout(seconds * 1000);
});

Given("eu espero {int} segundo", async (seconds) => {
  await page.waitForTimeout(seconds * 1000);
});

Given("eu espero o tempo da fala {int}", async (index) => {
  const durationsPath = path.join(__dirname, 'videos', 'audio_durations.json');
  let duration = 5;
  if (fs.existsSync(durationsPath)) {
    const data = JSON.parse(fs.readFileSync(durationsPath, 'utf8'));
    if (data[index] !== undefined) {
      duration = data[index];
    }
  }
  console.log(`[DEMO STEP] Esperando pela fala ${index}: ${duration}s`);
  
  const startTime = Date.now();
  const endTime = startTime + (duration * 1000);
  
  try {
    if (index === 0) {
      // Apresentação geral: título (logo do header)
      const coords = await moveMouseSuavementePara('.logo-main');
      if (coords) {
        await moveMouseEmCirculos(coords.x, coords.y, 60, 4500);
      }
    } else if (index === 1) {
      // Idiomas: seletor de idioma
      await moveMouseSuavementePara('.lang-selector');
    } else if (index === 4) {
      // Modal de faucet: instruções do modal
      const coords = await moveMouseSuavementePara('.modal-content h3');
      if (coords) {
        await moveMouseEmCirculos(coords.x, coords.y, 40, 3500);
      }
    } else if (index === 6) {
      // Saldo faucet: mostra o saldo atualizado (2 ETH)
      const coords = await moveMouseSuavementePara('.success-badge');
      if (coords) {
        await moveMouseEmCirculos(coords.x, coords.y, 35, 3000);
      }
    } else if (index === 7) {
      // Logs de transações: percorre os logs
      const container = page.locator('.logs-container');
      const box = await container.boundingBox();
      if (box) {
        await page.mouse.move(box.x + 150, box.y + 40, { steps: 20 });
        await page.waitForTimeout(400);
        await page.mouse.move(box.x + 150, box.y + box.height - 40, { steps: 25 });
      }
    } else if (index === 8) {
      // Assistente de apostas
      const coords = await moveMouseSuavementePara('.wizard-card h2');
      if (coords) {
        await moveMouseEmCirculos(coords.x, coords.y, 40, 3000);
      }
    } else if (index === 9 || index === 10) {
      // Botão de compra / status processando
      const coords = await moveMouseSuavementePara('#buy-ticket-btn');
      if (coords) {
        await moveMouseEmCirculos(coords.x, coords.y, 25, 4000);
      }
    } else if (index === 11) {
      // Sorteio
      const coords = await moveMouseSuavementePara('.admin-card h2');
      if (coords) {
        await moveMouseEmCirculos(coords.x, coords.y, 45, 4000);
      }
    }
  } catch (err) {
    console.warn("Erro ao mover o mouse:", err);
  }
  
  const remainingTime = endTime - Date.now();
  if (remainingTime > 0) {
    await page.waitForTimeout(remainingTime);
  }
  await page.waitForTimeout(500);
});

When("eu conecto a carteira de forma suave", async () => {
  await smoothClick("#connect-wallet-btn");
});

When("eu mudo o idioma para {string}", async (langCode) => {
  await moveMouseSuavementePara(".lang-selector", 20);
  await page.locator(".lang-selector").selectOption(langCode);
});

When("eu abro o modal de obter fundos", async () => {
  // Localiza de forma muito específica o botão "Adquirir ETH" usando o texto, para evitar cliques errados
  const locator = page.locator(".wizard-card button.btn-primary", { hasText: /Adquirir|Get/i });
  await smoothClick(locator);
});

When("eu fecho o modal de obter fundos", async () => {
  await smoothClick(".modal-close-btn");
});

When("eu recebo fundos simulados da faucet", async () => {
  await page.evaluate(() => {
    sessionStorage.setItem("__mock_balance", "0x1bc16d674ec80000"); // 2 ETH
  });
  await page.reload();
  await page.waitForSelector("#connect-wallet-btn .status-dot.active");
  await page.mouse.move(640, 360);
});

When("eu clico na aba de log de forma suave {string}", async (tabName) => {
  let selector = "#log-tab-user";
  if (tabName.includes("General") || tabName.includes("Geral")) {
    selector = "#log-tab-global";
  }
  await smoothClick(selector);
});

When("eu compro um bilhete pelo assistente", async () => {
  await smoothClick("#buy-ticket-btn");
});

When("eu clico no botão de realizar sorteio", async () => {
  await smoothClick("#draw-winner-btn");
});

Then("a gravação de vídeo deve ser finalizada com sucesso", async () => {
  const video = page.video();
  if (video) {
    const videoPath = await video.path();
    await page.close();
    await context.close();
    
    if (!fs.existsSync("demo/videos")) {
      fs.mkdirSync("demo/videos", { recursive: true });
    }
    
    const destination = path.join("demo/videos", "demo_raw.webm");
    fs.copyFileSync(videoPath, destination);
    console.log(`[DEMO VIDEO SAVED AT]: ${destination}`);
  }
});
