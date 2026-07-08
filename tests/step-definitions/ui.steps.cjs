const { Given, When, Then, Before, After } = require("@cucumber/cucumber");
const { chromium } = require("playwright");
const { expect } = require("chai");

let browser;
let context;
let page;

Before(async () => {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
  page = await context.newPage();
  
  // Forward page console logs to terminal
  page.on("console", msg => {
    console.log(`[PAGE LOG]: ${msg.text()}`);
  });

  // Injetar Mock do window.ethereum antes de cada carregamento de página
  await page.addInitScript(() => {
    window.ethereum = {
      isMetaMask: true,
      request: async (requestInfo) => {
        const { method, params } = requestInfo;
        
        if (method === "eth_requestAccounts" || method === "eth_accounts") {
          return ["0xc545124fa9704ba2ec880e3e5a141ebb6be98b41"];
        }
        
        if (method === "eth_chainId") {
          return "0x14a34"; // Base Sepolia (Chain ID 84532)
        }
        
        if (method === "eth_getBalance") {
          return "0xde0b6b3a7640000"; // 1 ETH em hex (wei)
        }
        
        if (method === "eth_getCode") {
          // Retorna um bytecode fictício limpo sem reticências
          return "0x60806040526004361061012957";
        }
        
        if (method === "eth_call") {
          const data = params[0].data;
          console.log("MOCK CALL DATA:", data);
          
          // Mapeamento dos seletores de funções do Smart Contract a partir do Solidity dispatch table real
          
          // precoBilhete() - 0xcd1d6d44
          if (data.includes("cd1d6d44")) {
            // precoBilhete: retorna 0.01 ETH em wei (10^16) -> 0x2386f26fc10000
            return "0x000000000000000000000000000000000000000000000000002386f26fc10000";
          }
          
          // getSaldo() - 0xe2eec9a7
          if (data.includes("e2eec9a7")) {
            // getSaldo: retorna 1.5 ETH em wei -> 0x14d1120d7b160000
            return "0x00000000000000000000000000000000000000000000000014d1120d7b160000";
          }
          
          // getJogadores() - 0x0040b837
          if (data.includes("0040b837")) {
            // getJogadores: retorna array contendo 2 jogadores
            // offset 0x20, size 2, itens (removidos prefixos 0x secundários)
            return "0x0000000000000000000000000000000000000000000000000000000000000020" + // offset
                   "0000000000000000000000000000000000000000000000000000000000000002" + // tamanho (2)
                   "0000000000000000000000001111111111111111111111111111111111111111" + // jogador 1
                   "0000000000000000000000002222222222222222222222222222222222222222";   // jogador 2
          }
          
          // sorteioAberto() - 0x23aaa4c5
          if (data.includes("23aaa4c5")) {
            // sorteioAberto: retorna true -> 0x1
            return "0x0000000000000000000000000000000000000000000000000000000000000001";
          }
          
          // ultimoGanhador() - 0xba2c09f8
          if (data.includes("ba2c09f8")) {
            // retorna endereço mock do ultimo ganhador
            return "0x0000000000000000000000003333333333333333333333333333333333333333";
          }
          
           // ultimoPremio() - 0x9dbd21b0
          if (data.includes("9dbd21b0")) {
            // retorna 0
            return "0x0000000000000000000000000000000000000000000000000000000000000000";
          }

          // owner() - 0x8da5cb5b
          if (data.includes("8da5cb5b")) {
            // retorna a conta de administrador conectada do teste
            return "0x000000000000000000000000c545124fa9704ba2ec880e3e5a141ebb6be98b41";
          }
          
          // Fallback padrão de zeros
          return "0x0000000000000000000000000000000000000000000000000000000000000000";
        }
        
        return null;
      },
      on: (event, callback) => {
        // Mock de listener
      },
      removeListener: (event, callback) => {
        // Mock de listener
      }
    };
  });
});

After(async () => {
  await browser.close();
});

Given("que eu acesso a página inicial do Lotchain", async () => {
  await page.goto("http://localhost:5173");
});

Then("o título {string} deve ser visível na página", async (title) => {
  // O título do DApp fica dentro do header da logo
  const logoText = await page.locator("header.app-header .logo-main span").textContent();
  expect(logoText).to.include(title);
});

Then("o botão de conexão de carteira deve estar visível", async () => {
  const isVisible = await page.locator("#connect-wallet-btn").isVisible();
  expect(isVisible).to.be.true;
});

When("eu digito {string} no campo de contrato", async (address) => {
  // Limpa o campo e digita o endereço
  await page.locator(".input-text").fill("");
  await page.locator(".input-text").fill(address);
});

When("clico no botão de carregar", async () => {
  // Clica no botão "Carregar" ao lado do input
  await page.locator(".input-group button").click();
});

Then("as informações do contrato devem ser exibidas na tela", async () => {
  // Para exibir as informações, precisamos estar conectados na rede correta.
  // Conectamos clicando no botão de carteira.
  await page.locator("#connect-wallet-btn").click();
  
  // Aguarda as views atualizarem a partir do contrato inteligente mockado
  await page.waitForTimeout(1000); // Aguarda rendering reativo

  // Valida que o preço do bilhete foi atualizado com "0.01 ETH" (dos mocks da blockchain)
  const ticketCardText = await page.locator(".metrics-grid .card:nth-child(1) .metric-value").textContent();
  expect(ticketCardText).to.include("0.01 ETH");

  // Valida que o saldo total acumulado (Pool) foi atualizado com "1.5 ETH"
  const poolCardText = await page.locator(".metrics-grid .card:nth-child(2) .metric-value").textContent();
  expect(poolCardText).to.include("1.5 ETH");

  // Valida que o número de jogadores foi carregado como "2" (conforme mock de array do event listener)
  const playersCardText = await page.locator(".metrics-grid .card:nth-child(3) .metric-value").textContent();
  expect(playersCardText).to.include("2");
});

When("eu clico no botão de conectar carteira", async () => {
  await page.locator("#connect-wallet-btn").click();
});

Then("o painel do administrador deve estar visível na página", async () => {
  await page.waitForTimeout(500); // Aguarda render reativo
  const isVisible = await page.locator(".admin-card").isVisible();
  expect(isVisible).to.be.true;
});

Then("o botão de sortear vencedor deve estar visível", async () => {
  const isVisible = await page.locator("#draw-winner-btn").isVisible();
  expect(isVisible).to.be.true;
});
