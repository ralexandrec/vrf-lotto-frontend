Feature: Interface do usuário do Lotchain

  Scenario: Acessar a página principal e validar i18n
    Given que eu acesso a página inicial do Lotchain
    Then o título "LOTCHAIN" deve ser visível na página
    And o botão de conexão de carteira deve estar visível

  Scenario: Validar carregamento do contrato de loteria
    Given que eu acesso a página inicial do Lotchain
    When eu digito "0x10ed17d3F4AAD4043f34b9A9AD024c743f2Db46F" no campo de contrato
    And clico no botão de carregar
    Then as informações do contrato devem ser exibidas na tela

  Scenario: Validar visualização do painel administrativo do proprietário
    Given que eu acesso a página inicial do Lotchain
    When eu clico no botão de conectar carteira
    Then o painel do administrador deve estar visível na página
    And o botão de sortear vencedor deve estar visível

  Scenario: Validar visualização e alternância das abas de log
    Given que eu acesso a página inicial do Lotchain
    Then as abas de log "Geral (Contrato)" e "Minhas Ações" devem estar visíveis
    When eu clico na aba de log "Minhas Ações"
    Then a aba "Minhas Ações" deve estar ativa

  Scenario: Validar carregamento das atividades históricas reais do contrato
    Given que eu acesso a página inicial do Lotchain
    When eu clico no botão de conectar carteira
    Then a aba "Geral (Contrato)" deve estar ativa
    And as atividades históricas reais do contrato devem estar carregadas na tela
