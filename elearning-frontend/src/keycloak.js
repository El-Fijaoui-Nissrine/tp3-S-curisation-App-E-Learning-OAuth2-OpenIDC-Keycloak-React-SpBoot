// src/keycloak.js
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",      // URL Keycloak
  realm: "elearning-realm",          // ton realm
  clientId: "react-client"           // ton client
});

export default keycloak;
