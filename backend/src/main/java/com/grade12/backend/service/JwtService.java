package com.grade12.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    @Value("${jwt.expiration}")
    private Long jwtExpiration;
    
    @Value("${jwt.refresh-expiration}")
    private Long refreshExpiration;
    
<<<<<<< HEAD
    private Key getSignInKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    public String extractUsername(String token) {
        try {
            return extractClaim(token, Claims::getSubject);
        } catch (ExpiredJwtException e) {
            System.out.println("Token expired but returning username from expired token");
            return e.getClaims().getSubject();
        }
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
<<<<<<< HEAD
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            System.out.println("Returning claims from expired token");
            return e.getClaims();
        }
    }
    
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    private boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            boolean expired = expiration.before(new Date());
            System.out.println("Token expiration: " + expiration + ", Expired: " + expired);
            return expired;
        } catch (ExpiredJwtException e) {
            System.out.println("Token is expired");
            return true;
        }
    }
    
    // Token generation for UserDetails
=======
    // For UserDetails
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }
    
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails.getUsername(), jwtExpiration);
    }
    
    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails.getUsername(), refreshExpiration);
    }
    
    // Token generation for OAuth2/OIDC (username string)
    public String generateToken(String username) {
        System.out.println("Generating token for username: " + username);
        return buildToken(new HashMap<>(), username, jwtExpiration);
    }
    
    public String generateRefreshToken(String username) {
        System.out.println("Generating refresh token for username: " + username);
        return buildToken(new HashMap<>(), username, refreshExpiration);
    }
    
    // Token generation for Authentication object
    public String generateToken(Authentication authentication) {
        return generateToken(authentication.getName());
    }
    
    public String generateRefreshToken(Authentication authentication) {
        return generateRefreshToken(authentication.getName());
    }
    
    private String buildToken(Map<String, Object> extraClaims, String username, long expiration) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    // Token validation methods
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
            System.out.println("Token valid for " + username + ": " + isValid);
            return isValid;
        } catch (Exception e) {
            System.err.println("Token validation error: " + e.getMessage());
            return false;
        }
    }
    
    public boolean isTokenValid(String token, String username) {
        try {
            final String extractedUsername = extractUsername(token);
            return extractedUsername.equals(username) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
<<<<<<< HEAD
    public boolean validateToken(String token, UserDetails userDetails) {
        return isTokenValid(token, userDetails);
    }
=======
    private boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            boolean expired = expiration.before(new Date());
            System.out.println("Token expiration: " + expiration + ", Expired: " + expired);
            return expired;
        } catch (ExpiredJwtException e) {
            System.out.println("Token is expired");
            return true;
        }
    }
    
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            System.out.println("Returning claims from expired token");
            return e.getClaims();
        }
    }
    
    private Key getSignInKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
}