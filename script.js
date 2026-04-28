const MIN_MINUTOS_ABSOLUTO = 4;
const MAX_MINUTOS_ABSOLUTO = 60;

const telaInicial = document.getElementById('telaInicial');
const painelPrincipal = document.getElementById('painelPrincipal');
const formConfig = document.getElementById('formConfig');
const tempoMedioInput = document.getElementById('tempoMedio');
const faixaPreview = document.getElementById('faixaPreview');
const erroConfig = document.getElementById('erroConfig');
const configResumo = document.getElementById('configResumo');
const intervaloMinimoInput = document.getElementById('intervaloMinimo');
const intervaloMaximoInput = document.getElementById('intervaloMaximo');
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
let faixaPersonalizada = null;

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

  const minimoDigitado = intervaloMinimoInput.value.trim();
  const maximoDigitado = intervaloMaximoInput.value.trim();
  if (minimoDigitado && maximoDigitado) {
    const minimo = Math.floor(Number(minimoDigitado));
    const maximo = Math.floor(Number(maximoDigitado));
    if (Number.isFinite(minimo) && Number.isFinite(maximo) && minimo <= maximo) {
      faixaPreview.textContent = `Faixa estimada: ${minimo} a ${maximo} minutos (intervalo personalizado).`;
      return;
    }
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
  const { minimo, maximo } = obterFaixaAtiva();
  const minutos = Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
  return minutos * 60 * 1000;
}

function obterFaixaAtiva() {
  if (faixaPersonalizada) {
    return faixaPersonalizada;
  }

  return obterFaixaSorteio();
}

function mostrarErroIntervalos(mensagem) {
  erroIntervalos.textContent = mensagem;
  erroIntervalos.classList.remove('hidden');
}

function limparErroIntervalos() {
  erroIntervalos.textContent = '';
  erroIntervalos.classList.add('hidden');
}

function atualizarResumoConfig() {
  if (!tempoMedioMinutos) {
    return;
  }

  const { minimo, maximo } = obterFaixaAtiva();
  const modoFaixa = faixaPersonalizada
    ? `intervalo personalizado de ${minimo} a ${maximo} min`
    : `ciclos aleatórios entre ${minimo} e ${maximo} min`;
  configResumo.textContent = `Tempo médio configurado: ${tempoMedioMinutos} min (${modoFaixa}).`;
}

function lerFaixaPersonalizada() {
  const minimoDigitado = intervaloMinimoInput.value.trim();
  const maximoDigitado = intervaloMaximoInput.value.trim();

  if (!minimoDigitado && !maximoDigitado) {
    return null;
  }

  if (!minimoDigitado || !maximoDigitado) {
    mostrarErroIntervalos('Preencha mínimo e máximo para usar intervalo personalizado.');
    return null;
  }

  const minimo = Math.floor(Number(minimoDigitado));
  const maximo = Math.floor(Number(maximoDigitado));

  if (!Number.isFinite(minimo) || !Number.isFinite(maximo)) {
    mostrarErroIntervalos('O intervalo personalizado precisa conter apenas números válidos.');
    return null;
  }

  if (minimo < MIN_MINUTOS_ABSOLUTO || maximo > MAX_MINUTOS_ABSOLUTO) {
    mostrarErroIntervalos(
      `O intervalo personalizado precisa ficar entre ${MIN_MINUTOS_ABSOLUTO} e ${MAX_MINUTOS_ABSOLUTO} minutos.`,
    );
    return null;
  }

  if (minimo > maximo) {
    mostrarErroIntervalos('O intervalo mínimo não pode ser maior que o máximo.');
    return null;
  }

  limparErroIntervalos();
  return { minimo, maximo };
}

function limparTimer() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
}

function limparContagem() {
  if (countdownId) {
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

function iniciarCicloOculto() {
  if (!ativo || emDesafio) {
    return;
  }

  limparTimer();
  limparContagem();

  atualizarStatusPrincipal('Ativo', 'status-on');
  subStatus.textContent = 'Próximo estímulo: surpresa.';
  alertaDesafio.classList.add('hidden');
  btnPararContinuar.disabled = true;

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
  btnPararContinuar.disabled = false;

  try {
    alarme.currentTime = 0;
    await alarme.play();
  } catch (erro) {
    subStatus.textContent = 'Desafio! Não foi possível tocar o alarme automaticamente.';
    console.warn('Falha ao tocar alarme:', erro);
  }
}

function ativar() {
  if (!tempoMedioMinutos || (ativo && !emDesafio)) {
    return;
  }

  ativo = true;
  emDesafio = false;
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
  btnPararContinuar.disabled = true;
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

  if (!Number.isFinite(valor) || valor < MIN_MINUTOS_ABSOLUTO) {
    erroConfig.textContent = `O tempo médio precisa ser de pelo menos ${MIN_MINUTOS_ABSOLUTO} minutos.`;
    erroConfig.classList.remove('hidden');
    return;
  }

  tempoMedioMinutos = Math.floor(valor);
  const faixaLida = lerFaixaPersonalizada();
  if (intervaloMinimoInput.value.trim() || intervaloMaximoInput.value.trim()) {
    if (!faixaLida) {
      return;
    }
  }

  faixaPersonalizada = faixaLida;

  atualizarResumoConfig();
  erroConfig.classList.add('hidden');

  telaInicial.classList.add('hidden');
  painelPrincipal.classList.remove('hidden');

  desativar();
}

formConfig.addEventListener('submit', configurarTempoMedio);
tempoMedioInput.addEventListener('input', atualizarPreviewFaixa);
intervaloMinimoInput.addEventListener('input', atualizarPreviewFaixa);
intervaloMaximoInput.addEventListener('input', atualizarPreviewFaixa);
btnAtivar.addEventListener('click', ativar);
btnPararContinuar.addEventListener('click', pararMusicaEContinuar);
btnDesativar.addEventListener('click', desativar);
btnReconfigurar.addEventListener('click', voltarParaConfiguracao);

atualizarPreviewFaixa();

window.addEventListener('beforeunload', () => {
  limparTimer();
  limparContagem();
  alarme.pause();
});
