import type { Media } from "./types";

let nextImageId = 0;

export function createImageField(
  media?: Media,
): HTMLFieldSetElement {
  const id = `image-${++nextImageId}`;
  const fieldset = document.createElement("fieldset");
  fieldset.className = "flex flex-col gap-2 mb-4";
  fieldset.dataset.imageIndex = '0';
  fieldset.innerHTML = `

        <legend>Image</legend>
        <label for="${id}-url">Image url</label>
        <p id="${id}-url-hint" class="text-sm">Get correct image format by right clicking an image and selecting "Copy image address"</p>
        <input class="input" id="${id}-url" type="url" aria-describedby="${id}-url-hint" name="imageUrl">
        

        <label for="${id}-alt">Image description</label>
          <p id="${id}-alt-hint" class="text-sm">Describe your image</p>
        <input class="input" id="${id}-alt" aria-describedby="${id}-alt-hint" type="text" name="imageAlt">
      
        <button type="button" class="btn-secondary delete-image-btn">Remove image</button>
        `;
        fieldset.querySelector<HTMLInputElement>('input[name="imageUrl"]')!.value = media?.url ?? '';
        fieldset.querySelector<HTMLInputElement>('input[name="imageAlt"]')!.value = media?.alt ?? '';
  return fieldset;
}

function renumberImageFields(container: HTMLElement): void {
  const fields = container.querySelectorAll<HTMLFieldSetElement>('[data-image-index]');
  fields.forEach((field, index) => {
    const position = index + 1;
    field.dataset.imageIndex = String(position);
    field.querySelector('legend')!.textContent = `Image ${position}`;
    field.querySelector('.delete-image-btn')!.textContent = `Remove image ${position}`;
  })
}

function announceChange(message: string): void {
  const status = document.getElementById('image-status');
  if (status) status.textContent = message;
}

export function setupImageFields(
  addButton: HTMLButtonElement,
  container: HTMLElement,
  existingMedia: Media[] = [],
): void {
  existingMedia.forEach((media) => container.append(createImageField(media)));
  renumberImageFields(container);

  addButton.addEventListener("click", () => {
    const field = createImageField();
    container.append(field);
    renumberImageFields(container);
    announceChange(`Image ${container.querySelectorAll('fieldset').length} added.`);
    field.querySelector<HTMLInputElement>('input[name="imageUrl"]')!.focus();
  });

  container.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (!target.classList.contains("delete-image-btn")) return;

    const field = target.closest("fieldset")!;
    const index = Array.from(container.querySelectorAll("fieldset")).indexOf(field);
    field.remove();
    renumberImageFields(container);

    const urlInputs = container.querySelectorAll<HTMLInputElement>('input[name="imageUrl]"');
    const nextToFocus = urlInputs[index] ?? urlInputs[index - 1] ?? addButton;
    nextToFocus.focus();
    announceChange(`Image removed. ${urlInputs.length} left.`);
  });
}

export function collectListingMedia(container: HTMLElement): Media[] {
 
  return Array.from(container.querySelectorAll<HTMLFieldSetElement>('[data-image-index]')).map((field) => ({
    url: field
      .querySelector<HTMLInputElement>("input[name=imageUrl]")!
      .value.trim(),
    alt: field
      .querySelector<HTMLInputElement>("input[name=imageAlt]")!
      .value.trim(),
  })).filter((media) => media.url.length > 0);
}