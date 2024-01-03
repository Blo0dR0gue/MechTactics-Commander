import { Icon } from '../../types/UtilityTypes';
import { escapeHtmlTags } from './Utils';

/**
 * A basic button definition for this table
 */
interface IButton {
  /**
   * The display text of the button
   */
  text?: string;
  /**
   * A list of css class names to style this button
   */
  classNames?: string[];
  /**
   * A possible icon element, which is displayed before a possible text
   */
  icon?: Icon;
}

class Button {
  /**
   * The button element, which is rendered in the dom
   */
  private buttonElement: HTMLButtonElement;

  /**
   * Creates a new button element
   * @param parentElement The element, in which this buttons gets rendered.
   * @param text The display text of the button
   * @param classNames A list of css class names to style this button
   * @param icon A possible icon element, which is displayed before a possible text
   */
  public constructor(private parentElement: HTMLElement, basicButton: IButton) {
    const { text, icon, classNames } = basicButton;

    if (!text && !icon) {
      throw new Error(
        `You must define either text or an icon for a button. ${basicButton}`
      );
    }

    this.buttonElement = document.createElement('button');

    if (classNames) this.buttonElement.classList.add(...classNames);

    if (icon) {
      const copy = icon.cloneNode(true) as Icon;
      if (text) copy.style.marginRight = '0.3rem'; // add margin to the right, if also a text should be rendered
      this.buttonElement.appendChild(copy);
    }

    if (text) {
      // If a text should be added expand the inner html to not override a possible icon.
      this.buttonElement.innerHTML += escapeHtmlTags(text);
    }
  }

  public disable(disable: boolean): void {
    this.buttonElement.disabled = disable;
  }

  public getButtonElement(): HTMLButtonElement {
    return this.buttonElement;
  }

  public render(): this {
    if (this.buttonElement.parentNode) {
      throw new Error('Button already rendered');
    }
    this.parentElement.appendChild(this.buttonElement);
    return this;
  }

  public remove(): void {
    if (this.buttonElement.parentNode === this.parentElement) {
      this.parentElement.removeChild(this.buttonElement);
    }
  }
}

export { Button, IButton };
