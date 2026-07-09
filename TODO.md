# Lotchain - TODO List

Esta lista reúne melhorias futuras de infraestrutura, testes e interface planejadas para o frontend do Lotchain.

---

## 🚀 Infraestrutura & CI/CD
- [ ] **CI/CD Seguro no GitHub Actions:** 
  Integrar a execução automatizada de testes do Cucumber (`npx cucumber-js`) no workflow de deploy do GitHub Pages (`.github/workflows/deploy.yml`).
  * *Otimização:* Rodar a instalação exclusiva do navegador Chromium (`npx playwright install chromium --with-deps`) para acelerar a inicialização do runner no GitHub Actions (mantendo o deploy abaixo de 1m30s).
  * *Segurança:* Impedir que builds quebrados ou com erros de testes sejam implantados em produção.

---

## 🧪 Testes Automatizados
- [ ] **Testar transações EVM mockadas no E2E:** 
  Expandir os testes Cucumber para cobrir o fluxo de compra de bilhetes mockado, simulando o comportamento de transações bem-sucedidas e rejeitadas.

---

## 🎨 Interface & UX
- [ ] **Integração de Múltiplos Bilhetes:**
  Habilitar na interface a opção de comprar múltiplos bilhetes em uma única transação, conforme suportado nas atualizações do Smart Contract.
