import '../../styles/dialog.scss';
import { Button, IButton } from './Button';

interface DialogHeader {
  /**
   * The title text for this dialog
   */
  title: string;
  /**
   * Style classes for the title
   */
  classNames: string[];
}

interface DialogBody {
  /**
   * The content for this dialog
   */
  content: string;
}

interface DialogFooter {
  /**
   * The buttons in the footer
   */
  buttons: CallBackButton[];
}

interface CallBackButton extends IButton {
  /**
   * Invoked on click
   */
  onClick: () => void;
}

class Dialog {
  private dialogElement: HTMLDivElement;

  public constructor(private parentElement: HTMLElement) {
    this.dialogElement = document.createElement('div');
    this.dialogElement.classList.add('dialog');
  }

  private createDialog(
    dialogHeader: DialogHeader,
    dialogBody: DialogBody,
    dialogFooter: DialogFooter
  ) {
    const container = document.createElement('div');
    container.classList.add('dialog-content');

    this.createHeader(container, dialogHeader);
    this.createBody(container, dialogBody);
    this.createFooter(container, dialogFooter);

    this.dialogElement.appendChild(container);
  }

  private createHeader(container: HTMLDivElement, dialogHeader: DialogHeader) {
    const { title, classNames } = dialogHeader;
    const header = document.createElement('div');
    header.classList.add('dialog-header');

    const titleElement = document.createElement('div');
    titleElement.classList.add(...classNames);
    titleElement.textContent = title;

    header.appendChild(titleElement);
    container.appendChild(header);
  }

  private createBody(container: HTMLDivElement, dialogBody: DialogBody) {
    const { content } = dialogBody;

    const body = document.createElement('div');
    body.classList.add('dialog-body');
    body.textContent = content;

    container.appendChild(body);
  }

  private createFooter(container: HTMLDivElement, dialogFooter: DialogFooter) {
    const { buttons } = dialogFooter;
    const footer = document.createElement('div');
    footer.classList.add('dialog-footer');

    for (const button of buttons) {
      const { onClick } = button;
      const btn = new Button(footer, button).render();
      btn.getButtonElement().addEventListener('click', () => {
        onClick();
      });
    }

    container.appendChild(footer);
  }

  private closeListener = (event: Event) => {
    if (event.target === this.dialogElement) {
      this.hide();
    }
  };

  public show(
    dialogHeader: DialogHeader,
    dialogBody: DialogBody,
    dialogFooter: DialogFooter
  ): void {
    if (this.dialogElement.parentNode) {
      throw new Error('Dialog already visible');
    }
    this.createDialog(dialogHeader, dialogBody, dialogFooter);
    window.addEventListener('click', this.closeListener);
    // TODO: Check if it is better to use css (bigger dom?)
    this.parentElement.appendChild(this.dialogElement);
  }

  public hide(): void {
    if (this.dialogElement.parentNode === this.parentElement) {
      window.removeEventListener('click', this.closeListener);
      this.dialogElement.innerHTML = '';
      this.parentElement.removeChild(this.dialogElement);
    }
  }
}

export { Dialog };
