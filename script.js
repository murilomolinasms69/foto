const video = document.querySelector('#webcam');
const canvas = document.querySelector('#tela');
const contexto = canvas.getContext('2d');
const botaoLigar = document.querySelector('#ligar');
const botaoCapturar = document.querySelector('#capturar');
const botaoDesligar = document.querySelector('#desligar');
const feedback = document.querySelector('#feedback');
const modo = document.querySelector('#modo');
const filtro = document.querySelector('#filtro');
const adesivos = document.querySelectorAll('.adesivo');
const botaoBaixar = document.querySelector('#baixar');
const videoGravado = document.querySelector('#gravado');
const downloadVideo = document.querySelector('#downloadVideo');

let stream;
let mediaRecorder;
let chunks = [];
let urlVideo;

// Ligar câmera
botaoLigar.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: modo.value === 'video' });
    video.srcObject = stream;
    await video.play();
    feedback.textContent = 'Câmera ligada.';
  } catch (erro) {
    feedback.textContent = 'Erro ao acessar a câmera.';
  }
});

// Capturar foto ou iniciar/parar vídeo
botaoCapturar.addEventListener('click', () => {
  if (modo.value === 'foto') {
    // Tirar foto
    contexto.save();
    contexto.drawImage(video, 0, 0, canvas.width, canvas.height);
    contexto.restore();
    aplicarFiltroCanvas();
    feedback.textContent = 'Foto capturada.';
  } else {
    // Modo vídeo
    if (!mediaRecorder) {
      chunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        urlVideo = URL.createObjectURL(blob);
        videoGravado.src = urlVideo;
        videoGravado.hidden = false;
        downloadVideo.hidden = false;
      };
      mediaRecorder.start();
      feedback.textContent = 'Gravando vídeo...';
      botaoCapturar.textContent = 'Parar Gravação';
    } else {
      mediaRecorder.stop();
      feedback.textContent = 'Gravação finalizada.';
      botaoCapturar.textContent = 'Capturar';
      mediaRecorder = null;
    }
  }
});

// Desligar
botaoDesligar.addEventListener('click', () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  video.srcObject = null;
  contexto.clearRect(0, 0, canvas.width, canvas.height);
  videoGravado.hidden = true;
  downloadVideo.hidden = true;
  feedback.textContent = 'Câmera desligada.';
});

// Aplicar filtro visual
filtro.addEventListener('change', aplicarFiltroCanvas);

function aplicarFiltroCanvas() {
  canvas.classList.remove('preto-e-branco', 'sepia');
  if (filtro.value === 'preto-e-branco') {
    canvas.classList.add('preto-e-branco');
  } else if (filtro.value === 'sepia') {
    canvas.classList.add('sepia');
  }
}

// Adesivos (clicar para aplicar)
adesivos.forEach(img => {
  img.addEventListener('click', () => {
    // Adiciona o adesivo na posição aleatória no canvas
    contexto.drawImage(img, Math.random() * 400, Math.random() * 250, 80, 80);
    feedback.textContent = 'Adesivo adicionado!';
  });
});

// Baixar imagem capturada
botaoBaixar.addEventListener('click', () => {
  // Aplica os filtros e adesivos antes de fazer o download
  aplicarFiltroCanvas();

  // Criar link de download da imagem com filtro e adesivo
  const link = document.createElement('a');
  link.download = 'foto_estudio.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Baixar vídeo gravado
downloadVideo.addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = urlVideo;
  a.download = 'video_estudio.webm';
  a.click();
});
