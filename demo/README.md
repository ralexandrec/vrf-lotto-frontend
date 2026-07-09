# Pipeline de Geração da Demo Visual 🎥🎙️

Este diretório contém as ferramentas e os testes BDD automatizados para produzir e atualizar o vídeo de demonstração do **Lotchain DApp**. 

O pipeline gera uma locução em áudio sintético baseada em um roteiro pré-definido, grava a navegação do usuário na interface (simulando interações e transações Web3 com um cursor visual dourado e blockchain mockada) e junta tudo em um arquivo de vídeo final compatível com macOS/QuickTime.

---

## 📁 Estrutura de Arquivos

*   **[ROTEIRO_AUDIO.md](file:///Users/renatoalexandredacunha/Projetos/ContratoApostasNovoFrontend/demo/ROTEIRO_AUDIO.md):** Contém os textos segmentados por parágrafo que serão sintetizados para a locução.
*   **[generate_tts.cjs](file:///Users/renatoalexandredacunha/Projetos/ContratoApostasNovoFrontend/demo/generate_tts.cjs):** Script Node.js que lê o roteiro e chama a API do Google TTS para gerar a narração em áudio, gravando as durações individuais de cada fala em `audio_durations.json` para sincronização perfeita do vídeo.
*   **[demo_recording.feature](file:///Users/renatoalexandredacunha/Projetos/ContratoApostasNovoFrontend/demo/demo_recording.feature):** O cenário BDD do Cucumber que define a sequência exata de interações de tela (mudança de idioma, conexão de carteira, modal de faucet, compra de bilhete, sorteio do vencedor).
*   **[demo.steps.cjs](file:///Users/renatoalexandredacunha/Projetos/ContratoApostasNovoFrontend/demo/demo.steps.cjs):** Implementação dos passos BDD no Playwright. Configura o tamanho do canvas do vídeo (1280x720), injeta o cursor virtual dourado e manipula a velocidade de cliques e flutuações do mouse baseado nos tempos calculados da fala correspondente.
*   **[merge_video.cjs](file:///Users/renatoalexandredacunha/Projetos/ContratoApostasNovoFrontend/demo/merge_video.cjs):** Script que mescla a gravação de vídeo bruta (`demo_raw.webm`) e o áudio da narração (`narration.mp3`) utilizando o FFmpeg estático. Limpa metadados residuais de rotação para evitar deitamentos de tela no macOS.
*   **`videos/`:** Diretório (ignorado pelo Git) onde as saídas do pipeline são geradas.

---

## 🚀 Como Executar o Pipeline Completo

O pipeline é executado em passos simples usando scripts automatizados configurados no `package.json`:

### 1. Iniciar o servidor local
A gravação precisa interagir com a interface. Certifique-se de que o DApp está rodando em segundo plano:
```bash
npm run dev
```

### 2. Gerar a Narração de Áudio (Opcional)
Se você alterou o roteiro [ROTEIRO_AUDIO.md](file:///Users/renatoalexandredacunha/Projetos/ContratoApostasNovoFrontend/demo/ROTEIRO_AUDIO.md), atualize os arquivos de áudio de locução e seus metadados de tempo:
```bash
# Define a chave de API do Google Cloud necessária antes de rodar
export GOOGLE_API_KEY="sua-chave-aqui"
node demo/generate_tts.cjs
```
*(Nota: O repositório já possui uma versão pré-compilada de `narration.mp3` e `audio_durations.json` na pasta de vídeos, portanto, se você não alterou o roteiro, pode pular este passo).*

### 3. Gravar e Compilar o Vídeo Demo
Rode o comando unificado que executará o Cucumber da gravação de tela e fará a mesclagem final do FFmpeg em sequência:
```bash
npm run demo
```

Ao final do processo, o arquivo final perfeitamente sincronizado estará pronto em:
👉 **`demo/videos/demo_final.mp4`**

---

## 🛠️ Tecnologias e Configurações de Mídia

- **Playwright Video Capture:** Grava em codec **VP8 (WebM)** na resolução nativa **1280x720** a **25 FPS**.
- **Virtual Cursor:** Injeta um elemento DOM dourado com bordas pretas de alta visibilidade e sombra brilhante, mudando de cor para vermelho durante os cliques e flutuando suavemente pela tela.
- **Auto-Block Miner:** O provedor Web3 mockado executa uma mineração automática de blocos em background (intervalo de 1.5s) que resolve as transações de aposta e sorteio em exatos 3 segundos na tela.
- **FFmpeg Encoding:** O script de mesclagem converte a gravação bruta VP8 para **H.264 (MP4)** com codec de áudio **AAC** (24kHz Mono, 192k bitrate) e redefine a rotação de metadados para zero (`-metadata:s:v rotate=0`) para compatibilidade universal em players nativos do macOS.
