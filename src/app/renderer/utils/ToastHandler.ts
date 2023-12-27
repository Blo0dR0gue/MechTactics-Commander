import { Toast } from 'bootstrap';

class ToastHandler {
  private currentToasts: ToastItem[];
  private toastContainer: HTMLDivElement;

  public constructor(
    parentElement: HTMLElement,
    private maxElements = 6,
    yPos: 'top-0' | 'bottom-0' = 'top-0',
    xPos: 'end-0' | 'start-0' = 'end-0'
  ) {
    this.currentToasts = [];

    // create toast container and add it to the parent
    this.toastContainer = document.createElement('div');
    this.toastContainer.classList.add(
      ...['toast-container', 'p-3', 'text-white', 'mt-5', yPos, xPos]
    );
    parentElement.appendChild(this.toastContainer);
  }

  public createAndShowToast(
    title: string,
    text: string,
    type = ToastType.Default
  ) {
    if (this.currentToasts.length >= this.maxElements) {
      this.removeToastByIndex(0);
    }

    const toast = new ToastItem(title, text, 3000, type, () => {
      this.removeToast(toast);
    });
    this.toastContainer.appendChild(toast.getToastDOMElement());
    toast.showToast();
    this.currentToasts.push(toast);
  }

  private removeToast(toast: ToastItem) {
    const index = this.currentToasts.indexOf(toast);
    this.removeToastByIndex(index);
  }

  private removeToastByIndex(index: number) {
    if (index === -1) return;
    this.currentToasts[index].hideToast();
    this.currentToasts.splice(index, 1);
  }
}

enum ToastType {
  Default = 'bg-secondary',
  Danger = 'bg-danger',
  Warning = 'bg-warning',
  Info = 'bg-info',
}

/**
 * Represents one toast item
 */
class ToastItem {
  private domElement: HTMLElement;
  private toast: Toast;

  /**
   * Creates a new toast item
   * @param title The title of the toast
   * @param text The message of the toast
   */
  public constructor(
    title: string,
    text: string,
    displayTime: number,
    type = ToastType.Default,
    onClose?: () => void
  ) {
    // Create toast dom element
    const toastElem = document.createElement('div');
    toastElem.classList.add('toast');
    toastElem.role = 'alert';
    toastElem.ariaLive = 'assertive';
    toastElem.ariaAtomic = 'true';

    // Create toast header
    const toastHeader = document.createElement('div');
    toastHeader.classList.add('toast-header');
    toastHeader.classList.add('text-white');
    toastHeader.classList.add('bg-secondary');

    const toastTitle = document.createElement('strong');
    toastTitle.classList.add('me-auto');
    toastTitle.textContent = title;

    const toastCloseBtn = document.createElement('button');
    toastCloseBtn.type = 'button';
    toastCloseBtn.classList.add('btn-close');
    toastCloseBtn.classList.add('btn-close-white');
    toastCloseBtn.dataset.bsDismiss = 'toast';
    toastCloseBtn.ariaLabel = 'Close';

    toastHeader.appendChild(toastTitle);
    toastHeader.appendChild(toastCloseBtn);

    // Create toast body
    const toastBody = document.createElement('div');
    toastBody.classList.add('toast-body');
    if (type.length > 0) toastBody.classList.add(type);
    toastBody.innerHTML = text;

    // Add header and body to toast element
    toastElem.appendChild(toastHeader);
    toastElem.appendChild(toastBody);

    this.domElement = toastElem;

    // Create toast object
    this.toast = new Toast(this.domElement, {
      autohide: true,
      delay: displayTime,
      animation: true,
    });

    // Auto delete element from dom
    this.domElement.addEventListener('hidden.bs.toast', () => {
      this.domElement.remove();
      onClose();
    });
  }

  /**
   * Display the toast
   */
  public showToast() {
    this.toast.show();
  }

  /**
   * Hides the toast
   */
  public hideToast() {
    this.toast.hide();
  }

  /**
   * Get the dom element of this toast
   * @returns The toast dom element
   */
  public getToastDOMElement(): HTMLElement {
    return this.domElement;
  }
}

export { ToastHandler, ToastType };
