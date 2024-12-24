// Init file for the updater window

// Import custom CSS to load bootstrap and override variables
import './styles/main.scss';

const progressBar = document.getElementById('progress-bar') as HTMLDivElement;
const updateText = document.getElementById('update-text') as HTMLParagraphElement;
const updateTitle = document.getElementById('update-title') as HTMLParagraphElement;
const restartBtn = document.getElementById('restart') as HTMLButtonElement;

function setProgress(progress: number): void {
  progressBar.style.width = `${progress}%`;
  progressBar.ariaValueNow = progress.toString();
}

function setText(elem: Element, message: string): void {
  elem.textContent = message;
}

window.update.addDownloadProgressListener((_, percent) => {
  setProgress(percent);
});

window.update.addUpdateTitleListener((_, text) => {
  setText(updateTitle, text);
});

window.update.addUpdateTextListener((_, text, finished) => {
  setText(updateText, text);
  if (finished) {
    restartBtn.classList.remove('hide');
  }
});

restartBtn.addEventListener('click', () => {
  window.update.restartAndUpdate();
});
