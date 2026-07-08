# Especificação de Design Funcional - Lotchain Frontend

Este documento descreve os requisitos funcionais, as histórias de usuário, o comportamento de internacionalização (i18n) e o design de tela da interface do usuário do **Lotchain**.

---

## 1. Histórias de Usuário (User Stories)

### US-001: Conexão de Carteira Web3
Como **jogador**, eu quero **conectar minha carteira MetaMask** na interface da aplicação para que eu possa assinar transações e interagir com o contrato inteligente na Base Sepolia.
*   **Critérios de Aceitação:**
    *   Exibir botão "Conectar Carteira" no cabeçalho.
    *   Ao clicar, solicitar conexão ao provedor do navegador.
    *   Após conectado, o botão deve exibir o endereço de forma abreviada (ex: `0xc545...9b41`).
    *   Se o usuário trocar de conta no MetaMask, a interface deve atualizar dinamicamente.

### US-002: Carregamento do Contrato
Como **jogador ou administrador**, eu quero **inserir o endereço do contrato inteligente da loteria** na interface para que os dados do sorteio correspondente sejam exibidos na tela.
*   **Critérios de Aceitação:**
    *   Exibir um campo de entrada (input) com validador de endereço Ethereum hexadecimal (42 caracteres começando com `0x`).
    *   Exibir botão "Carregar".
    *   Se o endereço for válido e contiver um contrato de loteria ativo, carregar os dados na tela. Caso contrário, exibir mensagem de erro legível.

### US-003: Visualização do Status em Tempo Real
Como **apostador**, eu quero **ver os dados atuais do sorteio** (preço do bilhete, prêmio acumulado, quantidade de apostadores e estado do sorteio) para decidir se e quanto quero apostar.
*   **Critérios de Aceitação:**
    *   Mostrar 4 cards com informações: "Preço do Bilhete", "Pool Atual", "Jogadores nesta rodada" e "Estado".
    *   O card "Estado" deve exibir visualmente uma luz verde para "Aberto" e vermelha para "Fechando/Sorteando".

### US-004: Compra de Bilhete
Como **jogador**, eu quero **comprar um bilhete usando meus ETH da rede Base** diretamente pela interface para participar do sorteio atual.
*   **Critérios de Aceitação:**
    *   Se a carteira não estiver conectada, o botão principal deve dizer "Conecte a Carteira Primeiro".
    *   Se a carteira estiver conectada, exibir botão "Comprar Bilhete".
    *   Exibir detalhamento das taxas (5% taxa de admin, 95% prêmio máximo estimado).
    *   Ao clicar em comprar, abrir confirmação no MetaMask com o valor exato do bilhete.

### US-005: Conversão Multi-cripto (ChangeNOW)
Como **jogador que não possui ETH na rede Base**, eu quero **comprar um bilhete utilizando outras criptomoedas (como BTC ou USDT)** para poder participar do sorteio de forma simples.
*   **Critérios de Aceitação:**
    *   Exibir um botão opcional "Apostar com outras Criptos".
    *   Ao clicar, exibir um modal integrado contendo o widget da ChangeNOW pré-configurado.
    *   O widget deve guiar o usuário na seleção da moeda de origem e fornecer o endereço e QR Code de depósito.

### US-006: Internacionalização (i18n)
Como **usuário global**, eu quero **que o site se adapte automaticamente ao idioma do meu navegador** para facilitar o entendimento das regras e do fluxo de aposta.
*   **Critérios de Aceitação:**
    *   Detectar o idioma padrão do navegador (`navigator.language`).
    *   Suportar traduções em **Português (PT)** e **Inglês (EN)**.
    *   Permitir alternar manualmente o idioma via seletor no cabeçalho.

---

## 2. Requisitos Funcionais

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF-001 | O sistema deve suportar conexão e desconexão de carteiras compatíveis com EVM (MetaMask). | Alta |
| RF-002 | O sistema deve validar e carregar endereços de contratos de loteria. | Alta |
| RF-003 | O sistema deve buscar dados de estado do contrato a cada 10 segundos. | Média |
| RF-004 | O sistema deve traduzir todos os elementos dinamicamente baseando-se no dicionário i18n. | Alta |
| RF-005 | O sistema deve integrar o iframe oficial do widget de câmbio da ChangeNOW. | Média |
| RF-006 | O sistema deve exibir um log de atividades atualizado em tempo real com eventos do contrato. | Média |

---

## 3. Estrutura do Dicionário de Traduções (i18n)

Para suportar dinamicamente os idiomas, a estrutura de traduções terá o seguinte formato básico:

```json
{
  "pt": {
    "header.title": "LOTCHAIN",
    "header.subtitle": "LOTERIA AUDITÁVEL",
    "header.connect": "CONECTAR CARTEIRA",
    "config.title": "CONFIGURAR CONTRATO",
    "config.desc": "Insira o endereço do contrato implantado na blockchain.",
    "config.button": "Carregar",
    "cards.ticketPrice": "PREÇO DO BILHETE",
    "cards.currentPool": "POOL ATUAL",
    "cards.players": "JOGADORES",
    "cards.state": "ESTADO",
    "cards.state.open": "Aberto",
    "cards.state.closed": "Sorteando",
    "buy.title": "Comprar Bilhete",
    "buy.desc": "Participa nesta ronda e concorre ao prêmio completo",
    "buy.adminFee": "Taxa de administração",
    "buy.maxPrize": "Prêmio máximo possível",
    "buy.button.connect": "CONECTA A CARTEIRA PRIMEIRO",
    "buy.button.buy": "COMPRAR BILHETE AGORA",
    "log.title": "ACTIVIDADE EM DIRETO",
    "log.status.waiting": "DApp carregada. Aguarda ligação da carteira."
  },
  "en": {
    "header.title": "LOTCHAIN",
    "header.subtitle": "AUDITABLE LOTTERY",
    "header.connect": "CONNECT WALLET",
    "config.title": "CONFIGURE CONTRACT",
    "config.desc": "Enter the smart contract address deployed on the blockchain.",
    "config.button": "Load",
    "cards.ticketPrice": "TICKET PRICE",
    "cards.currentPool": "CURRENT POOL",
    "cards.players": "PLAYERS",
    "cards.state": "STATUS",
    "cards.state.open": "Open",
    "cards.state.closed": "Drawing",
    "buy.title": "Buy Ticket",
    "buy.desc": "Participate in this round and compete for the full prize",
    "buy.adminFee": "Administration fee",
    "buy.maxPrize": "Maximum prize possible",
    "buy.button.connect": "CONNECT WALLET FIRST",
    "buy.button.buy": "BUY TICKET NOW",
    "log.title": "LIVE ACTIVITY",
    "log.status.waiting": "DApp loaded. Awaiting wallet connection."
  }
}
```
