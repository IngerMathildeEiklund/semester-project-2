type MessageType = "success" | "warning" | "error";

export function toastNotification(message: string, type: MessageType): void {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;

  const toastElement = document.createElement("div");
  toastElement.setAttribute("role", type === 'error' ? 'alert' : 'status');
  toastElement.classList.add("toast", type);
  toastElement.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = 'X';
  closeBtn.setAttribute('aria-label', 'Dismiss notification');
  closeBtn.addEventListener('click', () => toastElement.remove());
  toastElement.append(closeBtn);
  toastContainer.appendChild(toastElement);

  const timeoutID = setTimeout(() => {
    toastElement.remove();
  }, 10000);

  toastElement.addEventListener("click", () => {
    clearTimeout(timeoutID);
    toastElement.remove();
  });
}
