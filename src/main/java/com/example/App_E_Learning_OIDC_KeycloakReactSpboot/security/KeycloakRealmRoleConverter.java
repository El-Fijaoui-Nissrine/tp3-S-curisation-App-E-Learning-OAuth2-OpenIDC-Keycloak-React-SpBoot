package com.example.App_E_Learning_OIDC_KeycloakReactSpboot.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;

public class KeycloakRealmRoleConverter
        implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    @SuppressWarnings("unchecked")
    public Collection<GrantedAuthority> convert(Jwt jwt) {

        Object realmAccessObj = jwt.getClaims().get("realm_access");

        if (!(realmAccessObj instanceof Map)) {
            return Collections.emptyList();
        }

        Map<String, Object> realmAccess = (Map<String, Object>) realmAccessObj;
        Object rolesObj = realmAccess.get("roles");

        if (!(rolesObj instanceof Collection)) {
            return Collections.emptyList();
        }

        Collection<String> roles = (Collection<String>) rolesObj;

        return roles.stream()
                // Les rôles sont déjà ROLE_ADMIN / ROLE_STUDENT dans Keycloak
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }
}
