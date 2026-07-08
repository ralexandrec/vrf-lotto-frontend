# Especificação de Design Técnico - Lotchain Frontend

Este documento descreve os detalhes técnicos, a arquitetura do código-fonte, a estrutura de arquivos, as dependências de terceiros e a configuração da suíte de testes Cucumber para o frontend do **Lotchain**.

---

## 1. Stack Tecnológica

*   **Framework base:** React (v18+) via Vite (v5+)
*   **Linguagem:** JavaScript (ES6+)
*   **Estilização:** Vanilla CSS (CSS3 Puro)
*   **Conexão Blockchain:** Ethers.js (v6) para comunicação via provedores RPC e carteiras Web3 (MetaMask).
*   **Internacionalização (i18n):** Sistema de traduções dinâmico em arquivo JS local baseado no idioma detectado no navegador.
*   **Integração de Câmbio:** Iframe integrado do Widget ChangeNOW parametrizado.
*   **Framework de Testes Integrados (E2E):** Cucumber.js (`@cucumber/cucumber`) + Playwright para automação de testes em navegador.

---

## 2. Estrutura de Diretórios do Projeto

```
/ContratoApostasNovoFrontend
├── .env                  # Arquivo de configuração seguro (copiado do contrato)
├── .gitignore            # Configuração de arquivos ignorados pelo Git
├── index.html            # Ponto de entrada HTML do app
├── package.json          # Dependências e scripts npm
├── vite.config.js        # Configuração do Vite bundler
├── spec/                 # Especificações e documentação técnica
│   ├── ARQUITETURA.md
│   ├── SDD_FUNCIONAL.md
│   └── SDD_TECNICO.md
├── src/
│   ├── App.jsx           # Componente principal do App (Interface e Lógica)
│   ├── index.css         # Design System e estilos (Preto & Dourado)
│   ├── i18n.js           # Dicionário de traduções e utilitário i18n
│   ├── main.jsx          # Renderizador do React
│   └── assets/           # Imagens e ícones estáticos
└── tests/                # Estrutura de testes Cucumber + Playwright
    ├── cucumber.js       # Configuração do runner do Cucumber
    ├── features/         # Especificações em formato Bherkin (.feature)
    │   └── ui.feature
    └── step-definitions/ # Definições de passos do Cucumber usando Playwright
        └── ui.steps.js
```

---

## 3. Detalhes de Integração Web3 (Ethers.js v6)

A integração com a blockchain Base Sepolia e a carteira do usuário usará o seguinte fluxo técnico:

### 3.1 Conexão com MetaMask
```javascript
import { ethers } from "ethers";

// Solicita conexão de contas do MetaMask
if (window.ethereum) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  console.log("Conectado:", address);
} else {
  alert("Por favor, instale o MetaMask!");
}
```

### 3.2 Leitura de Dados do Contrato (Multi-call Simulado)
```javascript
const provider = new ethers.BrowserProvider(window.ethereum);
const abi = [
  "function precoBilhete() public view returns (uint256)",
  "function getSaldo() public view returns (uint256)",
  "function getJogadores() public view returns (address[])",
  "function sorteioAberto() public view returns (bool)"
];
const contract = new ethers.Contract(contractAddress, abi, provider);

const ticketPrice = await contract.precoBilhete();
const pool = await contract.getSaldo();
const players = await contract.getJogadores();
const open = await contract.sorteioAberto();
```

---

## 4. Integração do Widget ChangeNOW

O widget de conversão será renderizado via `<iframe>` em um modal interativo no frontend. A URL será configurada dinamicamente com o endereço do contrato inteligente para garantir que a transação de compra seja enviada para a carteira da loteria:

```javascript
const changeNowUrl = `https://changenow.io/embeds/exchange/widget/v2?from=btc&to=ethbase&address=${contractAddress}&amount=0.015&theme=dark`;
```

**Parâmetros Utilizados:**
*   `from=btc`: Moeda padrão de entrada (pode ser alterada pelo usuário no widget).
*   `to=ethbase`: Moeda de saída. `ethbase` corresponde à moeda nativa ETH da rede Base (Mainnet) que a ChangeNOW suporta.
*   `address=${contractAddress}`: O endereço para o qual os fundos convertidos serão enviados (nosso contrato LoteriaApostas).
*   `theme=dark`: Tema escuro para integrar com a identidade visual do Lotchain.

---

## 5. Configuração da Suíte de Testes (Cucumber + Playwright)

### 5.1 O arquivo de Feature (`tests/features/ui.feature`)
```gherkin
Feature: Interface do usuário do Lotchain

  Scenario: Acessar a página principal e validar i18n
    Given que eu acesso a página inicial do Lotchain
    Then o título "LOTCHAIN" deve ser visível na página
    And o botão de conexão de carteira deve estar visível

  Scenario: Validar carregamento do contrato de loteria
    Given que eu acesso a página inicial do Lotchain
    When eu digito "0x10ed17d3F4AAD4043f34b9A9AD024c743f2Db46F" no campo de contrato
    And clico no botão de carregar
    Then as informações do contrato devem ser exibidas na tela
```

### 5.2 O arquivo de Passos (`tests/step-definitions/ui.steps.js`)
```javascript
const { Given, When, Then, Before, After } = require("@cucumber/cucumber");
const { chromium } = require("playwright");
const { expect } = require("chai");

let browser, page;

Before(async () => {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
});

After(async () => {
  await browser.close();
});

Given("que eu acesso a página inicial do Lotchain", async () => {
  await page.goto("http://localhost:5173");
});

Then("o título {string} deve ser visível na página", async (title) => {
  const heading = await page.textContent("h1");
  expect(heading).to.include(title);
});

And("o botão de conexão de carteira deve estar visível", async () => {
  const isVisible = await page.isVisible("#connect-wallet-btn");
  expect(isVisible).to.be.true;
});
```
