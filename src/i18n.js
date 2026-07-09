export const translations = {
  pt: {
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
    "buy.desc": "Participe nesta rodada e concorra ao prêmio completo",
    "buy.adminFee": "Taxa de administração",
    "buy.maxPrize": "Prêmio máximo possível",
    "buy.button.connect": "CONECTE A CARTEIRA PRIMEIRO",
    "buy.button.buy": "COMPRAR BILHETE AGORA",
    "log.title": "ATIVIDADE EM DIRETO",
    "log.status.waiting": "DApp carregado. Aguardando conexão da carteira.",
    "log.status.connected": "Carteira conectada: {address}",
    "log.status.contractLoaded": "Contrato carregado com sucesso!",
    "log.status.contractError": "Erro ao carregar contrato. Verifique o endereço.",
    
    // Wizard
    "wizard.title": "ASSISTENTE DE APOSTA",
    "wizard.step1": "1. Conectar",
    "wizard.step2": "2. Obter ETH",
    "wizard.step3": "3. Apostar",
    "wizard.walletConnected": "Carteira Conectada",
    "wizard.walletActive": "Ativa na Base Sepolia",
    "wizard.switchNetwork": "Mudar para Base Sepolia",
    "wizard.step1.desc": "Conecte sua carteira MetaMask configurada na Base Sepolia para começar a apostar.",
    "wizard.step2.wrongNetwork": "Rede Incorreta",
    "wizard.step2.wrongNetworkDesc": "Mude para a rede Base Sepolia para conseguir ler os dados do contrato e apostar.",
    "wizard.needBalance": "Você precisa de pelo menos {price} ETH para apostar. Saldo: {balance} ETH",
    "wizard.buyEthButton": "Adquirir ETH (Faucets / Câmbio)",
    "wizard.waitingFunds": "Aguardando saldo... A transação pode levar alguns minutos.",
    "wizard.readyToBet": "Saldo suficiente! Prossiga para a aposta.",
    
    // Modals
    "modal.title.testnet": "Obter ETH de Teste (Base Sepolia)",
    "modal.desc.testnet": "Como estamos em rede de testes, você pode obter moedas gratuitas nos links abaixo:",
    "modal.faucet.label": "Seu endereço para colar no Faucet:",
    "modal.title.mainnet": "Comprar ETH via ChangeNOW",
    "modal.desc.mainnet": "Converta outras criptomoedas ou compre via cartão diretamente para a sua carteira conectada:",
    "modal.changenow.warning": "Nota: Envie o equivalente a pelo menos 0.012 ETH para cobrir taxas de câmbio e de rede da Base Sepolia.",
    "modal.close": "Fechar",

    // Logs & Transactions
    "log.tx.sending": "Enviando transação de aposta...",
    "log.tx.success": "Aposta confirmada com sucesso! Você está participando.",
    "log.tx.error": "Erro ao processar transação: {error}",
    "log.event.ticketBought": "Novo bilhete comprado por: {address}",
    "log.event.drawStarted": "Sorteio iniciado! Aguardando número aleatório do Chainlink VRF...",
    "log.event.winnerDrawn": "Sorteio concluído! Vencedor: {winner}",
    "log.event.winnerPrize": "Prêmio pago: {prize} ETH",
    "winner.modal.title": "🎉 Parabéns!",
    "winner.modal.desc": "Você ganhou o prêmio da loteria no valor de {prize} ETH!",
    "winner.modal.close": "Obter Novo Bilhete",
    
    // Admin
    "admin.title": "PAINEL DO ADMINISTRADOR",
    "admin.desc": "Você está conectado como o proprietário (Owner) do contrato inteligente.",
    "admin.button.draw": "INICIAR SORTEIO (sortearVencedor)",
    "admin.button.drawing": "SORTEANDO...",
    "admin.noPlayers": "Não há jogadores na rodada para sortear.",
    "log.tx.drawing": "Enviando transação de encerramento e sorteio...",
    "log.tx.drawSuccess": "Sorteio iniciado com sucesso! ID de requisição enviado ao Chainlink VRF."
  },
  en: {
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
    "log.status.waiting": "DApp loaded. Awaiting wallet connection.",
    "log.status.connected": "Wallet connected: {address}",
    "log.status.contractLoaded": "Contract loaded successfully!",
    "log.status.contractError": "Error loading contract. Verify the address.",

    // Wizard
    "wizard.title": "BETTING WIZARD",
    "wizard.step1": "1. Connect",
    "wizard.step2": "2. Get ETH",
    "wizard.step3": "3. Bet",
    "wizard.walletConnected": "Wallet Connected",
    "wizard.walletActive": "Active on Base Sepolia",
    "wizard.switchNetwork": "Switch to Base Sepolia",
    "wizard.step1.desc": "Connect your MetaMask wallet configured on Base Sepolia to start betting.",
    "wizard.step2.wrongNetwork": "Wrong Network",
    "wizard.step2.wrongNetworkDesc": "Switch to the Base Sepolia network to read contract data and bet.",
    "wizard.needBalance": "You need at least {price} ETH to bet. Balance: {balance} ETH",
    "wizard.buyEthButton": "Get ETH (Faucets / Exchange)",
    "wizard.waitingFunds": "Awaiting balance... The transaction may take a few minutes.",
    "wizard.readyToBet": "Sufficient balance! Proceed to place bet.",

    // Modals
    "modal.title.testnet": "Get Test ETH (Base Sepolia)",
    "modal.desc.testnet": "Since we are on the testnet, you can claim free coins at the links below:",
    "modal.faucet.label": "Your address to paste in the Faucet:",
    "modal.title.mainnet": "Buy ETH via ChangeNOW",
    "modal.desc.mainnet": "Convert other cryptocurrencies or buy via credit card directly to your connected wallet:",
    "modal.changenow.warning": "Note: Make sure to send the equivalent of at least 0.012 ETH to cover exchange and network fees.",
    "modal.close": "Close",

    // Logs & Transactions
    "log.tx.sending": "Sending bet transaction...",
    "log.tx.success": "Bet confirmed successfully! You are participating.",
    "log.tx.error": "Error processing transaction: {error}",
    "log.event.ticketBought": "New ticket bought by: {address}",
    "log.event.drawStarted": "Draw started! Awaiting random number from Chainlink VRF...",
    "log.event.winnerDrawn": "Draw finished! Winner: {winner}",
    "log.event.winnerPrize": "Prize paid: {prize} ETH",
    "winner.modal.title": "🎉 Congratulations!",
    "winner.modal.desc": "You won the lottery prize of {prize} ETH!",
    "winner.modal.close": "Get New Ticket",
    
    // Admin
    "admin.title": "ADMIN PANEL",
    "admin.desc": "You are connected as the owner of the smart contract.",
    "admin.button.draw": "START DRAW (sortearVencedor)",
    "admin.button.drawing": "DRAWING...",
    "admin.noPlayers": "There are no players in this round to draw.",
    "log.tx.drawing": "Sending draw transaction...",
    "log.tx.drawSuccess": "Draw transaction successful! Request ID sent to Chainlink VRF."
  }
};

export const detectLanguage = () => {
  try {
    const savedLang = localStorage.getItem("preferred_language");
    if (savedLang === "pt" || savedLang === "en") {
      return savedLang;
    }
  } catch (e) {
    console.error("Failed to read preferred language:", e);
  }

  const browserLang = navigator.language || navigator.userLanguage || "en";
  const langLower = browserLang.toLowerCase();

  if (langLower.startsWith("pt") || langLower.includes("portuguese") || langLower.startsWith("ptb")) {
    return "pt";
  }

  return "en";
};

export const translate = (key, lang = "en", params = {}) => {
  const dictionary = translations[lang] || translations["en"];
  let text = dictionary[key] || translations["en"][key] || key;
  
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  
  return text;
};
