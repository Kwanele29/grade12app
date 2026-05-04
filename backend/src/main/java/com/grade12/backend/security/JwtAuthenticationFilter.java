package com.grade12.backend.security;

import com.grade12.backend.service.JwtService;
import com.grade12.backend.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

   @Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain) throws ServletException, IOException {
    System.out.println("=== JWT FILTER ===");
    System.out.println("Method: " + request.getMethod());
    System.out.println("URI: " + request.getRequestURI());

    final String authHeader = request.getHeader("Authorization");
    System.out.println("Authorization header: " + (authHeader != null ? "present" : "null"));

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        System.out.println("No Bearer token, continuing without authentication");
        filterChain.doFilter(request, response);
        return;
    }

    final String jwt = authHeader.substring(7);
    System.out.println("Token (first 50 chars): " + jwt.substring(0, Math.min(50, jwt.length())));

    try {
        String userEmail = jwtService.extractUsername(jwt);
        System.out.println("Extracted email: " + userEmail);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            System.out.println("UserDetails loaded: " + userDetails.getUsername());

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("✅ Authentication set for: " + userEmail);
            } else {
                System.out.println("❌ Token invalid for: " + userEmail);
            }
        }
    } catch (Exception e) {
        System.err.println("❌ Exception in JWT filter: " + e.getMessage());
        e.printStackTrace();
        // Do NOT swallow – we want to see the stack trace
        // But continue without authentication
    }

    filterChain.doFilter(request, response);
}
}