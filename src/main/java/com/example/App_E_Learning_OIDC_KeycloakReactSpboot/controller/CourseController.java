package com.example.App_E_Learning_OIDC_KeycloakReactSpboot.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api")
public class CourseController {
    private final List<Map<String,Object>> courses = Collections.synchronizedList(new ArrayList<>());
    private final AtomicInteger idGenerator = new AtomicInteger(1);

    public CourseController() {
        // données de démo initiales
        Map<String,Object> demo = new HashMap<>();
        demo.put("id", idGenerator.getAndIncrement());
        demo.put("title", "Introduction à Java");
        demo.put("description", "Bases du langage Java et POO.");
        courses.add(demo);
    }

    /**
     * Accessible aux STUDENT et ADMIN
     */
    @GetMapping("/courses")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT','ROLE_ADMIN')")
    public ResponseEntity<List<Map<String,Object>>> getCourses() {
        return ResponseEntity.ok(new ArrayList<>(courses));
    }

    /**
     * Réservé au ADMIN uniquement
     */
    @PostMapping("/courses")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String,Object>> addCourse(@RequestBody Map<String,Object> payload) {
        Map<String,Object> course = new HashMap<>();
        course.put("id", idGenerator.getAndIncrement());
        course.put("title", payload.getOrDefault("title", "Untitled"));
        course.put("description", payload.getOrDefault("description", ""));
        courses.add(course);
        return ResponseEntity.ok(course);
    }

    /**
     * Retourne les claims du token (utile pour debug / affichage rôle côté frontend)
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String,Object>> me(@AuthenticationPrincipal Jwt jwt) {
        Map<String,Object> claims = new HashMap<>(jwt.getClaims());
        // Pour améliorer lisibilité, on peut exposer seulement certains claims
        Map<String,Object> response = new HashMap<>();
        response.put("sub", claims.get("sub"));
        response.put("preferred_username", claims.get("preferred_username"));
        response.put("email", claims.get("email"));
        response.put("realm_access", claims.get("realm_access"));
        response.put("claims", claims); // si tu veux tout
        return ResponseEntity.ok(response);
    }

}
