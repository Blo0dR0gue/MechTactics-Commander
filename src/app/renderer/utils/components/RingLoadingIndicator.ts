class RingLoadingIndicator {
  private loader: HTMLDivElement;

  constructor(
    private parentElement: HTMLElement,
    private style: 'lds-ring-light' | 'lds-ring-dark' = 'lds-ring-light'
  ) {
    this.loader = this.createLoader();
  }

  createLoader(): HTMLDivElement {
    const holder = document.createElement('div');
    holder.className = 'position-absolute top-50 start-50 translate-middle';

    const loader = document.createElement('div');
    loader.classList.add('lds-ring');
    loader.classList.add(this.style);
    for (let i = 0; i < 4; i++) {
      const div = document.createElement('div');
      loader.appendChild(div);
    }
    holder.appendChild(loader);
    return holder;
  }

  show() {
    if (!this.loader.parentNode) this.parentElement.appendChild(this.loader);
  }

  hide() {
    if (this.loader.parentNode === this.parentElement) {
      this.parentElement.removeChild(this.loader);
    }
  }
}

export { RingLoadingIndicator };
