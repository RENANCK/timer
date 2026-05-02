# TIMER

Aplicativo estático em HTML/CSS/JS com cronômetro oculto para estímulos aleatórios.

## Funcionalidades

- Tela inicial para definir o **tempo médio** antes de começar.
- Campo opcional para adicionar **intervalos personalizados** fixos (em minutos).
- Validação do tempo médio com limites de **5 a 30 minutos**.
- Ciclos aleatórios ocultos calculados a partir do tempo médio.
- Quando há intervalos personalizados, o sorteio usa apenas os intervalos cadastrados.
- Exibição apenas de mensagens de status (sem revelar o tempo sorteado do ciclo atual).
- Alarme em loop ao final do ciclo usando `assets/alarme.m4a`.
- Botão **Parar música e continuar** para iniciar novo ciclo oculto.
- Botão **Desativar** para interromper timer, alarme e voltar ao estado inicial.

## Arquivos

- `index.html`
- `style.css`
- `script.js`
- `assets/alarme.m4a` (adicione manualmente este arquivo local)

## Como usar

1. Coloque seu áudio de alarme em `assets/alarme.m4a`.
2. Abra `index.html` no navegador.
3. Na tela inicial, informe o **tempo médio** (de 5 a 30).
4. Clique em **Começar** e depois em **Ativar** para iniciar.
