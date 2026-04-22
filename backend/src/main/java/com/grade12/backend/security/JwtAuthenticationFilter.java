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
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String requestPath = request.getRequestURI();
        
        System.out.println("=== JWT FILTER ===");
        System.out.println("Request URI: " + requestPath);
        
        // ALLOW QUIZ SUBMIT ENDPOINT WITHOUT AUTHENTICATION
        if (requestPath.equals("/api/quizzes/submit")) {
            System.out.println("✅ Quiz submit endpoint - allowing access without authentication");
            filterChain.doFilter(request, response);
            return;
        }
        
        // ALLOW OTHER PUBLIC ENDPOINTS
        if (requestPath.startsWith("/api/auth/") || 
            requestPath.startsWith("/oauth2/") || 
            requestPath.startsWith("/login/") ||
            requestPath.equals("/api/subjects") ||
            requestPath.startsWith("/api/materials/")) {
            System.out.println("✅ Public endpoint - allowing access");
            filterChain.doFilter(request, response);
            return;
        }
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("❌ No Bearer token found for protected endpoint");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Authentication required");
            return;
        }

        final String jwt;
        final String userEmail;

        jwt = authHeader.substring(7);
        System.out.println("Token found: " + jwt.substring(0, Math.min(50, jwt.length())) + "...");
        
        try {
            userEmail = jwtService.extractUsername(jwt);
            System.out.println("Extracted email from token: " + userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                System.out.println("UserDetails loaded for: " + userEmail);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("✅ Authentication set for: " + userEmail);
                } else {
                    System.out.println("❌ Token is invalid for: " + userEmail);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Invalid token");
                    return;
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error in JWT filter: " + e.getMessage());
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Authentication error: " + e.getMessage());
            return;
        }
        
        filterChain.doFilter(request, response);
    }
}