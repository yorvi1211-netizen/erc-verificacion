
"use strict";

/*
 * ERC | Portal de verificación
 *
 * El portal recibe el retorno OAuth de Roblox y entrega
 * code/state al Worker por HTTPS.
 *
 * Nunca incluir secretos privados en este archivo.
 */
const ERC_CONFIG = {
  oauthStartUrl: "",
  oauthCallbackBridgeUrl:
    "https://erc-oauth.yorvi1211.workers.dev/oauth/callback"
};

const verifyButton = document.getElementById("verify-button");
const buttonLabel = document.getElementById("button-label");
const statusMessage = document.getElementById("status-message");

function setStatus(message, isError = false) {
  statusMessage.classList.toggle("is-error", isError);

  const dot = document.createElement("span");
  dot.className = "status-dot";
  dot.setAttribute("aria-hidden", "true");

  statusMessage.replaceChildren(
    dot,
    document.createTextNode(message)
  );
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

async function handleOAuthReturn() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  const oauthError = params.get("error");

  if (oauthError) {
    setStatus(
      "La autorización fue cancelada o rechazada. Regresa a Discord e inténtalo nuevamente.",
      true
    );
    return;
  }

  if (!code && !state) return;

  if (!code || !state || code.length > 4096 || state.length > 512) {
    setStatus("La respuesta de Roblox está incompleta o no es válida.", true);
    return;
  }

  verifyButton.disabled = true;
  buttonLabel.textContent = "PROCESANDO…";
  setStatus("Autorización recibida. Enviando respuesta segura al servidor…");

  try {
    const response = await fetch(ERC_CONFIG.oauthCallbackBridgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code, state }),
      cache: "no-store",
      redirect: "error"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Quita code y state de la barra de direcciones.
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

    setStatus(
      "Respuesta enviada correctamente. Regresa a Discord para completar la verificación."
    );
    buttonLabel.textContent = "RESPUESTA ENVIADA";
  } catch (error) {
    console.error("Error enviando la respuesta OAuth:", error);

    setStatus(
      "No se pudo entregar la autorización al servidor. No repitas el proceso todavía; contacta con la administración.",
      true
    );
    buttonLabel.textContent = "VERIFICAR CON ROBLOX";
    verifyButton.disabled = false;
  }
}

verifyButton.addEventListener("click", () => {
  const oauthUrl = ERC_CONFIG.oauthStartUrl.trim();

  if (!oauthUrl) {
    setStatus(
      "El inicio de sesión aún no está conectado. Inicia la verificación desde Discord.",
      true
    );
    return;
  }

  if (!isValidOAuthUrl(oauthUrl)) {
    setStatus(
      "La dirección de autenticación no es válida. Contacta con el administrador.",
      true
    );
    return;
  }

  setStatus("Conectando con el servicio de autenticación…");
  buttonLabel.textContent = "CONECTANDO…";
  verifyButton.disabled = true;

  window.location.assign(oauthUrl);
});

handleOAuthReturn();
