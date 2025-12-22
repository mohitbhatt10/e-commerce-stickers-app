package com.eazybytes.eazystore.config;

import com.eazybytes.eazystore.entity.Customer;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditorAwareImpl")
public class AuditorAwareImpl implements AuditorAware<String> {

    private static final int MAX_AUDITOR_LENGTH = 100;

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getPrincipal().equals("anonymousUser")) {
            return Optional.of("Anonymous user");
        }
        Object principal = authentication.getPrincipal();

        String auditor;
        if (principal instanceof Customer customer) {
            auditor = customer.getEmail();
        } else if (principal instanceof OAuth2User oauth2User) {
            String email = oauth2User.getAttribute("email");
            auditor = (email != null && !email.isBlank()) ? email : authentication.getName();
        } else if (principal instanceof UserDetails userDetails) {
            auditor = userDetails.getUsername();
        } else {
            auditor = authentication.getName();
        }

        if (auditor == null || auditor.isBlank()) {
            auditor = "Unknown";
        }

        auditor = auditor.trim();
        if (auditor.length() > MAX_AUDITOR_LENGTH) {
            auditor = auditor.substring(0, MAX_AUDITOR_LENGTH);
        }

        return Optional.of(auditor);
    }
}
