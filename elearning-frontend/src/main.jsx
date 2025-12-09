// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import keycloak from "./keycloak";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Initialise Keycloak
keycloak.init({ onLoad: "login-required", checkLoginIframe: false }).then((authenticated) => {
  if (!authenticated) {
    window.location.reload();
  } else {
    root.render(
      <React.StrictMode>
        <App keycloak={keycloak} />
      </React.StrictMode>
    );
  }
});
