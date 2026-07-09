import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import LoteriaApostasABI from "./contracts/LoteriaApostas.json";
import { translate, detectLanguage } from "./i18n";

const DEFAULT_CONTRACT_ADDRESS = "0x10ed17d3F4AAD4043f34b9A9AD024c743f2Db46F";
const BASE_SEPOLIA_CHAIN_ID = "84532"; // Decimal ID para Base Sepolia
const BASE_SEPOLIA_HEX_CHAIN_ID = "0x14a34"; // Hex ID para Base Sepolia
const BASE_MAINNET_CHAIN_ID = "8453"; // Decimal ID para Base Mainnet

// Expressões Regulares compiladas uma única vez
const ADDRESS_REGEX = /0x[a-fA-F0-9]{4}\.\.\.[a-fA-F0-9]{4}/gi;
const TX_REGEX = /0x[a-fA-F0-9]{10}\.\.\./gi;
const FULL_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/gi;

function App() {
  // Estado de Internacionalização
  const [lang, setLang] = useState(detectLanguage());

  // Salva a preferência de idioma no localStorage sempre que alterado
  useEffect(() => {
    try {
      localStorage.setItem("preferred_language", lang);
    } catch (e) {
      console.error("Failed to save language preference:", e);
    }
  }, [lang]);

  // Estado de Conexão da Carteira
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [userBalance, setUserBalance] = useState("0.0");
  const [chainId, setChainId] = useState("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Estado do Contrato Inteligente
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [contractInput, setContractInput] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [ticketPrice, setTicketPrice] = useState("0.01");
  const [currentPool, setCurrentPool] = useState("0.0");
  const [players, setPlayers] = useState([]);
  const [sorteioAberto, setSorteioAberto] = useState(true);
  const [ultimoGanhador, setUltimoGanhador] = useState("");
  const [ultimoPremio, setUltimoPremio] = useState("0.0");
  const [contractOwner, setContractOwner] = useState("");

  // Estado de UI e Modais
  const [showGetEthModal, setShowGetEthModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerPrize, setWinnerPrize] = useState("0.0");
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTab, setActiveTab] = useState("user");
  const [logs, setLogs] = useState([]);

  // Referência para evitar múltiplos listeners em React StrictMode
  const contractRef = useRef(null);

  // Helper para tradução no escopo
  const t = (key, params = {}) => translate(key, lang, params);

  // Adiciona logs no console visual
  const addLog = (text, type = "default", meta = {}, scope = "user") => {
    const timestamp = new Date().toLocaleTimeString();
    const id = meta.txHash ? `${meta.txHash}-${type}` : `${Date.now()}-${Math.random()}`;

    setLogs((prevLogs) => {
      const newLog = { id, time: timestamp, text, type, meta, scope };
      const combined = [newLog, ...prevLogs];
      const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      return unique.slice(0, 50);
    });
  };

  const getExplorerUrl = (addressOrTx, type = "address") => {
    const isMainnet = chainId === BASE_MAINNET_CHAIN_ID;
    const baseDomain = isMainnet ? "https://basescan.org" : "https://sepolia.basescan.org";
    return `${baseDomain}/${type}/${addressOrTx}`;
  };

  const renderLogText = (log) => {
    let text = log.text;

    if (log.meta && log.meta.address) {
      const parts = text.split(ADDRESS_REGEX);
      if (parts.length > 1) {
        const matches = text.match(ADDRESS_REGEX);
        const abbrAddress = matches ? matches[0] : "";
        const explorerUrl = getExplorerUrl(log.meta.address, "address");
        return (
          <>
            {parts[0]}
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="log-link">
              {abbrAddress}
            </a>
            {parts[1]}
          </>
        );
      }
    }

    if (log.meta && log.meta.txHash) {
      const parts = text.split(TX_REGEX);
      if (parts.length > 1) {
        const matches = text.match(TX_REGEX);
        const abbrTx = matches ? matches[0] : "";
        const explorerUrl = getExplorerUrl(log.meta.txHash, "tx");
        return (
          <>
            {parts[0]}
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="log-link">
              {abbrTx}
            </a>
            {parts[1]}
          </>
        );
      }
    }

    const fullAddressMatch = text.match(FULL_ADDRESS_REGEX);
    if (fullAddressMatch) {
      const addr = fullAddressMatch[0];
      const parts = text.split(FULL_ADDRESS_REGEX);
      const explorerUrl = getExplorerUrl(addr, "address");
      return (
        <>
          {parts[0]}
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="log-link">
            {`${addr.substring(0, 6)}...${addr.substring(38)}`}
          </a>
          {parts[1]}
        </>
      );
    }

    return text;
  };

  useEffect(() => {
    addLog(t("log.status.waiting"), "default");
    
    // Verifica se a carteira já está conectada
    checkWalletConnected();

    // Configura listeners se a extensão window.ethereum existir
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [lang]);

  // Sempre que a carteira conectar, mudar de rede ou carregar contrato, atualiza dados
  useEffect(() => {
    if (walletConnected && isCorrectNetwork && contractAddress) {
      loadContractData();
      setupContractEventListeners();
    }
  }, [walletConnected, isCorrectNetwork, contractAddress]);

  // Executa polling a cada 10 segundos
  useEffect(() => {
    let interval;
    if (walletConnected && isCorrectNetwork && contractAddress) {
      interval = setInterval(() => {
        loadContractData();
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [walletConnected, isCorrectNetwork, contractAddress]);

  const checkWalletConnected = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          const currentChainId = network.chainId.toString();
          setChainId(currentChainId);
          
          const isCorrect = currentChainId === BASE_SEPOLIA_CHAIN_ID || currentChainId === BASE_MAINNET_CHAIN_ID;
          setIsCorrectNetwork(isCorrect);

          const address = accounts[0].address;
          setUserAddress(address);
          setWalletConnected(true);
          
          const balance = await provider.getBalance(address);
          setUserBalance(ethers.formatEther(balance));
          
          addLog(t("log.status.connected", { address: `${address.substring(0, 6)}...${address.substring(38)}` }), "success");
        }
      } catch (error) {
        console.error("Error checking wallet connection", error);
      }
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setWalletConnected(false);
      setUserAddress("");
      setUserBalance("0.0");
      addLog(t("log.status.waiting"), "default");
    } else {
      const address = accounts[0];
      setUserAddress(address);
      setWalletConnected(true);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      setUserBalance(ethers.formatEther(balance));
      
      addLog(t("log.status.connected", { address: `${address.substring(0, 6)}...${address.substring(38)}` }), "success");
    }
  };

  const handleChainChanged = (hexChainId) => {
    const decChainId = parseInt(hexChainId, 16).toString();
    setChainId(decChainId);
    const isCorrect = decChainId === BASE_SEPOLIA_CHAIN_ID || decChainId === BASE_MAINNET_CHAIN_ID;
    setIsCorrectNetwork(isCorrect);
    
    if (isCorrect) {
      addLog(`Rede alterada para Base. ID: ${decChainId}`, "success");
      checkWalletConnected();
    } else {
      addLog(`Rede incorreta conectada. Mude para a rede Base. ID: ${decChainId}`, "error");
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        
        const network = await provider.getNetwork();
        const currentChainId = network.chainId.toString();
        setChainId(currentChainId);
        
        const isCorrect = currentChainId === BASE_SEPOLIA_CHAIN_ID || currentChainId === BASE_MAINNET_CHAIN_ID;
        setIsCorrectNetwork(isCorrect);

        const address = accounts[0];
        setUserAddress(address);
        setWalletConnected(true);

        const balance = await provider.getBalance(address);
        setUserBalance(ethers.formatEther(balance));

        addLog(t("log.status.connected", { address: `${address.substring(0, 6)}...${address.substring(38)}` }), "success");

        if (!isCorrect) {
          await switchOrAddNetwork();
        }
      } catch (error) {
        addLog(t("log.tx.error", { error: error.message }), "error");
      }
    } else {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        const cleanUrl = window.location.href.replace(/^https?:\/\//, "");
        const deepLink = `https://metamask.app.link/dapp/${cleanUrl}`;
        window.location.href = deepLink;
      } else {
        try {
          sessionStorage.setItem('pending_metamask_install', 'true');
          
          window.addEventListener('focus', () => {
            if (sessionStorage.getItem('pending_metamask_install') === 'true') {
              sessionStorage.removeItem('pending_metamask_install');
              window.location.reload();
            }
          }, { once: true });
        } catch (e) {
          console.error("sessionStorage error:", e);
        }

        addLog(t("buy.installMetaMaskAlert"), "error");
        window.open("https://metamask.io/", "_blank");
      }
    }
  };

  const switchOrAddNetwork = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BASE_SEPOLIA_HEX_CHAIN_ID }],
        });
      } catch (switchError) {
        // Redes não encontradas (Erro 4902)
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: BASE_SEPOLIA_HEX_CHAIN_ID,
                  chainName: "Base Sepolia",
                  nativeCurrency: {
                    name: "Ether",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://sepolia.base.org"],
                  blockExplorerUrls: ["https://sepolia.basescan.org"],
                },
              ],
            });
          } catch (addError) {
            addLog(`Falha ao adicionar rede: ${addError.message}`, "error");
          }
        } else {
          addLog(`Falha ao mudar de rede: ${switchError.message}`, "error");
        }
      }
    }
  };

  const loadContractData = async () => {
    if (!window.ethereum || !isCorrectNetwork) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const code = await provider.getCode(contractAddress);
      
      // Valida se há um contrato no endereço
      if (code === "0x") {
        addLog(t("log.status.contractError"), "error");
        return;
      }

      const contract = new ethers.Contract(contractAddress, LoteriaApostasABI.abi, provider);
      
      const price = await contract.precoBilhete();
      const pool = await contract.getSaldo();
      const playersList = await contract.getJogadores();
      const open = await contract.sorteioAberto();
      const winner = await contract.ultimoGanhador();
      const lastPrize = await contract.ultimoPremio();

      const ownerAddress = await contract.owner();

      setTicketPrice(ethers.formatEther(price));
      setCurrentPool(ethers.formatEther(pool));
      setPlayers(playersList);
      setSorteioAberto(open);
      setUltimoGanhador(winner);
      setUltimoPremio(ethers.formatEther(lastPrize));
      setContractOwner(ownerAddress);

      // Atualiza saldo do usuário
      if (userAddress) {
        const balance = await provider.getBalance(userAddress);
        setUserBalance(ethers.formatEther(balance));
      }

      // Carrega os logs históricos
      await loadHistoricalEvents(contract, provider);
    } catch (error) {
      console.error("Error loading contract details", error);
    }
  };

  const loadHistoricalEvents = async (contract, provider) => {
    try {
      const latestBlock = await provider.getBlockNumber();
      
      // Contorna limite rígido de range (ex: 2.000 blocos max por chamada RPC no nó gratuito da Base Sepolia)
      const batchSize = 2000;
      const totalBlocksToQuery = 20000; // Cobre os últimos 20.000 blocos (~11 horas)

      const filterTicket = contract.filters.BilheteComprado();
      const filterWinner = contract.filters.VencedorSorteado();

      const queriesTicket = [];
      const queriesWinner = [];

      for (let i = 0; i < totalBlocksToQuery; i += batchSize) {
        const toBlock = latestBlock - i;
        if (toBlock < 0) break;

        const fromBlock = Math.max(0, toBlock - batchSize + 1);
        queriesTicket.push(contract.queryFilter(filterTicket, fromBlock, toBlock));
        queriesWinner.push(contract.queryFilter(filterWinner, fromBlock, toBlock));

        if (fromBlock === 0) break;
      }

      const [resultsTicket, resultsWinner] = await Promise.all([
        Promise.all(queriesTicket),
        Promise.all(queriesWinner)
      ]);

      const ticketEvents = resultsTicket.flat();
      const winnerEvents = resultsWinner.flat();

      const parsedTicketLogs = ticketEvents.map(e => {
        const jogador = e.args[0];
        return {
          id: `${e.transactionHash}-buy`,
          text: t("log.event.ticketBought", { address: `${jogador.substring(0, 6)}...${jogador.substring(38)}` }),
          type: "highlight",
          meta: { address: jogador, txHash: e.transactionHash },
          scope: jogador.toLowerCase() === (userAddress || "").toLowerCase() ? "both" : "global",
          blockNumber: Number(e.blockNumber)
        };
      });

      const parsedWinnerLogs = winnerEvents.map(e => {
        const vencedor = e.args[0];
        const premio = ethers.formatEther(e.args[1]);
        const isUser = vencedor.toLowerCase() === (userAddress || "").toLowerCase();
        const scope = isUser ? "both" : "global";

        return [
          {
            id: `${e.transactionHash}-winner`,
            text: t("log.event.winnerDrawn", { winner: `${vencedor.substring(0, 6)}...${vencedor.substring(38)}` }),
            type: "success",
            meta: { address: vencedor, txHash: e.transactionHash },
            scope: scope,
            blockNumber: Number(e.blockNumber)
          },
          {
            id: `${e.transactionHash}-prize`,
            text: t("log.event.winnerPrize", { prize: premio }),
            type: "success",
            meta: { address: vencedor, txHash: e.transactionHash },
            scope: scope,
            blockNumber: Number(e.blockNumber)
          }
        ];
      }).flat();

      // 1. Ordena todos os logs históricos por bloco decrescente (mais recentes primeiro)
      const sortedAllLogs = [...parsedTicketLogs, ...parsedWinnerLogs].sort((a, b) => b.blockNumber - a.blockNumber);

      // 2. Fatia para conter no máximo as 15 atividades mais recentes (otimização de tráfego)
      const slicedHistoricalLogs = sortedAllLogs.slice(0, 15);

      // 3. Coleta os blocos únicos contidos nessas 15 atividades
      const uniqueBlocks = [...new Set(slicedHistoricalLogs.map(l => l.blockNumber))];

      // 4. Busca os timestamps reais dos blocos únicos em paralelo
      const blockCache = {};
      await Promise.all(uniqueBlocks.map(async (num) => {
        try {
          const block = await provider.getBlock(num);
          if (block) {
            blockCache[num] = block.timestamp * 1000; // Milissegundos UNIX
          }
        } catch (e) {
          console.error(`Failed to fetch block timestamp for block ${num}:`, e);
        }
      }));

      // Helper para formatar a data real exata
      const formatBlockTime = (timestamp) => {
        const eventDate = new Date(timestamp);
        const today = new Date();
        
        const isToday = eventDate.getDate() === today.getDate() &&
                        eventDate.getMonth() === today.getMonth() &&
                        eventDate.getFullYear() === today.getFullYear();
                        
        if (isToday) {
          return eventDate.toLocaleTimeString(); // Retorna "HH:MM:SS"
        } else {
          const day = String(eventDate.getDate()).padStart(2, '0');
          const month = String(eventDate.getMonth() + 1).padStart(2, '0');
          const hours = String(eventDate.getHours()).padStart(2, '0');
          const minutes = String(eventDate.getMinutes()).padStart(2, '0');
          return `${day}/${month} ${hours}:${minutes}`; // Retorna "DD/MM HH:MM"
        }
      };

      // 5. Popula a propriedade time de cada log com a data exata vinda do cache de blocos
      const finalHistoricalLogs = slicedHistoricalLogs.map(log => {
        const ts = blockCache[log.blockNumber];
        return {
          ...log,
          time: ts ? formatBlockTime(ts) : "---"
        };
      });

      setLogs((prevLogs) => {
        // Preserva logs locais de UI (Minhas Ações) que não são eventos blockchain
        const uiLogs = prevLogs.filter(l => l.scope === "user" && !l.meta?.txHash);
        const combined = [...uiLogs, ...finalHistoricalLogs];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        return unique.slice(0, 50);
      });
    } catch (error) {
      console.error("Error loading historical events:", error);
    }
  };

  const setupContractEventListeners = () => {
    if (!window.ethereum || !isCorrectNetwork) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, LoteriaApostasABI.abi, provider);

    // Evita múltiplos event listeners acumulados em renderizações
    if (contractRef.current) {
      contractRef.current.removeAllListeners();
    }
    contractRef.current = contract;

    contract.on("BilheteComprado", (jogador, event) => {
      const txHash = event?.log?.transactionHash || "";
      addLog(
        t("log.event.ticketBought", { address: `${jogador.substring(0, 6)}...${jogador.substring(38)}` }),
        "highlight",
        { address: jogador, txHash },
        jogador.toLowerCase() === (userAddress || "").toLowerCase() ? "both" : "global"
      );
      loadContractData();
    });

    contract.on("SorteioIniciado", (event) => {
      const txHash = event?.log?.transactionHash || "";
      addLog(t("log.event.drawStarted"), "highlight", { txHash }, "global");
      loadContractData();
    });

    contract.on("VencedorSorteado", (vencedor, premio, event) => {
      const txHash = event?.log?.transactionHash || "";
      const formattedPrize = ethers.formatEther(premio);
      const isUser = vencedor.toLowerCase() === (userAddress || "").toLowerCase();
      const scope = isUser ? "both" : "global";

      addLog(
        t("log.event.winnerDrawn", { winner: `${vencedor.substring(0, 6)}...${vencedor.substring(38)}` }),
        "success",
        { address: vencedor, txHash },
        scope
      );
      addLog(
        t("log.event.winnerPrize", { prize: formattedPrize }),
        "success",
        { address: vencedor, txHash },
        scope
      );
      
      // Abre modal se for o vencedor conectado
      if (userAddress && vencedor.toLowerCase() === userAddress.toLowerCase()) {
        setWinnerPrize(formattedPrize);
        setShowWinnerModal(true);
      }
      loadContractData();
    });
  };

  const handleLoadContract = () => {
    if (ethers.isAddress(contractInput)) {
      setContractAddress(contractInput);
      addLog(t("log.status.contractLoaded"), "success");
    } else {
      addLog(t("log.status.contractError"), "error");
    }
  };

  const buyTicket = async () => {
    if (!window.ethereum || !walletConnected || !isCorrectNetwork) return;

    try {
      setIsPlacingBet(true);
      addLog(t("log.tx.sending"), "default");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, LoteriaApostasABI.abi, signer);

      const valueToSend = ethers.parseEther(ticketPrice);
      const tx = await contract.comprarBilhete({ value: valueToSend });
      
      addLog(`Transação enviada: ${tx.hash.substring(0, 10)}... Aguardando confirmação...`, "default", { txHash: tx.hash });
      await tx.wait();

      addLog(t("log.tx.success"), "success");
      loadContractData();
    } catch (error) {
      addLog(t("log.tx.error", { error: error.message }), "error");
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleSortearVencedor = async () => {
    if (!window.ethereum || !walletConnected || !isCorrectNetwork) return;
    if (players.length === 0) {
      addLog(t("admin.noPlayers"), "error");
      return;
    }

    try {
      setIsDrawing(true);
      addLog(t("log.tx.drawing"), "default");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, LoteriaApostasABI.abi, signer);

      const tx = await contract.sortearVencedor();
      addLog(`Transação de sorteio enviada: ${tx.hash.substring(0, 10)}... Aguardando confirmação...`, "default", { txHash: tx.hash });
      await tx.wait();

      addLog(t("log.tx.drawSuccess"), "success");
      loadContractData();
    } catch (error) {
      addLog(t("log.tx.error", { error: error.message }), "error");
    } finally {
      setIsDrawing(false);
    }
  };

  // Determinar o passo do Wizard
  let currentStep = 1;
  const numericBalance = parseFloat(userBalance);
  const numericPrice = parseFloat(ticketPrice);

  if (walletConnected && isCorrectNetwork) {
    if (numericBalance >= numericPrice) {
      currentStep = 3;
    } else {
      currentStep = 2;
    }
  }

  // Links do Faucet para Testnet (Base Sepolia)
  const faucets = [
    { name: "ZalaLena Faucet", url: "https://faucet.zalalena.com/base", desc: "Reivindicação rápida na rede Base Sepolia" },
    { name: "Superchain Faucet", url: "https://faucets.chain.link/base-sepolia", desc: "Fornecido pela Chainlink Network" },
    { name: "QuickNode Faucet", url: "https://faucet.quicknode.com/base/sepolia", desc: "Reivindicação rápida de testnet ETH" }
  ];

  // URL da ChangeNOW pré-configurada para Mainnet (e apontando para o endereço do usuário)
  const changeNowUrl = `https://changenow.io/embeds/exchange/widget/v2?from=btc&to=ethbase&address=${userAddress}&amount=0.015&theme=dark`;

  return (
    <>
      {/* Cabeçalho */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-main">
            <span>{t("header.title")}</span>
          </div>
          <div className="logo-badge">{t("header.subtitle")}</div>
        </div>
        
        <div className="header-controls">
          <select 
            className="lang-selector" 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="pt">PT</option>
            <option value="en">EN</option>
          </select>
          
          <button 
            id="connect-wallet-btn"
            className="btn btn-secondary" 
            onClick={connectWallet}
          >
            {walletConnected ? (
              <>
                <span className="status-dot active"></span>
                {`${userAddress.substring(0, 6)}...${userAddress.substring(38)}`}
              </>
            ) : (
              t("header.connect")
            )}
          </button>
        </div>
      </header>

      {/* Configuração de Contrato */}
      <section className="card">
        <div className="config-section">
          <h2>{t("config.title")}</h2>
          <p>{t("config.desc")}</p>
          <div className="input-group">
            <input 
              type="text" 
              className="input-text" 
              value={contractInput} 
              onChange={(e) => setContractInput(e.target.value)} 
              placeholder="0x..."
            />
            <button className="btn btn-secondary" onClick={handleLoadContract}>
              {t("config.button")}
            </button>
          </div>
        </div>
      </section>

      {/* Painel de Métricas da Loteria */}
      <section className="metrics-grid">
        <div className="card metric-card">
          <span className="metric-icon">🎟️</span>
          <span className="metric-label">{t("cards.ticketPrice")}</span>
          <span className="metric-value">{ticketPrice} ETH</span>
        </div>
        
        <div className="card metric-card">
          <span className="metric-icon">💰</span>
          <span className="metric-label">{t("cards.currentPool")}</span>
          <span className="metric-value highlight">{currentPool} ETH</span>
        </div>
        
        <div className="card metric-card">
          <span className="metric-icon">👥</span>
          <span className="metric-label">{t("cards.players")}</span>
          <span className="metric-value">{players.length}</span>
        </div>
        
        <div className="card metric-card">
          <span className="metric-icon">🟢</span>
          <span className="metric-label">{t("cards.state")}</span>
          <div className="status-indicator">
            <span className={`status-dot ${sorteioAberto ? "active" : ""}`}></span>
            {sorteioAberto ? t("cards.state.open") : t("cards.state.closed")}
          </div>
        </div>
      </section>

      {/* Bet Wizard */}
      <section className="card wizard-card">
        <h2 className="wizard-header-title">{t("wizard.title")}</h2>
        
        <div className="wizard-steps">
          {/* Barra de progresso visual */}
          <div 
            className="wizard-steps-progress" 
            style={{ width: currentStep === 1 ? "0%" : currentStep === 2 ? "40%" : "80%" }}
          ></div>

          <div className={`wizard-step ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
            <div className="step-number">{currentStep > 1 ? "✓" : "1"}</div>
            <div className="step-label">{t("wizard.step1")}</div>
          </div>
          
          <div className={`wizard-step ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}>
            <div className="step-number">{currentStep > 2 ? "✓" : "2"}</div>
            <div className="step-label">{t("wizard.step2")}</div>
          </div>
          
          <div className={`wizard-step ${currentStep >= 3 ? "active" : ""}`}>
            <div className="step-number">3</div>
            <div className="step-label">{t("wizard.step3")}</div>
          </div>
        </div>

        {/* Painel do Passo Corrente */}
        <div className="step-content-panel">
          {currentStep === 1 && (
            <>
              <div className="step-info-title">{t("buy.button.connect")}</div>
              <p>{t("wizard.step1.desc")}</p>
              <button className="btn btn-primary" onClick={connectWallet}>
                {t("header.connect")}
              </button>
            </>
          )}

          {currentStep === 2 && (
            <>
              {!isCorrectNetwork ? (
                <>
                  <div className="step-info-title text-error">{t("wizard.step2.wrongNetwork")}</div>
                  <p>{t("wizard.step2.wrongNetworkDesc")}</p>
                  <button className="btn btn-primary" onClick={switchOrAddNetwork}>
                    {t("wizard.switchNetwork")}
                  </button>
                </>
              ) : (
                <>
                  <div className="step-info-title">
                    {t("wizard.needBalance", { price: ticketPrice, balance: parseFloat(userBalance).toFixed(4) })}
                  </div>
                  <p>{t("wizard.waitingFunds")}</p>
                  <button className="btn btn-primary" onClick={() => setShowGetEthModal(true)}>
                    {t("wizard.buyEthButton")}
                  </button>
                </>
              )}
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="step-info-title">
                {t("wizard.readyToBet")} <span className="success-badge">{userBalance.substring(0, 6)} ETH</span>
              </div>
              <p>{t("buy.desc")}</p>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {t("buy.adminFee")}: 5% | {t("buy.maxPrize")}: {((parseFloat(currentPool) + parseFloat(ticketPrice)) * 0.95).toFixed(4)} ETH
              </div>
              <button 
                id="buy-ticket-btn"
                className="btn btn-primary glow-btn-active" 
                onClick={buyTicket} 
                disabled={isPlacingBet || !sorteioAberto}
              >
                {isPlacingBet ? "PROCESSANDO..." : t("buy.button.buy")}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Console de Atividades em Tempo Real */}
      <section className="card activity-log">
        <div className="log-header">
          <h2>{t("log.title")}</h2>
          <div className="log-tabs">
            <button 
              id="log-tab-user"
              className={`log-tab-btn ${activeTab === "user" ? "active" : ""}`}
              onClick={() => setActiveTab("user")}
            >
              {t("log.tab.user")}
            </button>
            <button 
              id="log-tab-global"
              className={`log-tab-btn ${activeTab === "global" ? "active" : ""}`}
              onClick={() => setActiveTab("global")}
            >
              {t("log.tab.global")}
            </button>
          </div>
        </div>
        <div className="logs-container">
          {logs
            .filter((log) => {
              if (activeTab === "global") {
                return log.scope === "global" || log.scope === "both";
              } else {
                return log.scope === "user" || log.scope === "both";
              }
            })
            .map((log) => (
              <div key={log.id} className="log-entry">
                <span className="log-time">[{log.time}]</span>
                {log.blockNumber && (
                  <a 
                    href={getExplorerUrl(log.blockNumber, "block")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="log-block-link"
                  >
                    [{t("log.blockLabel", { number: log.blockNumber })}]
                  </a>
                )}
                <span className={`log-text ${log.type}`}>{renderLogText(log)}</span>
              </div>
            ))}
        </div>
      </section>

      {/* Painel do Administrador (Owner do Contrato) */}
      {walletConnected && userAddress.toLowerCase() === contractOwner.toLowerCase() && (
        <section className="card admin-card" style={{ border: "1px dashed var(--gold-primary)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2>{t("admin.title")}</h2>
          <p>{t("admin.desc")}</p>
          <button 
            id="draw-winner-btn"
            className="btn btn-primary" 
            onClick={handleSortearVencedor}
            disabled={isDrawing || players.length === 0}
            style={{ alignSelf: "flex-start", marginTop: "8px" }}
          >
            {isDrawing ? t("admin.button.drawing") : t("admin.button.draw")}
          </button>
        </section>
      )}

      {/* Modal para Obter ETH (Faucets em Testnet / ChangeNOW em Mainnet) */}
      {showGetEthModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {chainId === BASE_SEPOLIA_CHAIN_ID 
                  ? t("modal.title.testnet") 
                  : t("modal.title.mainnet")
                }
              </h3>
              <button className="modal-close-btn" onClick={() => setShowGetEthModal(false)}>×</button>
            </div>
            
            <p style={{ fontSize: "0.9rem" }}>
              {chainId === BASE_SEPOLIA_CHAIN_ID 
                ? t("modal.desc.testnet") 
                : t("modal.desc.mainnet")
              }
            </p>

            {chainId === BASE_SEPOLIA_CHAIN_ID ? (
              // Modo Testnet - Exibe Faucets
              <div className="faucets-list">
                <div className="copy-address-box">
                  <span>{userAddress.substring(0, 16)}...{userAddress.substring(34)}</span>
                  <button className="copy-btn" onClick={() => {
                    navigator.clipboard.writeText(userAddress);
                    addLog("Endereço copiado para a área de transferência!", "success");
                  }}>
                    Copiar
                  </button>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                  {t("modal.faucet.label")}
                </div>
                {faucets.map((faucet, index) => (
                  <div key={index} className="faucet-item">
                    <div className="faucet-info">
                      <span className="faucet-name">{faucet.name}</span>
                      <span className="faucet-desc">{faucet.desc}</span>
                    </div>
                    <a href={userAddress ? `${faucet.url}${faucet.url.includes("?") ? "&" : "?"}address=${userAddress}` : faucet.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                      Acessar
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              // Modo Mainnet - Exibe Widget da ChangeNOW
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--accent-red)", marginBottom: "8px" }}>
                  {t("modal.changenow.warning")}
                </p>
                <div className="iframe-container">
                  <iframe 
                    id="changenow-widget"
                    src={changeNowUrl} 
                    title="ChangeNOW Widget"
                    allow="clipboard-read; clipboard-write"
                  ></iframe>
                </div>
              </div>
            )}

            <button className="btn btn-secondary" onClick={() => setShowGetEthModal(false)}>
              {t("modal.close")}
            </button>
          </div>
        </div>
      )}

      {/* Modal de Vitória */}
      {showWinnerModal && (
        <div className="modal-overlay">
          <div className="modal-content text-center">
            <div className="winner-animation">
              <span className="winner-cup">🏆</span>
              <h2>{t("winner.modal.title")}</h2>
              <p>{t("winner.modal.desc", { prize: winnerPrize })}</p>
              <div className="winner-prize-amount">{winnerPrize} ETH</div>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setShowWinnerModal(false);
                  loadContractData();
                }}
              >
                {t("winner.modal.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
