package com.grade12.backend.service;

import com.grade12.backend.model.User;
import com.grade12.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("Loading user by email: " + email);
        
        User user = userRepository.findByEmail(email)
<<<<<<< HEAD
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
=======
                .orElseThrow(() -> {
                    System.err.println("User not found with email: " + email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });

>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
        System.out.println("User found: " + user.getEmail() + ", Category: " + user.getCategory());
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword() != null ? user.getPassword() : "")
                .roles(user.getCategory() != null ? user.getCategory().toUpperCase() : "USER")
                .build();
    }
}