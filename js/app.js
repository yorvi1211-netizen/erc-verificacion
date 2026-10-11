
"use strict";

/*
 * ERC | Portal de verificación
 *
 * La URL de inicio OAuth debe configurarse cuando el servidor
 * de autenticación esté listo y sea accesible públicamente.
 *
 * No pongas aquí contraseñas, cookies de Roblox, client secrets
 * ni tokens privados.
 */
const ERC_CONFIG = {
  oauthStartUrl: ""
};

const verifyButton = document.getElementById("verify-button");
const buttonLabel = document.getElementById("button-label");
const statusMessage = document.getElementById("status-message");

function setStatus(message, isError = false) {
  statusMessage.classList.toggle("is-error", isError);

  const dot = document.createElement("span");
  dot.className = "status-dot";
  dot.setAttribute("aria-hidden", "true");

  statusMessage.replaceChildren(dot, document.createTextNode(message));
}

function isValidOAuthUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname.length > 0 &&
      url.username === "" &&
      url.password === ""
    );
  } catch {
    return false;
  }
}

verifyButton.addEventListener("click", () => {
  const oauthUrl = ERC_CONFIG.oauthStartUrl.trim();

  if (!oauthUrl) {
    setStatus(
      "La conexión con Roblox aún no está habilitada. El portal visual está listo; falta configurar el servidor OAuth.",
      true
    );
    return;
  }

  if (!isValidOAuthUrl(oauthUrl)) {
    setStatus(
      "La dirección de autenticación no es válida. Contacta con el administrador del portal.",
      true
    );
    return;
  }

  setStatus("Conectando con el servicio de autenticación…");
  buttonLabel.textContent = "CONECTANDO…";
  verifyButton.disabled = true;

  try {
    window.location.assign(oauthUrl);
  } catch {
    buttonLabel.textContent = "VERIFICAR CON ROBLOX";
    verifyButton.disabled = false;
    setStatus("No fue posible abrir el servicio de autenticación.", true);
  }
});
