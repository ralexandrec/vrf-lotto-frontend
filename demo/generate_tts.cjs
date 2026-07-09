const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const API_KEY = "sk_17fa2ce9ad9210f67256b419aa189c5af5ab4f54721c5824";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel
const OUTPUT_DIR = path.join(__dirname, 'videos');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'narration.mp3');

const phrases = [
  /* 0 */ "Olá! Seja bem-vindo à demonstração do Lotchain, a plataforma descentralizada de loteria na Base Sepolia.",
  /* 1 */ "A plataforma conta com detecção e suporte a múltiplos idiomas. Ao mudar para inglês, todo o DApp se adapta.",
  /* 2 */ "E retornando para o português, as traduções são atualizadas em tempo real para uma experiência nativa.",
  /* 3 */ "Vamos conectar a carteira do usuário. A conexão é rápida, segura e carrega os dados diretamente da blockchain.",
  /* 4 */ "Se o usuário precisar de fundos de teste, o modal Adquirir ETH oferece acesso rápido a faucets seguras.",
  /* 5 */ "Ao fechar o modal, o usuário retorna imediatamente para a tela principal sem interrupções.",
  /* 6 */ "Agora, para participar, vamos obter saldo fictício da faucet. Ao recarregar, o saldo do usuário é atualizado.",
  /* 7 */ "Navegando pelos logs, a aba Geral do Contrato exibe o histórico de sorteios e bilhetes comprados na rede.",
  /* 8 */ "Usando o Assistente de Apostas, o usuário vê o passo a passo claro para comprar o seu bilhete de forma simples.",
  /* 9 */ "Ao clicar em Comprar Bilhete, enviamos a transação segura para assinatura via MetaMask.",
  /* 10 */ "O painel de atividades é atualizado instantaneamente, registrando a compra e mostrando os novos saldos.",
  /* 11 */ "Como administrador, podemos iniciar o sorteio de um vencedor, acionando a Chainlink VRF.",
  /* 12 */ "O sorteio é realizado de forma 100% aleatória e auditável na blockchain. Obrigado por assistir!"
];

function getAudioDuration(filePath) {
  try {
    // ffmpeg sem arquivo de saída lança um erro, mas traz as infos no stderr
    execSync(`"${ffmpeg}" -i "${filePath}"`, { stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (error) {
    const output = error.stderr ? error.stderr.toString() : error.message;
    const match = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = parseInt(match[3], 10);
      const ms = parseInt(match[4], 10) * 10;
      return hours * 3600 + minutes * 60 + seconds + (ms / 1000);
    }
  }
  return 0;
}

async function generateWithGoogle() {
  console.log("Iniciando geração de áudio via Google Translate TTS (com arquivos individuais)...");
  
  const tempFiles = [];
  const durations = {};

  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i];
    const tempFile = path.join(OUTPUT_DIR, `phrase_${i}.mp3`);
    console.log(`Gerando áudio da frase ${i}...`);

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-br&client=tw-ob&q=${encodeURIComponent(phrase)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Google Translate no bloco ${i}: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(tempFile, Buffer.from(arrayBuffer));
    tempFiles.push(tempFile);

    // Obtém a duração usando o ffmpeg
    const duration = getAudioDuration(tempFile);
    durations[i] = duration;
    console.log(`Frase ${i} salva. Duração: ${duration}s`);

    if (i < phrases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Grava o arquivo de durações
  const durationsFile = path.join(OUTPUT_DIR, 'audio_durations.json');
  fs.writeFileSync(durationsFile, JSON.stringify(durations, null, 2));
  console.log(`Durações salvas em: ${durationsFile}`);

  // Cria a lista de arquivos para o ffmpeg concat
  const listFile = path.join(OUTPUT_DIR, 'concat_list.txt');
  const fileLines = tempFiles.map(file => `file '${path.basename(file)}'`).join('\n');
  fs.writeFileSync(listFile, fileLines);

  console.log("Concatenando áudios...");
  if (fs.existsSync(OUTPUT_FILE)) {
    fs.unlinkSync(OUTPUT_FILE);
  }

  const concatCmd = `"${ffmpeg}" -f concat -safe 0 -i "${listFile}" -c copy "${OUTPUT_FILE}"`;
  execSync(concatCmd, { stdio: 'inherit' });

  // Limpa arquivos temporários
  fs.unlinkSync(listFile);
  for (const file of tempFiles) {
    fs.unlinkSync(file);
  }

  console.log("Processo concluído com sucesso!");
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Como o ElevenLabs no plano gratuito bloqueia vozes da biblioteca pela API, 
  // vamos usar diretamente a solução do Google Translate para manter consistência das vozes de cada frase
  // e permitir o mapeamento preciso de tempos.
  await generateWithGoogle();
}

main().catch(console.error);
