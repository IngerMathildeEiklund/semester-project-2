import { registerUser } from "./api/auth";
import { ApiError, getErrorMessage } from "./error/apiError";
import { toastNotification } from "./messages/toastnotifications";
import { storage } from "./storage/storage";

import type { RegisterData } from "./utils/types";

type RegisterFormElements = HTMLFormControlsCollection & {
  name: HTMLInputElement;
  email: HTMLInputElement;
  password: HTMLInputElement;
  confirmPassword: HTMLInputElement;
  bio: HTMLInputElement;
  avatarUrl: HTMLInputElement;
  avatarAlt: HTMLInputElement;
  bannerUrl: HTMLInputElement;
  bannerAlt: HTMLInputElement;
};

type FieldError = {
  inputId: string;
  errorId: string;
  message: string;
};

const registrationForm = document.getElementById(
  "registration-form",
) as HTMLFormElement;

const submitBTN = document.getElementById("submit-button") as HTMLButtonElement;
const statusText = document.getElementById('registration-status') as HTMLParagraphElement;

const isValidImage = (value: string) => 
  new Promise<boolean>((resolve) => {
    try {
      const { protocol } = new URL(value);
      if (protocol !== "https:" && protocol !== "http:") return resolve(false);
    }catch{
      return resolve(false);
    }
    const img = new Image();
    const timer = setTimeout(() => resolve(false), 8000);
    img.onload = () => {clearTimeout(timer); resolve(true)};
    img.onerror = () => {clearTimeout(timer); resolve(false)};
    img.src = value;
  })
const FIELDS: { inputId: string; errorId: string }[] = [
  { inputId: "registration-username", errorId: "registration-username-error" },
  { inputId: "registration-email", errorId: "registration-email-error" },
  { inputId: "registration-password", errorId: "registration-password-error" },
  {
    inputId: "registration-password-repeat",
    errorId: "registration-password-repeat-error",
  },
  { inputId: "bio", errorId: "registration-bio-error" },
  { inputId: "register-image-url", errorId: "registration-image-url-error" },
  { inputId: "register-image-alt", errorId: "registration-image-alt-error" },
  { inputId: "banner", errorId: "registration-banner-error" },
  { inputId: "banner-alt", errorId: "registration-banner-alt-error" },
];

function clearFieldErrors() {
  for (const { inputId, errorId } of FIELDS) {
    document.getElementById(inputId)?.setAttribute("aria-invalid", "false");
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = "";
  }
}

function showFieldErrors(errors: FieldError[]) {
  for (const { inputId, errorId, message } of errors) {
    document.getElementById(inputId)?.setAttribute("aria-invalid", "true");
    const errorEl = document.getElementById(errorId);
    if (errorEl && !errorEl.textContent) errorEl.textContent = message;
  }
  const firstError = document.getElementById(
    errors[0].inputId,
  ) as HTMLInputElement | null;
  firstError?.focus();
}

registrationForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (submitBTN?.getAttribute("aria-disabled") === "true") return;
  submitBTN.setAttribute('aria-disabled', 'true');

  clearFieldErrors();

  const elements = registrationForm.elements as RegisterFormElements;

  const avatarUrl = elements.avatarUrl.value.trim();
  const avatarAlt = elements.avatarAlt.value.trim();

  const bannerUrl = elements.bannerUrl.value.trim();
  const bannerAlt = elements.bannerAlt.value.trim();

  const formData: RegisterData = {
    name: elements.name.value.trim(),
    email: elements.email.value.trim().toLowerCase(),
    password: elements.password.value,
    bio: elements.bio.value.trim(),
    avatar: avatarUrl ? { url: avatarUrl, alt: avatarAlt } : undefined,
    banner: bannerUrl ? { url: bannerUrl, alt: bannerAlt } : undefined,
  };
  const confirmPassword = elements.confirmPassword.value;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@stud\.noroff\.no$/;
  const usernamePattern = /^[a-zA-Z0-9_]+$/;


  if (avatarUrl || bannerUrl) {
    submitBTN.textContent = 'Validating images...'
    statusText.textContent = 'Validating images...'
  } 
  
  const [avatarOK, bannerOK] = await Promise.all([
    avatarUrl ? isValidImage(avatarUrl) : Promise.resolve(true),
    bannerUrl ? isValidImage(bannerUrl) : Promise.resolve(true),
  ])

  const errors: FieldError[] = [];

  if (!formData.email) {
    errors.push({
      inputId: "registration-email",
      errorId: "registration-email-error",
      message: "Email is required",
    });
  }
  if (formData.email && !emailRegex.test(formData.email)) {
    errors.push({
      inputId: "registration-email",
      errorId: "registration-email-error",
      message: "Please use a valid email format, @stud.noroff.no",
    });
  }

  if (formData.password && formData.password.length < 8) {
    errors.push({
      inputId: "registration-password",
      errorId: "registration-password-error",
      message: "Password must be 8 characters or more",
    });
  }

  if (formData.password !== confirmPassword) {
    errors.push({
      inputId: "registration-password-repeat",
      errorId: "registration-password-repeat-error",
      message: "Passwords do not match",
    });
  }
  if (!avatarOK) {
    errors.push({
      inputId: "register-image-url",
      errorId: "registration-image-url-error",
      message: "Use 'copy image address' to get correct format",
    });
  }
  if (!bannerOK) {
    errors.push({
      inputId: "banner",
      errorId: "registration-banner-error",
      message: "Use 'copy image address' to get correct format",
    });
  }
  if (formData.name && !usernamePattern.test(formData.name)) {
    errors.push({
      inputId: "registration-username",
      errorId: "registration-username-error",
      message: "Only letters, numbers and underscores are allowed",
    });
  }

  if (avatarUrl && !avatarAlt) {
    errors.push({
      inputId: "register-image-alt",
      errorId: "registration-image-alt-error",
      message: "Please describe your avatar image",
    });
  }

  if (bannerUrl && !bannerAlt) {
    errors.push({
      inputId: "banner-alt",
      errorId: "registration-banner-alt-error",
      message: "Please describe your banner image",
    });
  }

  if (!formData.name) {
    errors.push({
      inputId: "registration-username",
      errorId: "registration-username-error",
      message: "Username is required",
    });
  }

  if (!formData.password) {
    errors.push({
      inputId: "registration-password",
      errorId: "registration-password-error",
      message: "Password is required",
    });
  }

  if (errors.length > 0) {
    submitBTN?.setAttribute('aria-disabled', "false");
    submitBTN.textContent = 'Sign up';
    statusText.textContent = '';
    showFieldErrors(errors);
    toastNotification("Please fix the highlighted fields", "warning");
    return;
  }

  if (submitBTN) {
    submitBTN.textContent = "Please wait...";
    statusText.textContent = 'Creating your account...';
  }

  try {
    await registerUser(formData);
    storage.save("successfulRegister", "1");
    window.location.href = "./login.html";
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 409:
          toastNotification("Credentials already in use.", "warning");

          break;
        case 400:
          toastNotification(error.message, "error");

          break;
        case 429:
          toastNotification(
            "Too many requests, please try again later.",
            "error",
          );

          break;
        case 500:
          toastNotification("Please try again later.", "error");

          break;
        default:
          toastNotification("Please try again later.", "error");
      }
    } else if (error instanceof Error) {
      toastNotification(error.message, "error");
    } else {
      toastNotification(getErrorMessage(error), "error");
    }
  } finally {
    if (submitBTN) {
      submitBTN.setAttribute("aria-disabled", "false");
      submitBTN.textContent = "Sign up";
      statusText.textContent = '';
    }
  }
});
