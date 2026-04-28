const MIN_MINUTOS = 10;
const MAX_MINUTOS = 45;

const statusPrincipal = document.getElementById('statusPrincipal');
const subStatus = document.getElementById('subStatus');
const alertaDesafio = document.getElementById('alertaDesafio');

const btnAtivar = document.getElementById('btnAtivar');
const btnPararContinuar = document.getElementById('btnPararContinuar');
const btnDesativar = document.getElementById('btnDesativar');

const alarme = document.getElementById('alarme');
alarme.loop = true;

let timerId = null;
let ativo = false;
let emDesafio = false;

function sortearDuracaoMs() {
  const minutos = Math.floor(Math.random() * (MAX_MINUTOS - MIN_MINUTOS + 1)) + MIN_MINUTOS;
  return minutos * 60 * 1000;
}

function limparTimer() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
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

  atualizarStatusPrincipal('Ativo', 'status-on');
  subStatus.textContent = 'Próximo estímulo: surpresa.';
  alertaDesafio.classList.add('hidden');
  btnPararContinuar.disabled = true;

  const duracaoMs = sortearDuracaoMs();
  timerId = setTimeout(dispararDesafio, duracaoMs);
}

async function dispararDesafio() {
  if (!ativo) {
    return;
  }

  emDesafio = true;
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
  if (ativo && !emDesafio) {
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

  alarme.pause();
  alarme.currentTime = 0;

  atualizarStatusPrincipal('Desligado', 'status-off');
  subStatus.textContent = 'Cronômetro desligado.';
  alertaDesafio.classList.add('hidden');
  btnPararContinuar.disabled = true;
}

btnAtivar.addEventListener('click', ativar);
btnPararContinuar.addEventListener('click', pararMusicaEContinuar);
btnDesativar.addEventListener('click', desativar);

window.addEventListener('beforeunload', () => {
  limparTimer();
  alarme.pause();
});
