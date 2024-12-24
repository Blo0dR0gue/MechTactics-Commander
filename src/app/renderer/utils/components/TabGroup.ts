import { Icon } from '../../../types/UtilityTypes';
import { escapeHtmlTags } from '../Utils';

interface TabElement {
  icon?: Icon;
  text?: string;
  classNames?: string[];
  onClick: () => void;
}

class TabGroup {
  private tabGroupElement: HTMLUListElement;

  public constructor(
    private parentElement: HTMLElement,
    classNames: string[],
    private tabElements: TabElement[],
    private activeClass: string
  ) {
    this.tabGroupElement = document.createElement('ul');
    this.tabGroupElement.classList.add(...classNames);
  }

  public render(): this {
    for (const tabElement of this.tabElements) {
      const { icon, text, classNames, onClick } = tabElement;
      if (!icon && !text) {
        throw new Error(`You need to define either text or icon for an tab element ${tabElement}`);
      }
      const li = document.createElement('li');
      const link = document.createElement('a');

      if (classNames) link.classList.add(...classNames);

      if (icon) {
        const copy = icon.cloneNode(true) as Icon;
        if (text) copy.style.marginRight = '0.3rem'; // add margin to the right, if also a text should be rendered
        link.appendChild(copy);
      }

      if (text) {
        link.innerHTML += escapeHtmlTags(text);
      }

      link.addEventListener('click', (event) => {
        event.preventDefault();
        if (link.classList.contains(this.activeClass)) return;
        for (const child of this.tabGroupElement.children) {
          const linkChild = child.children[0];
          linkChild.classList.remove(this.activeClass);
        }
        link.classList.add(this.activeClass);
        onClick();
      });

      link.href = '#';

      li.appendChild(link);
      this.tabGroupElement.appendChild(li);
    }

    this.parentElement.appendChild(this.tabGroupElement);
    return this;
  }

  public remove(): void {
    if (this.tabGroupElement.parentNode === this.parentElement) {
      this.parentElement.innerHTML = '';
      this.parentElement.removeChild(this.tabGroupElement);
    }
  }
}

export { TabGroup };
