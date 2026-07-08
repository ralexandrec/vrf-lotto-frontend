# Regras e Estado do Projeto - Lotchain Frontend

Este arquivo define as regras de escopo de projeto e o estado atual para guiar a IA durante o desenvolvimento do frontend do **Lotchain**.

---

## 1. Informações de Referência do Contrato Inteligente (Base Sepolia)

O contrato de loteria já foi implantado e testado com sucesso na testnet da **Base Sepolia**:
*   **Endereço do Contrato:** `0x10ed17d3F4AAD4043f34b9A9AD024c743f2Db46F`
*   **Carteira Administradora (Owner):** `0xc545124FA9704BA2eC880e3E5A141eBb6bE98B41`
*   **Preço do Bilhete:** `0.01 ETH`
*   **Taxa do Administrador:** 5% do pool acumulado (o vencedor recebe 95%).
*   **Chainlink VRF v2.5 Coordinator:** `0x5c210ef41cd1a72de73bf76ec39637bb0d3d7bee`
*   **Chainlink Key Hash (30 gwei lane):** `0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71`
*   **Chainlink Subscription ID:** `103023586146563928944649189963194969683282176600025582987588036774645202964161`
*   **ABI do Contrato:** Salvo localmente para importação em [LoteriaApostas.json](file:///Users/renatoalexandredacunha/Projetos/ContratoApostasNovoFrontend/src/contracts/LoteriaApostas.json).

---

## 2. Histórico de Fases

### Fase 1: Inicialização e Documentação de Especificação (CONCLUÍDO)
- Criada a estrutura de pastas do projeto frontend.
- Copiado o arquivo seguro `.env` com as credenciais e chaves.
- Copiada a ABI compilada do contrato inteligente para `src/contracts/LoteriaApostas.json`.
- Criados os arquivos de documentação técnica e funcional na pasta [spec/](file:///Users/renatoalexandredacunha/Projetos/ContratoApostasNovoFrontend/spec/):
  - [spec/ARQUITETURA.md](file:///Users/renatoalexandredacunha/Projetos/ContratoApostasNovoFrontend/spec/ARQUITETURA.md) (fluxos de dados)
  - [spec/SDD_FUNCIONAL.md](file:///Users/renatoalexandredacunha/Projetos/ContratoApostasNovoFrontend/spec/SDD_FUNCIONAL.md) (requisitos e dicionário i18n)
  - [spec/SDD_TECNICO.md](file:///Users/renatoalexandredacunha/Projetos/ContratoApostasNovoFrontend/spec/SDD_TECNICO.md) (tecnologias e Cucumber)

---

## 3. Próxima Fase: Desenvolvimento do Frontend & Testes

Quando o usuário abrir este repositório no editor, as seguintes ações deverão ser tomadas sequencialmente:

1.  **Inicialização do Vite (React):**
    *   Rodar `npx -y create-vite@latest ./ --template react` para criar o app React na pasta atual (mesclando com a pasta `src/` e `spec/` existentes).
2.  **Instalação de Dependências:**
    *   Instalar: `npm install ethers` (v6) para interações Web3.
    *   Instalar dependências de teste integrados: `npm install --save-dev @cucumber/cucumber playwright chai`.
3.  **Desenvolvimento da Interface:**
    *   Implementar o design Dark Mode Premium com dourado em `src/index.css`.
    *   Adicionar suporte i18n em `src/i18n.js` para ler `navigator.language` e aplicar as traduções em PT/EN.
    *   Integrar conexão de carteira e leitura em tempo real do contrato.
    *   Criar o modal com o iframe da ChangeNOW.
4.  **Criação dos Testes Cucumber:**
    *   Configurar o runner e escrever os arquivos de features e definições de passos descritos em `spec/SDD_TECNICO.md`.

---

## 4. Regras de Testes e Simulação de Web3 (MetaMask)

1. **Inexistência de Extensão Física:** O navegador interativo utilizado por subagents em testes manuais/visuais não possui a extensão da MetaMask instalada. Clicar nos botões de conexão de carteira redirecionará a página para `metamask.io` e quebrará o fluxo.
2. **Uso de Mocks no Cucumber:** Para validar fluxos de conexão e transações, sempre utilize e mantenha a suíte de testes do Cucumber (`npx cucumber-js`), a qual intercepta o tráfego Web3 e injeta os mocks adequados de `window.ethereum` no Playwright (configurados em [tests/step-definitions/ui.steps.cjs](file:///Users/renatoalexandredacunha/Projetos/ContratoApostasNovoFrontend/tests/step-definitions/ui.steps.cjs)).
3. **Seletores de Funções EVM (Dispatcher):** Para estender os mocks do provedor Web3 no Cucumber, calcule a assinatura de bytes Keccak256 correspondente à chamada da ABI e retorne o payload hexadecimal adequado:
   * `precoBilhete()` -> `0xcd1d6d44` (retorna `uint256` em hex)
   * `getSaldo()` -> `0xe2eec9a7` (retorna `uint256` em hex)
   * `getJogadores()` -> `0x0040b837` (retorna array de endereços serializado)
   * `sorteioAberto()` -> `0x23aaa4c5` (retorna `bool` em hex)
   * `ultimoGanhador()` -> `0xba2c09f8` (retorna `address` em hex)
   * `ultimoPremio()` -> `0x9dbd21b0` (retorna `uint256` em hex)
   * `owner()` -> `0x8da5cb5b` (retorna `address` em hex)

