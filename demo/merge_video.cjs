const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const VIDEO_PATH = path.join(__dirname, 'videos', 'demo_raw.webm');
const AUDIO_PATH = path.join(__dirname, 'videos', 'narration.mp3');
const OUTPUT_PATH = path.join(__dirname, 'videos', 'demo_final.mp4');

function main() {
  console.log("Mesclando áudio e vídeo usando ffmpeg-static...");

  if (!fs.existsSync(VIDEO_PATH)) {
    console.error(`Erro: Vídeo não encontrado em ${VIDEO_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(AUDIO_PATH)) {
    console.error(`Erro: Áudio não encontrado em ${AUDIO_PATH}`);
    process.exit(1);
  }

  try {
    // Se o arquivo de saída já existe, remove para evitar prompts
    if (fs.existsSync(OUTPUT_PATH)) {
      fs.unlinkSync(OUTPUT_PATH);
    }

    // Comando ffmpeg para combinar vídeo e áudio
    // Ajusta o vídeo ou o áudio para terminarem juntos (o menor deles) usando -shortest
    const command = `"${ffmpeg}" -i "${VIDEO_PATH}" -i "${AUDIO_PATH}" -metadata:s:v rotate=0 -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -y "${OUTPUT_PATH}"`;
    
    console.log(`Executando: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
    console.log(`Vídeo final gerado com sucesso em: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error("Erro ao mesclar áudio e vídeo:", error);
    process.exit(1);
  }
}

main();
