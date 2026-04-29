const MIN_MINUTOS_ABSOLUTO = 5;
const MAX_MINUTOS_ABSOLUTO = 30;

const telaInicial = document.getElementById('telaInicial');
const painelPrincipal = document.getElementById('painelPrincipal');
const formConfig = document.getElementById('formConfig');
const tempoMedioInput = document.getElementById('tempoMedio');
const faixaPreview = document.getElementById('faixaPreview');
const erroConfig = document.getElementById('erroConfig');
const configResumo = document.getElementById('configResumo');
const tempoMedioManualInput = document.getElementById('tempoMedioManual');
const btnAplicarTempoManual = document.getElementById('btnAplicarTempoManual');
const erroTempoManual = document.getElementById('erroTempoManual');
const intervaloNovoInput = document.getElementById('intervaloNovo');
const btnAdicionarIntervalo = document.getElementById('btnAdicionarIntervalo');
const listaIntervalos = document.getElementById('listaIntervalos');
const erroIntervalos = document.getElementById('erroIntervalos');

const statusPrincipal = document.getElementById('statusPrincipal');
const subStatus = document.getElementById('subStatus');
const alertaDesafio = document.getElementById('alertaDesafio');

const btnAtivar = document.getElementById('btnAtivar');
const btnPararContinuar = document.getElementById('btnPararContinuar');
const btnDesativar = document.getElementById('btnDesativar');
const btnReconfigurar = document.getElementById('btnReconfigurar');

const alarme = document.getElementById('alarme');
alarme.loop = true;

let timerId = null;
let countdownId = null;
let ativo = false;
let emDesafio = false;
let tempoMedioMinutos = null;
let proximoDesafioEm = null;
let intervalosPersonalizados = [];

const CONTAGEM_FINAL_SEGUNDOS = 2 * 60;

function obterFaixaSorteio() {
  return calcularFaixaPorMedia(tempoMedioMinutos);
}

function calcularFaixaPorMedia(mediaMinutos) {
  const mediaNormalizada = Math.max(MIN_MINUTOS_ABSOLUTO, Math.floor(mediaMinutos));
  const maximoCalculado = Math.max(MIN_MINUTOS_ABSOLUTO, mediaNormalizada * 2 - MIN_MINUTOS_ABSOLUTO);
  return {
    minimo: MIN_MINUTOS_ABSOLUTO,
    maximo: Math.min(MAX_MINUTOS_ABSOLUTO, maximoCalculado),
  };
}

function atualizarPreviewFaixa() {
  if (!faixaPreview) {
    return;
  }

  const valor = Number(tempoMedioInput.value);
  if (!Number.isFinite(valor) || valor < MIN_MINUTOS_ABSOLUTO) {
    faixaPreview.textContent = `Faixa estimada: mínimo de ${MIN_MINUTOS_ABSOLUTO} minutos.`;
    return;
  }

  const { minimo, maximo } = calcularFaixaPorMedia(valor);
  faixaPreview.textContent = `Faixa estimada: ${minimo} a ${maximo} minutos.`;
}

function sortearDuracaoMs() {
  if (intervalosPersonalizados.length > 0) {
    const indiceSorteado = Math.floor(Math.random() * intervalosPersonalizados.length);
    const minutosPersonalizados = intervalosPersonalizados[indiceSorteado];
    return minutosPersonalizados * 60 * 1000;
  }

  const { minimo, maximo } = obterFaixaSorteio();
  const minutos = Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
  return minutos * 60 * 1000;
}

function normalizarValorMinutos(valor) {
  if (!Number.isFinite(valor)) {
    return null;
  }

  return Math.floor(valor);
}

function mostrarErroIntervalos(mensagem) {
  erroIntervalos.textContent = mensagem;
  erroIntervalos.classList.remove('hidden');
}

function limparErroIntervalos() {
  erroIntervalos.textContent = '';
  erroIntervalos.classList.add('hidden');
}

function mostrarErroTempoManual(mensagem) {
  erroTempoManual.textContent = mensagem;
  erroTempoManual.classList.remove('hidden');
}

function limparErroTempoManual() {
  erroTempoManual.textContent = '';
  erroTempoManual.classList.add('hidden');
}

function criarItemIntervalo(minutos) {
  const item = document.createElement('li');
  item.className = 'intervalo-item';

  const texto = document.createElement('span');
  texto.textContent = `${minutos} min`;

  const botaoRemover = document.createElement('button');
  botaoRemover.type = 'button';
  botaoRemover.className = 'btn intervalo-remover';
  botaoRemover.textContent = 'Remover';
  botaoRemover.addEventListener('click', () => {
    const indice = intervalosPersonalizados.indexOf(minutos);
    if (indice !== -1) {
      intervalosPersonalizados.splice(indice, 1);
    }
    atualizarListaIntervalos();
    atualizarResumoConfig();
  });

  item.append(texto, botaoRemover);
  return item;
}

function atualizarListaIntervalos() {
  listaIntervalos.innerHTML = '';

  if (intervalosPersonalizados.length === 0) {
    listaIntervalos.classList.add('hidden');
    return;
  }

  const fragmento = document.createDocumentFragment();
  intervalosPersonalizados.forEach((minutos) => {
    fragmento.appendChild(criarItemIntervalo(minutos));
  });

  listaIntervalos.appendChild(fragmento);
  listaIntervalos.classList.remove('hidden');
}

function atualizarResumoConfig() {
  if (!tempoMedioMinutos) {
    return;
  }

  const { minimo, maximo } = obterFaixaSorteio();

  if (intervalosPersonalizados.length > 0) {
    configResumo.textContent = `Tempo médio configurado: ${tempoMedioMinutos} min (intervalos fixos: ${intervalosPersonalizados.join(', ')} min).`;
    return;
  }

  configResumo.textContent = `Tempo médio configurado: ${tempoMedioMinutos} min (ciclos aleatórios entre ${minimo} e ${maximo} min).`;
}

function adicionarIntervalo() {
  const valor = Number(intervaloNovoInput.value);
  const valorNormalizado = normalizarValorMinutos(valor);

  if (valorNormalizado === null) {
    mostrarErroIntervalos('Informe um intervalo válido em minutos.');
    return;
  }

  if (valorNormalizado < MIN_MINUTOS_ABSOLUTO || valorNormalizado > MAX_MINUTOS_ABSOLUTO) {
    mostrarErroIntervalos(
      `O intervalo precisa estar entre ${MIN_MINUTOS_ABSOLUTO} e ${MAX_MINUTOS_ABSOLUTO} minutos.`,
    );
    return;
  }

  if (intervalosPersonalizados.includes(valorNormalizado)) {
    mostrarErroIntervalos('Esse intervalo já foi adicionado.');
    return;
  }

  intervalosPersonalizados.push(valorNormalizado);
  intervalosPersonalizados.sort((a, b) => a - b);
  intervaloNovoInput.value = '';
  limparErroIntervalos();
  atualizarListaIntervalos();
  atualizarResumoConfig();
}

function limparTimer() {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
}

function limparContagem() {
  if (countdownId !== null) {
    clearInterval(countdownId);
    countdownId = null;
  }

  proximoDesafioEm = null;
}

function formatarSegundosEmMinutos(segundosTotais) {
  const minutos = Math.floor(segundosTotais / 60)
    .toString()
    .padStart(2, '0');
  const segundos = Math.floor(segundosTotais % 60)
    .toString()
    .padStart(2, '0');

  return `${minutos}:${segundos}`;
}

function atualizarContagemRegressivaFinal() {
  if (!ativo || emDesafio || !proximoDesafioEm) {
    return;
  }

  const restanteMs = proximoDesafioEm - Date.now();
  const restanteSegundos = Math.ceil(restanteMs / 1000);

  if (restanteSegundos <= 0) {
    limparContagem();
    return;
  }

  if (restanteSegundos <= CONTAGEM_FINAL_SEGUNDOS) {
    subStatus.textContent = `Faltam ${formatarSegundosEmMinutos(restanteSegundos)} para o próximo estímulo.`;
    return;
  }

  subStatus.textContent = 'Próximo estímulo: surpresa.';
}

function atualizarStatusPrincipal(texto, classe) {
  statusPrincipal.textContent = texto;
  statusPrincipal.classList.remove('status-off', 'status-on', 'status-challenge');
  statusPrincipal.classList.add(classe);
}

function atualizarEstadoBotoes() {
  btnAtivar.disabled = ativo;
  btnPararContinuar.disabled = !(ativo && emDesafio);
}

function iniciarCicloOculto() {
  if (!ativo || emDesafio) {
    return;
  }

  limparTimer();
  limparContagem();

  atualizarStatusPrincipal('Ativo', 'status-on');
  subStatus.textContent = 'Próximo estímulo: surpresa.';
  alertaDesafio.classList.add('hidden');
  atualizarEstadoBotoes();

  const duracaoMs = sortearDuracaoMs();
  proximoDesafioEm = Date.now() + duracaoMs;
  timerId = setTimeout(dispararDesafio, duracaoMs);
  atualizarContagemRegressivaFinal();
  countdownId = setInterval(atualizarContagemRegressivaFinal, 1000);
}

async function dispararDesafio() {
  if (!ativo) {
    return;
  }

  emDesafio = true;
  limparContagem();
  atualizarStatusPrincipal('Desafio!', 'status-challenge');
  subStatus.textContent = 'Abra o outro app e faça o ciclo.';
  alertaDesafio.classList.remove('hidden');
  atualizarEstadoBotoes();

  try {
    alarme.currentTime = 0;
    await alarme.play();
  } catch (erro) {
    subStatus.textContent = 'Desafio! Não foi possível tocar o alarme automaticamente.';
    console.warn('Falha ao tocar alarme:', erro);
  }
}

function ativar() {
  if (!tempoMedioMinutos || ativo) {
    return;
  }

  ativo = true;
  emDesafio = false;
  atualizarEstadoBotoes();
  iniciarCicloOculto();
}

function pararMusicaEContinuar() {
  if (!ativo || !emDesafio) {
    return;
  }

  alarme.pause();
  alarme.currentTime = 0;
  emDesafio = false;
  iniciarCicloOculto();
}

function desativar() {
  ativo = false;
  emDesafio = false;

  limparTimer();
  limparContagem();

  alarme.pause();
  alarme.currentTime = 0;

  atualizarStatusPrincipal('Desligado', 'status-off');
  subStatus.textContent = 'Cronômetro desligado.';
  alertaDesafio.classList.add('hidden');
  atualizarEstadoBotoes();
}

function voltarParaConfiguracao() {
  desativar();

  if (tempoMedioMinutos) {
    tempoMedioInput.value = tempoMedioMinutos;
  }

  atualizarPreviewFaixa();
  erroConfig.classList.add('hidden');
  limparErroIntervalos();
  painelPrincipal.classList.add('hidden');
  telaInicial.classList.remove('hidden');
}

function configurarTempoMedio(evento) {
  evento.preventDefault();

  const valor = Number(tempoMedioInput.value);

  if (!Number.isFinite(valor) || valor < MIN_MINUTOS_ABSOLUTO || valor > MAX_MINUTOS_ABSOLUTO) {
    erroConfig.textContent = `O tempo médio precisa estar entre ${MIN_MINUTOS_ABSOLUTO} e ${MAX_MINUTOS_ABSOLUTO} minutos.`;
    erroConfig.classList.remove('hidden');
    return;
  }

  tempoMedioMinutos = Math.floor(valor);
  tempoMedioManualInput.value = tempoMedioMinutos;
  atualizarResumoConfig();
  erroConfig.classList.add('hidden');

  telaInicial.classList.add('hidden');
  painelPrincipal.classList.remove('hidden');

  desativar();
}

function aplicarTempoManual() {
  const valor = Number(tempoMedioManualInput.value);

  if (!Number.isFinite(valor) || valor < MIN_MINUTOS_ABSOLUTO || valor > MAX_MINUTOS_ABSOLUTO) {
    mostrarErroTempoManual(
      `Informe um tempo médio entre ${MIN_MINUTOS_ABSOLUTO} e ${MAX_MINUTOS_ABSOLUTO} minutos.`,
    );
    return;
  }

  tempoMedioMinutos = Math.floor(valor);
  tempoMedioInput.value = tempoMedioMinutos;
  limparErroTempoManual();
  atualizarResumoConfig();

  if (ativo && !emDesafio) {
    iniciarCicloOculto();
  }
}

formConfig.addEventListener('submit', configurarTempoMedio);
tempoMedioInput.addEventListener('input', atualizarPreviewFaixa);
btnAdicionarIntervalo.addEventListener('click', adicionarIntervalo);
intervaloNovoInput.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Enter') {
    return;
  }

  evento.preventDefault();
  adicionarIntervalo();
});
btnAtivar.addEventListener('click', ativar);
btnPararContinuar.addEventListener('click', pararMusicaEContinuar);
btnDesativar.addEventListener('click', desativar);
btnReconfigurar.addEventListener('click', voltarParaConfiguracao);
btnAplicarTempoManual.addEventListener('click', aplicarTempoManual);
tempoMedioManualInput.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Enter') {
    return;
  }

  evento.preventDefault();
  aplicarTempoManual();
});

atualizarPreviewFaixa();
atualizarEstadoBotoes();

window.addEventListener('beforeunload', () => {
  limparTimer();
  limparContagem();
  alarme.pause();
});
