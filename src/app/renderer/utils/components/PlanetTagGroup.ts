import { BaseElement } from './BaseElement';

interface PlanetTagGroupProps {
  parentElement: HTMLElement;
  tagTitle: string;
  tagValueList: string[];
}

export class PlanetTagGroup extends BaseElement {
  private tagValueList: string[];
  private tagTitle: string;

  private tagGroup: HTMLElement | null = null;

  public constructor({ parentElement, tagTitle, tagValueList }: PlanetTagGroupProps) {
    super(parentElement);
    this.tagTitle = tagTitle;
    this.tagValueList = tagValueList;
  }

  public render(): this {
    if (this.tagGroup) {
      this.remove();
    }

    this.tagGroup = document.createElement('div');
    this.tagGroup.className = 'tag-group';

    const tagTitle = document.createElement('div');
    tagTitle.className = 'tag-title';
    tagTitle.textContent = this.tagTitle;
    this.tagGroup.appendChild(tagTitle);

    const tagContainer = document.createElement('div');
    tagContainer.className = 'tag-value-container';

    this.tagValueList.forEach((tag) => {
      const tagItem = document.createElement('div');
      tagItem.className = 'tag-item';
      tagItem.textContent = tag.toString();
      tagContainer.appendChild(tagItem);
    });

    this.tagGroup.appendChild(tagContainer);
    this.parentElement.appendChild(this.tagGroup);

    return this;
  }

  public remove(): void {
    if (this.tagGroup && this.tagGroup.parentElement) {
      this.tagGroup.parentElement.removeChild(this.tagGroup);
      this.tagGroup.remove();
      this.tagGroup = null;
    }
  }
}
