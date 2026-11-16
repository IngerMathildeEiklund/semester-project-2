import { loginUser } from "./api/auth";
import { getErrorMessage } from "./error/apiError";
import { toastNotification } from "./messages/toastnotifications";
import { storage } from "./storage/storage";

const loginError = document.getElementById('login-error') as HTMLParagraphElement;
const emailInput = document.getElementById('login-email-input') as HTMLInputElement;
const passwordInput = document.getElementById('login-password-input') as HTMLInputElement;

function showLoginError(message: string): void {
loginError.textContent = message;
loginError.hidden = false;

for (const input of [emailInput, passwordInput]) {
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', 'login-error');
}
}

function clearLoginError(): void {
loginError.textContent = '';
loginError.hidden = true;

for (const input of [emailInput, passwordInput]) {
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
}
}
export function checkRegister(): void {
  if (storage.load("successfulRegister")) {
    storage.remove("successfulRegister");
    toastNotification("Register successful! You can now log in.", "success");
  }
}

checkRegister();

type LoginFormElements = HTMLFormControlsCollection & {
  email: HTMLInputElement;
  password: HTMLInputElement;
};
const loginForm = document.getElementById(
  "login-form",
) as HTMLFormElement | null;

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearLoginError();

  const elements = loginForm.elements as LoginFormElements;

  const credentials = {
    email: elements.email.value.trim().toLowerCase(),
    password: elements.password.value,
  };

  try {
    await loginUser(credentials);
    window.location.href = "/index.html";
  } catch (error) {
    const message = getErrorMessage(error);
    toastNotification(message, "error");
    showLoginError(message);
  }
});
