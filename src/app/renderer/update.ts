// Import custom CSS to load bootstrap and override variables
import './styles/main.scss';

const progressBar = document.getElementById('progress-bar');

function setProgress(progress: number) {
  progressBar.style.width = `${progress}%`;
  progressBar.ariaValueNow = progress.toString();
}

setTimeout(() => {
  setProgress(20);
}, 5000);
