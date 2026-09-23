(() => {
  "use strict";

  const STORAGE_KEY = "assis_privacy_consent_v1";
  const GEO_KEY = "assis_location_consent_v1";

  const state = {
    analytics: false,
    ads: false,
    location: false
  };

  const get = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || "null"); }
    catch { return null; }
  };

  const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };

  function loadConsent() {
    const consent = get(STORAGE_KEY);
    if (consent) Object.assign(state, consent);
  }

  function injectStyles() {
    if (document.getElementById("assis-consent-styles")) return;
    const style = document.createElement("style");
    style.id = "assis-consent-styles";
    style.textContent = `
      #assis-consent-overlay{position:fixed;inset:0;background:rgba(0,0,0,.48);z-index:9998;display:flex;align-items:flex-end;justify-content:center;padding:18px}
      #assis-consent{width:min(760px,100%);background:#fff;border-radius:18px;padding:24px;box-shadow:0 20px 70px rgba(0,0,0,.25);font:15px/1.5 Arial,sans-serif;color:#111827}
      #assis-consent h2{margin:0 0 8px;font-size:21px}
      #assis-consent p{margin:0 0 16px;color:#4b5563}
      #assis-consent-actions{display:flex;gap:10px;flex-wrap:wrap}
      #assis-consent button{border:0;border-radius:10px;padding:12px 18px;cursor:pointer;font-weight:700}
      #assis-accept{background:#0046B8;color:#fff}
      #assis-reject{background:#eef2f7;color:#111827}
      #assis-settings{background:#fff;color:#0046B8;border:1px solid #0046B8!important}
      #assis-consent small{display:block;margin-top:12px;color:#6b7280}
      @media(max-width:560px){#assis-consent{padding:19px}#assis-consent-actions button{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function renderConsent() {
    if (document.getElementById("assis-consent-overlay")) return;
    injectStyles();

    const overlay = document.createElement("div");
    overlay.id = "assis-consent-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <section id="assis-consent" aria-labelledby="assis-consent-title">
        <h2 id="assis-consent-title">Privacidade e localização</h2>
        <p>
          Usamos cookies e tecnologias semelhantes para medir o uso do site e,
          somente com sua autorização, ativar recursos de publicidade. A localização
          precisa do seu dispositivo só será solicitada se você permitir.
        </p>
        <div id="assis-consent-actions">
          <button id="assis-accept">Aceitar</button>
          <button id="assis-reject">Recusar</button>
          <button id="assis-settings">Escolher opções</button>
        </div>
        <small>Você pode alterar sua escolha posteriormente limpando os dados de consentimento do site.</small>
      </section>`;

    document.body.appendChild(overlay);

    overlay.querySelector("#assis-accept").onclick = () => {
      state.analytics = true;
      state.ads = true;
      save(STORAGE_KEY, {...state, timestamp: Date.now()});
      requestLocation();
      applyGoogleConsent();
      overlay.remove();
    };

    overlay.querySelector("#assis-reject").onclick = () => {
      state.analytics = false;
      state.ads = false;
      state.location = false;
      save(STORAGE_KEY, {...state, timestamp: Date.now()});
      applyGoogleConsent();
      overlay.remove();
    };

    overlay.querySelector("#assis-settings").onclick = () => renderSettings(overlay);
  }

  function renderSettings(overlay) {
    overlay.querySelector("#assis-consent").innerHTML = `
      <h2>Escolha suas permissões</h2>
      <p>Você decide quais tecnologias podem ser utilizadas.</p>
      <label><input id="assis-analytics" type="checkbox" ${state.analytics ? "checked" : ""}> Medição e estatísticas</label><br>
      <label><input id="assis-ads" type="checkbox" ${state.ads ? "checked" : ""}> Publicidade personalizada</label><br>
      <label><input id="assis-location" type="checkbox" ${state.location ? "checked" : ""}> Localização precisa</label>
      <div id="assis-consent-actions" style="margin-top:18px">
        <button id="assis-save" style="background:#0046B8;color:#fff">Salvar escolhas</button>
      </div>`;

    overlay.querySelector("#assis-save").onclick = () => {
      state.analytics = overlay.querySelector("#assis-analytics").checked;
      state.ads = overlay.querySelector("#assis-ads").checked;
      state.location = overlay.querySelector("#assis-location").checked;
      save(STORAGE_KEY, {...state, timestamp: Date.now()});
      applyGoogleConsent();
      if (state.location) requestLocation();
      overlay.remove();
    };
  }

  function requestLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
          timestamp: Date.now()
        };
        save(GEO_KEY, location);
        window.dispatchEvent(new CustomEvent("assis:location-ready", {detail: location}));
      },
      () => {
        save(GEO_KEY, {denied: true, timestamp: Date.now()});
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  function applyGoogleConsent() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};

    window.gtag("consent", "default", {
      ad_storage: state.ads ? "granted" : "denied",
      analytics_storage: state.analytics ? "granted" : "denied",
      ad_user_data: state.ads ? "granted" : "denied",
      ad_personalization: state.ads ? "granted" : "denied",
      functionality_storage: "granted",
      security_storage: "granted",
      wait_for_update: 500
    });
  }

  window.AssisPrivacy = {
    getConsent: () => ({...state}),
    getLocation: () => get(GEO_KEY),
    requestLocation,
    open: renderConsent
  };

  document.addEventListener("DOMContentLoaded", () => {
    loadConsent();
    applyGoogleConsent();

    if (!get(STORAGE_KEY)) {
      renderConsent();
    } else if (state.location) {
      requestLocation();
    }
  });
})();