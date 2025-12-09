# Secure E-Learning Platform with OAuth2 / OpenID Connect

##  Introduction

This project implements a secure E-Learning platform using OAuth2 and OpenID Connect (OIDC). The architecture consists of three main components:

* **React Frontend**: Interactive user interface
* **Spring Boot Backend**: Secured REST API
* **Keycloak**: Centralized authentication server

The platform manages users and roles to provide role-based access:

* `STUDENT`: Can view courses
* `ADMIN`: Can manage and add courses
##  Architecture


<img width="1201" height="618" alt="image" src="https://github.com/user-attachments/assets/72dadb56-1a70-4074-8932-327c6a213e3c" />

## Components

| Component | Port | Description |
|-----------|------|-------------|
| React Frontend | 5173 | User interface, authentication via Keycloak |
| Spring Boot Backend | 8081 | Secured API, JWT/OIDC token validation |
| Keycloak | 8080 | User and role management |

##  Technologies

### Backend

* Spring Boot 
* Spring Security
* OAuth2 Resource Server
* Java 21

### Frontend

* React 
* keycloak-js
* JavaScript 

### Authentication

* Keycloak 22+
* OAuth2 / OpenID Connect (OIDC)
* JWT (JSON Web Tokens)

##  Configuration

###   Keycloak Configuration

1. Access: `http://localhost:8080`
2. Create a Realm: `elearning-realm`
3. Create a Client: `react-client` (Public, Standard Flow OIDC)
4. Redirect URI :`http://localhost:5173/*`
5. Create Roles: `ROLE_ADMIN`, `ROLE_STUDENT`
6. Create Users:
   * `user1` → ROLE_STUDENT
   * `admin1` → ROLE_ADMIN


###  React Frontend

```bash
cd elearning-frontend
npm install
npm install keycloak-js
```

* App runs at `http://localhost:5173`
* Keycloak configuration in React (`keycloak.js`):

```javascript
// src/keycloak.js
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",      // URL Keycloak
  realm: "elearning-realm",          // ton realm
  clientId: "react-client"           // ton client
});

export default keycloak;

```

###  Spring Boot Backend

**application.properties**:

```properties
spring.application.name=App-E-Learning-OIDC-KeycloakReactSpboot
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/elearning-realm
server.port=8081
```

**Spring Security configuration**:

```java

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Basic security rules: any request authenticated; JWT validation delegated to resource server
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter conv = new JwtAuthenticationConverter();
        conv.setJwtGrantedAuthoritiesConverter(new KeycloakRealmRoleConverter());
        return conv;
    }

    // CORS config: autorise React en dev (http://localhost:3000)
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

```

##  Usage

### 1️ Access the Application

* URL: `http://localhost:5173`
* Auto-redirect to Keycloak for login
* Test credentials:
   * `user1` (STUDENT)
   * `admin1` (ADMIN)

### 2️ API Endpoints

| Endpoint | Method | Roles | Description |
|----------|--------|-------|-------------|
| `/api/courses` | GET | STUDENT, ADMIN | Get list of courses |
| `/api/courses` | POST | ADMIN only | Add a new course |
| `/api/me` | GET | Authenticated | Retrieve user info |

##  Security

* Spring Boot validates JWT tokens issued by Keycloak
* Roles are mapped via `realm_access.roles`
* Access control with `@PreAuthorize` annotations
* React frontend shows/hides sections based on roles

##  Testing

###  1 Obtain a Token with Postman

```http
POST http://localhost:8080/realms/elearning-realm/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

&client_id=react-client
&username=admin1
&password=admin
&grant_type=password
```

<img width="1227" height="548" alt="image" src="https://github.com/user-attachments/assets/c7566b0b-39c2-4157-b358-f8e42fc7e2c1" />

### 2 Test the API

```http
POST http://localhost:8081/api/courses 
```
- **403 for user1**
<img width="782" height="484" alt="Capture d&#39;écran 2025-12-09 002822" src="https://github.com/user-attachments/assets/950bb311-b68a-497f-836f-372b5411a446" />

- **200 for admin1.**
<img width="767" height="525" alt="Capture d&#39;écran 2025-12-09 003012" src="https://github.com/user-attachments/assets/6c4395e3-a93f-40c1-9e85-03bbef976548" />

###  React Interface
#### Keycloak Login Page

<img width="1354" height="673" alt="image" src="https://github.com/user-attachments/assets/82ccb062-c3fa-4b30-afef-094beb18b07b" />

####  case admin
<img width="1353" height="635" alt="image" src="https://github.com/user-attachments/assets/3b9e1a76-9ead-44b6-a9af-3af98e2a5e35" />
<img width="1360" height="340" alt="image" src="https://github.com/user-attachments/assets/6b4468e5-7566-4c9e-b322-15e4e0dc9827" />

####  case student
<img width="1362" height="639" alt="image" src="https://github.com/user-attachments/assets/385d2146-e1de-43df-9833-1f6f8b0f9fa3" />


* Courses section: visible to STUDENT and ADMIN
* Course management section: visible only to ADMIN



