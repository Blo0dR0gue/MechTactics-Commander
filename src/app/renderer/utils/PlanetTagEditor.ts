import { PlanetTags } from '../../types/PlanetData';
import { ToastHandler, ToastType } from './components/ToastHandler';
import { snakeCaseToTitleCase, stringToSnakeCase } from './Utils';

export type PlanetTagEditorProps = {
  tagEditorContainer: HTMLElement;
  newTagInput: HTMLInputElement;
  newTagKeyAddBtn: HTMLButtonElement;
  toastHandler: ToastHandler;
};

type TagMapEntry = { id: string; value: string };
type TagMap = Map<string, TagMapEntry[]>;

export default class PlanetTagEditor {
  private tags: TagMap;
  private tagEditorContainer: HTMLElement;
  private newTagInput: HTMLInputElement;
  private newTagKeyAddBtn: HTMLButtonElement;
  private toastHandler: ToastHandler;

  public constructor({
    newTagInput,
    newTagKeyAddBtn,
    tagEditorContainer,
    toastHandler
  }: PlanetTagEditorProps) {
    this.tagEditorContainer = tagEditorContainer;
    this.newTagInput = newTagInput;
    this.newTagKeyAddBtn = newTagKeyAddBtn;
    this.toastHandler = toastHandler;

    this.newTagKeyAddBtn.addEventListener('click', this.addNewTag.bind(this));
  }

  public loadEditor(initialTags: PlanetTags = {}) {
    while (this.tagEditorContainer.firstChild) {
      this.tagEditorContainer.removeChild(this.tagEditorContainer.lastChild);
    }

    this.newTagInput.value = '';

    this.tags = new Map();

    const startTags = new Map(
      Object.entries(initialTags).map(([key, values]) => {
        const valueObj = values.map((value) => {
          return { id: this.generateUniqueId(), value: value };
        });
        return [key, valueObj];
      })
    );

    startTags.forEach((values, key) => {
      this.addTagEditorRow(key, values);
    });
  }

  private addNewTag(): void {
    // Get value and convert to snake case. Industry Data => industry_data.
    const key = stringToSnakeCase(this.newTagInput.value);

    if (!key) {
      this.showError('Tag key cannot be empty.');
      return;
    }

    if (Object.hasOwn(this.tags, key)) {
      this.showError('Tag key already exists!');
      return;
    }

    this.addTagEditorRow(key, []);
    this.newTagInput.value = '';
  }

  private addTagEditorRow(key: string, values: TagMapEntry[]): void {
    this.tags.set(key, []);

    // Create main wrapper for the tag entry
    const row = document.createElement('div');
    row.className = 'mb-3';
    row.setAttribute('data-key', key);

    // Header of the Tag
    const keyContainer = document.createElement('div');
    keyContainer.className = 'd-flex align-items-center mb-2';

    // Tag Key Display
    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.className = 'form-control tag-key';
    keyInput.value = snakeCaseToTitleCase(key);
    keyInput.readOnly = true;

    // Remove Key Btn
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-danger ms-2';
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => this.removeTag(key, row);

    keyContainer.appendChild(keyInput);
    keyContainer.appendChild(removeButton);

    // Tag Container Of Tag
    const valuesContainer = document.createElement('div');
    valuesContainer.id = `planet-tag-values-${key}`;

    values.forEach((value) => {
      valuesContainer.appendChild(this.createValueInput(key, value));
    });

    // "Add Value" button
    const addValueButton = document.createElement('button');
    addValueButton.className = 'btn btn-info btn-sm mt-2';
    addValueButton.textContent = 'Add Value';
    addValueButton.onclick = () => this.addTagValue(key, valuesContainer);

    const hr = document.createElement('hr');

    row.appendChild(keyContainer);
    row.appendChild(valuesContainer);
    row.appendChild(addValueButton);
    row.appendChild(hr);

    this.tagEditorContainer.appendChild(row);
  }

  private createValueInput(key: string, value: TagMapEntry): HTMLElement {
    this.tags.get(key).push(value);

    const valueWrapper = document.createElement('div');
    valueWrapper.className = 'input-group mb-2';

    // Input
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'form-control tag-value';
    valueInput.value = value.value;
    valueInput.setAttribute('data-key', key);
    valueInput.onchange = () => {
      const currentValue = this.tags
        .get(key)
        ?.find((tagEntry) => tagEntry.id === value.id);

      if (!currentValue) {
        this.showError(`Error while processing tag change. Value not found!`);
        return;
      }

      let newValue = valueInput.value.trim();

      if (this.tags.get(key).find((tagEntry) => tagEntry.value === newValue)) {
        this.showError(
          `Tag for '${key}' with value '${newValue}' already exists!`
        );
        newValue = currentValue.value;
      }

      currentValue.value = newValue;
      valueInput.value = newValue;
    };

    // Remove Button
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-warning';
    removeButton.textContent = '-';
    removeButton.onclick = () =>
      this.removeTagValue(key, value.id, valueWrapper);

    valueWrapper.appendChild(valueInput);
    valueWrapper.appendChild(removeButton);

    return valueWrapper;
  }

  private addTagValue(key: string, valuesContainer: HTMLDivElement): void {
    const emptyEntryExists =
      this.tags
        .get(key)
        ?.find((emptyEntry) => emptyEntry.value.trim() === '') !== undefined;

    if (emptyEntryExists) {
      this.showError(`There is already an entry with an empty value.`);
      return;
    }

    const valueRow = document.createElement('div');
    valueRow.className = 'input-group mb-2';

    valueRow.appendChild(
      this.createValueInput(key, { id: this.generateUniqueId(), value: '' })
    );

    valuesContainer.appendChild(valueRow);
  }

  private removeTag(key: string, row: HTMLElement): void {
    this.tags.delete(key);
    row.remove();
  }

  private removeTagValue(
    key: string,
    id: TagMapEntry['id'],
    valueWrapper: HTMLDivElement
  ): void {
    const values = this.tags.get(key);
    const idx = values?.findIndex((tagEntry) => tagEntry.id === id);
    if (idx >= 0) {
      values.splice(idx, 1);
    }
    valueWrapper.remove();
  }

  public getCurrentTagUpdates(): PlanetTags {
    const updatedTags: PlanetTags = {};

    this.tags.forEach((values, key) => {
      updatedTags[key] = values.reduce(
        (arr: string[], tagEntry: TagMapEntry) => {
          if (tagEntry.value.trim() !== '') {
            arr.push(tagEntry.value);
          }
          return arr;
        },
        [] as string[]
      );
    });
    return updatedTags;
  }

  private showError(message: string): void {
    this.toastHandler.createAndShowToast(
      'Planet Tag',
      message,
      ToastType.Warning
    );
  }

  private generateUniqueId(prefix: string = 'tag'): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
