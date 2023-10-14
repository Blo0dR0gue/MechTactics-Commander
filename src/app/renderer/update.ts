// Import custom CSS to load bootstrap and override variables
import './styles/main.scss';

const progressBar = document.getElementById('progress-bar');
const updateText = document.getElementById('update-text');
const restartBtn = document.getElementById('restart') as HTMLButtonElement;

function setProgress(progress: number) {
  progressBar.style.width = `${progress}%`;
  progressBar.ariaValueNow = progress.toString();
}

function setText(message: string) {
  updateText.textContent = message;
}

window.app.addDownloadProgressListener((event, percent) => {
  setProgress(percent);
});

window.app.addUpdateTextListener((event, text, finished) => {
  setText(text);
  if (finished) {
    restartBtn.classList.remove('hide');
  }
});

restartBtn.addEventListener('click', () => {
  window.app.restartAndUpdate();
});
