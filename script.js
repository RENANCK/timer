const helloBtn = document.getElementById('helloBtn');
const message = document.getElementById('message');

helloBtn.addEventListener('click', () => {
  message.textContent = 'Olá! Seu repositório básico está funcionando.';
});
