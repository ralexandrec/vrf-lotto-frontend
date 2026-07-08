# Arquitetura do Frontend - Lotchain

Este documento descreve a arquitetura do sistema do frontend **Lotchain**, sua relação com a blockchain (Base Sepolia), com as carteiras web3 e com o integrador de pagamentos multi-cripto ChangeNOW.

---

## 1. Diagrama de Blocos Geral

```mermaid
graph TD
    subgraph Frontend [Camada de Interface - React/Vite]
        UI[Página Web - Lotchain UI]
        i18n[Módulo de Tradução - i18n]
        Web3Provider[Conector Web3 - Wagmi/Ethers]
        ChangeNOW[Widget de Pagamento - ChangeNOW]
    end

    subgraph Wallet [Carteiras Web3]
        MetaMask[MetaMask / Browser Wallets]
    end

    subgraph Blockchain [Camada Blockchain - Base Sepolia]
        LotteryContract[Contrato Inteligente - LoteriaApostas.sol]
        VRFCoordinator[Coordenador Chainlink VRF v2.5]
    end

    subgraph ExternalServices [Serviços Externos]
        ChangeNOW_API[API de Liquidez - ChangeNOW]
    end

    UI --> i18n
    UI --> Web3Provider
    UI --> ChangeNOW
    
    Web3Provider <--> |JSON-RPC / Transações| MetaMask
    MetaMask <--> |Transações de Gás e Apostas| LotteryContract
    
    ChangeNOW <--> |Iframe / API| ChangeNOW_API
    ChangeNOW_API --> |Deposita ETH Convertido| LotteryContract
    
    LotteryContract <--> |Randomness Request / Callback| VRFCoordinator
```

---

## 2. Fluxos de Dados Principais

### 2.1 Conexão de Carteira e Leitura de Dados do Contrato
```mermaid
sequenceDiagram
    actor Jogador
    participant UI as Lotchain UI
    participant Provider as Web3 Provider
    participant MetaMask as MetaMask
    participant Contract as Contrato LoteriaApostas

    Jogador->>UI: Acessa o site
    UI->>UI: Detecta idioma do navegador (i18n)
    UI->>UI: Renderiza textos no idioma correto
    Jogador->>UI: Clica em "Conectar Carteira"
    UI->>Provider: Inicializa conexão
    Provider->>MetaMask: Solicita autorização de contas
    MetaMask->>Jogador: Abre popup de autorização
    Jogador->>MetaMask: Aprova conexão
    MetaMask-->>Provider: Retorna endereço do Jogador
    Provider-->>UI: Atualiza estado para conectado

    Note over UI, Contract: Leitura em tempo real
    UI->>Provider: Requisita dados do Contrato (precoBilhete, saldo, jogadores)
    Provider->>Contract: Chamadas view (precoBilhete(), getSaldo(), getJogadores())
    Contract-->>Provider: Retorna valores em wei e arrays
    Provider-->>UI: Atualiza os cards visuais na tela
```

### 2.2 Compra de Bilhete com Conversão via ChangeNOW
Este fluxo descreve como um jogador que não possui ETH na rede Base pode apostar enviando outra moeda (ex: BTC, LTC ou USDT) via ChangeNOW.

```mermaid
sequenceDiagram
    actor Jogador
    participant UI as Lotchain UI
    participant Widget as Widget ChangeNOW
    participant CN_API as API ChangeNOW
    participant Contract as Contrato LoteriaApostas

    Jogador->>UI: Clica em "Apostar com outras Criptos"
    UI->>Widget: Abre Modal do Widget
    Jogador->>Widget: Escolhe moeda de origem (ex: BTC)
    Jogador->>Widget: Insere seu endereço ETH (para eventuais reembolsos da ChangeNOW)
    Widget->>CN_API: Cria ordem de troca (Swap)
    Note over CN_API: Moeda de Destino: ETH na Base<br/>Endereço de Destino: Contrato LoteriaApostas
    CN_API-->>Widget: Retorna endereço de depósito (BTC) e ID da transação
    Widget-->>Jogador: Exibe endereço de depósito (e QR Code) para envio do BTC
    Jogador->>CN_API: Envia os BTCs de sua carteira pessoal
    CN_API->>CN_API: Detecta o pagamento e converte BTC -> ETH (Base)
    CN_API->>Contract: Transfere o valor exato em ETH Base (comprarBilhete)
    Contract-->>Contract: Registra o endereço de reembolso do Jogador como participante
```

---

## 3. Estado e Sincronização de Dados

O frontend se mantém atualizado através de dois mecanismos:
1. **Polling Actividade em Direto:** Uma chamada periódica (a cada 10 segundos) às funções view do contrato inteligente.
2. **Listeners de Eventos:** Escuta eventos emitidos pela blockchain para atualizar a tela instantaneamente assim que ocorrem:
   - `BilheteComprado(address jogador)`: Atualiza o contador de jogadores e o saldo do pool.
   - `SorteioIniciado(uint256 requestId)`: Altera o estado visual para "Sorteando..." e bloqueia o botão de apostas.
   - `VencedorSorteado(address vencedor, uint256 premio)`: Exibe um modal de parabéns, limpa a lista de jogadores e reabre o formulário de apostas.
