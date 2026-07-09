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
    Then as abas de log "General (Contract)" e "My Activity" devem estar visíveis
    When eu clico na aba de log "My Activity"
    Then a aba "My Activity" deve estar ativa

  Scenario: Validar carregamento das atividades históricas reais do contrato
    Given que eu acesso a página inicial do Lotchain
    When eu clico no botão de conectar carteira
    Then a aba "My Activity" deve estar ativa
    When eu clico na aba de log "General (Contract)"
    Then a aba "General (Contract)" deve estar ativa
    And as atividades históricas reais do contrato devem estar carregadas na tela

  Scenario: Validar detecção automática de idioma para Português
    Given que eu configuro o idioma do navegador para "pt-BR"
    And que eu acesso a página inicial do Lotchain
    Then o título dos logs "ATIVIDADES EM TEMPO REAL" deve ser visível na página

  Scenario: Validar layout responsivo do cabeçalho e do configurador de contrato no desktop
    Given que eu configuro a tela para "desktop"
    And que eu acesso a página inicial do Lotchain
    Then a logo e os controles do header devem estar na mesma linha
    And o input de contrato e o botão de carregar devem estar na mesma linha

  Scenario: Validar layout responsivo do cabeçalho e do configurador de contrato no celular
    Given que eu configuro a tela para "celular"
    And que eu acesso a página inicial do Lotchain
    Then a logo e os controles do header devem estar em linhas separadas
    And o input de contrato e o botão de carregar devem estar em linhas separadas

  Scenario: Conectar carteira no navegador interno do MetaMask (Mobile)
    Given que eu configuro a tela para "celular"
    And que eu acesso a página inicial do Lotchain
    When eu clico no botão de conectar carteira
    Then o painel do administrador deve estar visível na página

  Scenario: Redirecionar para o app do MetaMask a partir de navegador móvel externo (Mobile Deep Link)
    Given que eu configuro a tela para "celular"
    And que o navegador móvel não possui a extensão MetaMask
    And que eu acesso a página inicial do Lotchain
    Then eu devo ser redirecionado para o deep link do MetaMask
