const fs = require('fs');
const path = require('path');

const API_KEY = "sk_17fa2ce9ad9210f67256b419aa189c5af5ab4f54721c5824";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel - Multilingual Voice
const OUTPUT_DIR = path.join(__dirname, 'videos');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'narration.mp3');

const phrases = [
  "Olá! Seja bem-vindo à demonstração do Lotchain, a plataforma descentralizada de loteria na Base Sepolia.",
  "A plataforma conta com detecção e suporte a múltiplos idiomas. Ao mudar para inglês, todo o DApp se adapta.",
  "E retornando para o português, as traduções são atualizadas em tempo real para uma experiência nativa.",
  "Vamos conectar a carteira do usuário. A conexão é rápida, segura e carrega os dados diretamente da blockchain.",
  "Navegando pelos logs, a aba Geral do Contrato exibe o histórico de sorteios e bilhetes comprados na rede.",
  "Usando o Assistente de Apostas, o usuário vê o passo a passo claro para comprar o seu bilhete.",
  "Ao clicar em Comprar Bilhete Agora, enviamos a transação segura para assinatura via MetaMask.",
  "O painel de atividades é atualizado instantaneamente, registrando a compra e mostrando os novos saldos.",
  "Se o usuário precisar de fundos de teste, o modal Adquirir ETH oferece acesso rápido a faucets seguras.",
  "Ao fechar o modal, o usuário retorna imediatamente para a tela principal sem interrupções.",
  "Como administrador, podemos iniciar o sorteio de um vencedor, acionando a Chainlink VRF.",
  "O sorteio é realizado de forma 100% aleatória e auditável na blockchain. Obrigado por assistir!"
];

const scriptText = phrases.join(" ... ");

async function generateTTSWithElevenLabs() {
  console.log("Tentando gerar áudio via ElevenLabs...");
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY,
      'accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text: scriptText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API do ElevenLabs: ${response.status} - ${errorText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(OUTPUT_FILE, buffer);
  console.log(`Áudio gerado com sucesso via ElevenLabs e salvo em: ${OUTPUT_FILE}`);
}

async function generateTTSWithGoogle() {
  console.log("Iniciando geração de áudio via Google Translate TTS (Fallback)...");
  
  const buffers = [];
  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i];
    console.log(`Gerando áudio para a frase ${i + 1}/${phrases.length}...`);
    
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-br&client=tw-ob&q=${encodeURIComponent(phrase)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Google Translate: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    buffers.push(Buffer.from(arrayBuffer));
    
    // Adiciona um pequeno silêncio (ou pequeno delay) se houver mais frases para evitar rate limit
    if (i < phrases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  const finalBuffer = Buffer.concat(buffers);
  fs.writeFileSync(OUTPUT_FILE, finalBuffer);
  console.log(`Áudio gerado com sucesso via Google Translate e salvo em: ${OUTPUT_FILE}`);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    await generateTTSWithElevenLabs();
  } catch (error) {
    console.warn("Falha ao gerar com ElevenLabs:", error.message);
    await generateTTSWithGoogle();
  }
}

main().catch(console.error);
