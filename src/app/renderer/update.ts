// Init file for the updater window

// Import custom CSS to load bootstrap and override variables
import './styles/main.scss';

const progressBar = document.getElementById('progress-bar');
const updateText = document.getElementById('update-text');
const updateTitle = document.getElementById('update-title');
const restartBtn = document.getElementById('restart') as HTMLButtonElement;

function setProgress(progress: number) {
  progressBar.style.width = `${progress}%`;
  progressBar.ariaValueNow = progress.toString();
}

function setText(elem: Element, message: string) {
  elem.textContent = message;
}

window.app.addDownloadProgressListener((event, percent) => {
  setProgress(percent);
});

window.app.addUpdateTitleListener((event, text) => {
  setText(updateTitle, text);
});

window.app.addUpdateTextListener((event, text, finished) => {
  setText(updateText, text);
  if (finished) {
    restartBtn.classList.remove('hide');
  }
});

restartBtn.addEventListener('click', () => {
  window.app.restartAndUpdate();
});
