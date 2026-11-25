import type { Media } from "./types";

let nextImageId = 0;

export function createImageField(
  position: number,
  media?: Media,
): HTMLFieldSetElement {
  const id = `image-${--nextImageId}`;
  const wrapper = document.createElement("fieldset");
  wrapper.className = "flex flex-col gap-2 mb-4";
  wrapper.dataset.imageIndex = String(position);
  wrapper.innerHTML = `

        <legend>Image ${position}</legend>
        <label for="${id}-url">Image url</label>
        <p id="${id}-url-hint" class="text-sm">Get correct image format by right clicking an image and selecting "Copy image address"</p>
        <input class="input" id="${id}-url" type="url" aria-describedby="${id}-url-hint" name="imageUrl" value="${media?.url ?? ""}">
        

        <label for="${id}-alt">Image description</label>
          <p id="${id}-alt-hint" class="text-sm">Describe your image</p>
        <input class="input" id="${id}-alt" aria-describedby="${id}-alt-hint" type="text" name="imageAlt" value="${media?.alt ?? ""}">
      
        <button type="button" class="btn-secondary delete-image-btn">Remove image ${position} </button>
        `;
        wrapper.querySelector<HTMLInputElement>('input[name="imageUrl"]')!.value = media?.url ?? '';
        wrapper.querySelector<HTMLInputElement>('input[name="imageAlt"]')!.value = media?.alt ?? '';
  return wrapper;
}

export function setupImageFields(
  addButton: HTMLButtonElement,
  container: HTMLElement,
  existingMedia: Media[] = [],
): void {
  existingMedia.forEach((media, i) => {
    container.append(createImageField(i + 1, media));
  });

  addButton.addEventListener("click", () => {
    const postition = container.querySelectorAll("fieldset").length + 1;
    const field = createImageField(postition);
    container.append(field);
    field.querySelector<HTMLInputElement>("input")?.focus();
  });
  container.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (!target.classList.contains("delete-image-btn")) return;
    target.closest("fieldset")?.remove();
    addButton.focus();
  });
}

export function collectListingMedia(container: HTMLElement): Media[] {
  const wrappers =
    container.querySelectorAll<HTMLFieldSetElement>("[data-image-index]");
  return Array.from(wrappers).map((wrapper) => ({
    url: wrapper
      .querySelector<HTMLInputElement>("input[name=imageUrl]")!
      .value.trim(),
    alt: wrapper
      .querySelector<HTMLInputElement>("input[name=imageAlt]")!
      .value.trim(),
  }));
}