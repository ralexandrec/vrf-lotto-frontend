Feature: Gravação de Vídeo de Demonstração do Lotchain

  @demo
  Scenario: Fluxo de Demonstração Completo das Funcionalidades do DApp
    Given que eu inicio a gravação de vídeo do DApp Lotchain
    And eu espero o tempo da fala 0
    When eu mudo o idioma para "en"
    And eu espero o tempo da fala 1
    And eu mudo o idioma para "pt"
    And eu espero o tempo da fala 2
    When eu conecto a carteira de forma suave
    And eu espero o tempo da fala 3
    When eu abro o modal de obter fundos
    And eu espero o tempo da fala 4
    When eu fecho o modal de obter fundos
    And eu espero o tempo da fala 5
    When eu recebo fundos simulados da faucet
    And eu espero o tempo da fala 6
    When eu clico na aba de log de forma suave "General (Contract)"
    And eu espero o tempo da fala 7
    When eu clico na aba de log de forma suave "My Activity"
    And eu espero 1 segundo
    And eu espero o tempo da fala 8
    When eu compro um bilhete pelo assistente
    And eu espero o tempo da fala 9
    And eu espero o tempo da fala 10
    When eu clico no botão de realizar sorteio
    And eu espero o tempo da fala 11
    And eu espero o tempo da fala 12
    Then a gravação de vídeo deve ser finalizada com sucesso
