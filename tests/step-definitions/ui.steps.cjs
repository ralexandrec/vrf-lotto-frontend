const { Given, When, Then, Before, After } = require("@cucumber/cucumber");
const { chromium, devices } = require("playwright");
const { expect } = require("chai");

let browser;
let context;
let page;

const setupMocks = async (targetPage) => {
  // Injetar Mock do window.ethereum antes de cada carregamento de página
  await targetPage.addInitScript(() => {
    Object.defineProperty(navigator, 'language', { get: () => 'en-US', configurable: true });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'], configurable: true });

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

        if (method === "eth_blockNumber") {
          return "0x29de000"; // Bloco real aproximado correspondente ao dump (43900928)
        }

        if (method === "eth_getBlockByNumber") {
          const blockHex = params ? params[0] : "0x29de000";
          return {
            number: blockHex,
            hash: "0x0000000000000000000000000000000000000000000000000000000000000001",
            parentHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
            sha3Uncles: "0x1dcc4de8dec75d7aab85b1b56fc1745a819024c2ed2137bc77a6f4577a911685",
            logsBloom: "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
            transactionsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
            stateRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
            receiptsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
            miner: "0x0000000000000000000000000000000000000000",
            difficulty: "0x0",
            totalDifficulty: "0x0",
            extraData: "0x",
            size: "0x0",
            gasLimit: "0x0",
            gasUsed: "0x0",
            timestamp: "0x66668700", // Corresponde a 10 de Junho de 2024 (1718000000)
            transactions: [],
            uncles: []
          };
        }

        if (method === "eth_getLogs") {
          const filter = params ? params[0] : null;
          const filterTopics = filter?.topics || [];
          
          const tickets = [
            {
              address: "0x10ed17d3F4AAD4043f34b9A9AD024c743f2Db46F",
              blockHash: "0xefd1daff0f0c37d36e4dc34bf42ab8123ffaed3e11cf2139e53569ddf3fce7ff",
              blockNumber: "0x29dd8f5",
              data: "0x",
              topics: [
                "0xe644a03c3c564ec9e825adadd36c476e0a10ba3e96ea01650aff1b553bbf34e3",
                "0x000000000000000000000000a15852884917690a94ccddee47188eb2759def2f"
              ],
              transactionHash: "0xa01947fe5d2f3b581e46a2cbfbecff1a1b9685993a654fd5dd0d9f37d8792095",
              transactionIndex: "0xa",
              logIndex: "0x1a",
              removed: false
            },
            {
              address: "0x10ed17d3F4AAD4043f34b9A9AD024c743f2Db46F",
              blockHash: "0x37454d26937ba84929d0aa8ca4475fcbb361557156f3ffdf4174217bd3ccf55f",
              blockNumber: "0x29dd9bb",
              data: "0x",
              topics: [
                "0xe644a03c3c564ec9e825adadd36c476e0a10ba3e96ea01650aff1b553bbf34e3",
                "0x000000000000000000000000c545124fa9704ba2ec880e3e5a141ebb6be98b41"
              ],
              transactionHash: "0xd37a187d40d8d38cf406764a8a7ac9649226ca53d2a97e2ed59f29ccdbd5dbd2",
              transactionIndex: "0x18",
              logIndex: "0x82",
              removed: false
            },
            {
              address: "0x10ed17d3F4AAD4043f34b9A9AD024c743f2Db46F",
              blockHash: "0xa1693078ce8c680caf1a91a83d968564078dc1fe1214fae8a2b5cd85e1f88d04",
              blockNumber: "0x29ddbe5",
              data: "0x",
              topics: [
                "0xe644a03c3c564ec9e825adadd36c476e0a10ba3e96ea01650aff1b553bbf34e3",
                "0x000000000000000000000000eb12f3a5d5fb93684162e5966d1f6cc1d0ee2846"
              ],
              transactionHash: "0x305fb42e4c7f577e6554949914ba31cb191caf8b4d55888fef269139aec65369",
              transactionIndex: "0x2",
              logIndex: "0xb",
              removed: false
            },
            {
              address: "0x10ed17d3F4AAD4043f34b9A9AD024c743f2Db46F",
              blockHash: "0x07a0d5f58cf66f54e36fdbdedfe13fdd1d8d0e4e365875dd26b7e9b72fe5fa41",
              blockNumber: "0x29db893",
              data: "0x",
              topics: [
                "0xe644a03c3c564ec9e825adadd36c476e0a10ba3e96ea01650aff1b553bbf34e3",
                "0x000000000000000000000000c545124fa9704ba2ec880e3e5a141ebb6be98b41"
              ],
              transactionHash: "0x72aeefc1f59432d14d21b1de7a3a8e124069b1cbcdae7c7419323e6cd9b6496a",
              transactionIndex: "0x12",
              logIndex: "0x78",
              removed: false
            },
            {
              address: "0x10ed17d3F4AAD4043f34b9A9AD024c743f2Db46F",
              blockHash: "0x069d4be1d50c88d32538c4811b0485fc030293b83b65ca1bdf0237265d2a0f4c",
              blockNumber: "0x29dadfe",
              data: "0x",
              topics: [
                "0xe644a03c3c564ec9e825adadd36c476e0a10ba3e96ea01650aff1b553bbf34e3",
                "0x000000000000000000000000c545124fa9704ba2ec880e3e5a141ebb6be98b41"
              ],
              transactionHash: "0x6ce88eaf44e300463364f8e99b01d30cfe8293a7c6aab04629f46c14d28c5a4b",
              transactionIndex: "0xd",
              logIndex: "0x18",
              removed: false
            }
          ];
          
          const winners = [
            {
              address: "0x10ed17d3F4AAD4043f34b9A9AD024c743f2Db46F",
              blockHash: "0xee6aa96327daa1e869ebba594f38bdc98359eab34ead4d2e9c89bbf0428ef86d",
              blockNumber: "0x29db90e",
              data: "0x0000000000000000000000000000000000000000000000000021c0331d5dc0003258b46ba37a4eb869e1ea7311ce3ad9bcd657c227da27df2c6452edae79ef02",
              topics: [
                "0xa67547898330bfcb759cb0f460d13f13ce624befc285a30f961122f2a5badf20",
                "0x000000000000000000000000c545124fa9704ba2ec880e3e5a141ebb6be98b41"
              ],
              transactionHash: "0xddb5e88f1463637646f6ea77205bd87920ed1784beebe03ffebf3393776d1e6d",
              transactionIndex: "0x16",
              logIndex: "0x68",
              removed: false
            },
            {
              address: "0x10ed17d3F4AAD4043f34b9A9AD024c743f2Db46F",
              blockHash: "0x0ba03f077e3e4e3628f4286150a48648c8df3c4b721ed30acf5dc1d1c068ffc6",
              blockNumber: "0x29dae03",
              data: "0x0000000000000000000000000000000000000000000000000021c0331d5dc0003fbdf8c61bf15f2759392558ee17a4475d40c41c27562c952686cba093a04fa6",
              topics: [
                "0xa67547898330bfcb759cb0f460d13f13ce624befc285a30f961122f2a5badf20",
                "0x000000000000000000000000c545124fa9704ba2ec880e3e5a141ebb6be98b41"
              ],
              transactionHash: "0x076761a60bb87dc6640028ac3490f40b7d889b7d511ca81ba91a6fd25c1ab017",
              transactionIndex: "0x14",
              logIndex: "0x44",
              removed: false
            }
          ];

          if (filterTopics.length > 0) {
            const targetTopic = filterTopics[0];
            if (targetTopic === "0xe644a03c3c564ec9e825adadd36c476e0a10ba3e96ea01650aff1b553bbf34e3") {
              return tickets;
            }
            if (targetTopic === "0xa67547898330bfcb759cb0f460d13f13ce624befc285a30f961122f2a5badf20") {
              return winners;
            }
          }
          return [...tickets, ...winners];
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
};

Before(async () => {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ locale: "en-US" });
  page = await context.newPage();
  await setupMocks(page);
});

After(async () => {
  await browser.close();
});

Given("que eu configuro a tela para {string}", async (deviceType) => {
  await page.close();
  await context.close();
  
  const isMobile = deviceType === "celular" || deviceType === "mobile";
  if (isMobile) {
    const mobileDevice = devices["iPhone 12"];
    context = await browser.newContext({
      ...mobileDevice,
      locale: "en-US"
    });
  } else {
    context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: "en-US"
    });
  }
  
  page = await context.newPage();
  await setupMocks(page);
});

Given("que eu configuro o idioma do navegador para {string}", async (targetLocale) => {
  await page.addInitScript((locale) => {
    Object.defineProperty(navigator, 'language', { get: () => locale, configurable: true });
    Object.defineProperty(navigator, 'languages', { get: () => [locale], configurable: true });
  }, targetLocale);
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
Then("as abas de log {string} e {string} devem estar visíveis", async (tab1, tab2) => {
  const isTab1Visible = await page.locator("#log-tab-global").isVisible();
  const isTab2Visible = await page.locator("#log-tab-user").isVisible();
  expect(isTab1Visible).to.be.true;
  expect(isTab2Visible).to.be.true;
  
  const text1 = await page.locator("#log-tab-global").textContent();
  const text2 = await page.locator("#log-tab-user").textContent();
  
  expect(text1).to.include(tab1);
  expect(text2).to.include(tab2);
});

When("eu clico na aba de log {string}", async (tabName) => {
  const normalized = tabName.toLowerCase();
  if (normalized.includes("activity") || normalized.includes("my")) {
    await page.locator("#log-tab-user").click();
  } else {
    await page.locator("#log-tab-global").click();
  }
});

Then("a aba {string} deve estar ativa", async (tabName) => {
  const normalized = tabName.toLowerCase();
  const isUserTab = normalized.includes("activity") || normalized.includes("my");
  const selector = isUserTab ? "#log-tab-user" : "#log-tab-global";
  const activeClass = await page.locator(selector).getAttribute("class");
  expect(activeClass).to.include("active");
});

Then("as atividades históricas reais do contrato devem estar carregadas na tela", async () => {
  // Aguarda processamento assíncrono das queries de loteamento paralelo e getBlock
  await page.waitForTimeout(1500);

  const logsContainer = page.locator(".logs-container");
  const logContent = await logsContainer.textContent();
  
  expect(logContent.toLowerCase()).to.include("0xeb12...2846");
  expect(logContent.toLowerCase()).to.include("0xc545...8b41");
  expect(logContent).to.include("10/06");
  expect(logContent).to.not.include("~");

  // Valida que o link clicável do bloco está presente no HTML
  const blockLink = page.locator("a.log-block-link").first();
  const blockLinkHref = await blockLink.getAttribute("href");
  const blockLinkText = await blockLink.textContent();
  
  expect(blockLinkHref).to.include("basescan.org/block/");
  expect(blockLinkText.toLowerCase()).to.include("block #");
});

Then("o título dos logs {string} deve ser visível na página", async (expectedTitle) => {
  const logsTitleText = await page.locator(".log-header h2").textContent();
  expect(logsTitleText).to.include(expectedTitle);
});

Then("a logo e os controles do header devem estar na mesma linha", async () => {
  const logoBox = await page.locator(".logo-container").boundingBox();
  const controlsBox = await page.locator(".header-controls").boundingBox();
  const viewport = page.viewportSize();
  
  // Mesma linha horizontal (diferença no topo Y menor que 15px)
  expect(Math.abs(logoBox.y - controlsBox.y)).to.be.lessThan(15);
  
  // Ambos os elementos devem estar contidos na largura total da tela (sem transbordo)
  expect(logoBox.x).to.be.greaterThanOrEqual(0);
  expect(logoBox.x + logoBox.width).to.be.lessThanOrEqual(viewport.width);
  expect(controlsBox.x).to.be.greaterThanOrEqual(0);
  expect(controlsBox.x + controlsBox.width).to.be.lessThanOrEqual(viewport.width);
});

Then("o input de contrato e o botão de carregar devem estar na mesma linha", async () => {
  const inputBox = await page.locator(".input-text").boundingBox();
  const buttonBox = await page.locator(".input-group button").boundingBox();
  const viewport = page.viewportSize();
  
  // Mesma linha horizontal
  expect(Math.abs(inputBox.y - buttonBox.y)).to.be.lessThan(10);
  
  // Sem transbordo lateral
  expect(inputBox.x).to.be.greaterThanOrEqual(0);
  expect(inputBox.x + inputBox.width).to.be.lessThanOrEqual(viewport.width);
  expect(buttonBox.x).to.be.greaterThanOrEqual(0);
  expect(buttonBox.x + buttonBox.width).to.be.lessThanOrEqual(viewport.width);
});

Then("a logo e os controles do header devem estar em linhas separadas", async () => {
  const logoBox = await page.locator(".logo-container").boundingBox();
  const controlsBox = await page.locator(".header-controls").boundingBox();
  const viewport = page.viewportSize();
  
  // Linhas separadas (o topo do controle Y deve estar bem abaixo do fim da logo)
  expect(controlsBox.y).to.be.greaterThan(logoBox.y + logoBox.height - 2);
  
  // Sem transbordo lateral no celular
  expect(logoBox.x).to.be.greaterThanOrEqual(0);
  expect(logoBox.x + logoBox.width).to.be.lessThanOrEqual(viewport.width);
  expect(controlsBox.x).to.be.greaterThanOrEqual(0);
  expect(controlsBox.x + controlsBox.width).to.be.lessThanOrEqual(viewport.width);
});

Then("o input de contrato e o botão de carregar devem estar em linhas separadas", async () => {
  const inputBox = await page.locator(".input-text").boundingBox();
  const buttonBox = await page.locator(".input-group button").boundingBox();
  const viewport = page.viewportSize();
  
  // Linhas separadas (o topo do botão Y deve estar abaixo do fim do input)
  expect(buttonBox.y).to.be.greaterThan(inputBox.y + inputBox.height - 2);
  
  // Sem transbordo lateral no celular (a largura do input deve respeitar o limite da tela)
  expect(inputBox.x).to.be.greaterThanOrEqual(0);
  expect(inputBox.x + inputBox.width).to.be.lessThanOrEqual(viewport.width);
  expect(buttonBox.x).to.be.greaterThanOrEqual(0);
  expect(buttonBox.x + buttonBox.width).to.be.lessThanOrEqual(viewport.width);
});
