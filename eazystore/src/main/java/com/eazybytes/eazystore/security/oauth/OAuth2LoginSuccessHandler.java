package com.eazybytes.eazystore.security.oauth;

import com.eazybytes.eazystore.entity.Customer;
import com.eazybytes.eazystore.entity.Role;
import com.eazybytes.eazystore.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final GoogleCustomerProvisioningService provisioningService;
    private final JwtUtil jwtUtil;

    @Value("${eazystore.oauth2.frontend-redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String frontendRedirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        if (!(authentication instanceof OAuth2AuthenticationToken oauth2AuthenticationToken)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unsupported authentication type");
            return;
        }

        String registrationId = oauth2AuthenticationToken.getAuthorizedClientRegistrationId();
        if (!"google".equalsIgnoreCase(registrationId)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unsupported OAuth2 provider");
            return;
        }

        OAuth2User oauth2User = oauth2AuthenticationToken.getPrincipal();
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String sub = oauth2User.getAttribute("sub");

        if (email == null || email.isBlank()) {
            String targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                    .queryParam("error", "missing_email")
                    .build().toUriString();
            response.sendRedirect(targetUrl);
            return;
        }

        Customer customer = provisioningService.findOrCreateCustomer(email, name, sub);

        Set<Role> roles = customer.getRoles();
        List<SimpleGrantedAuthority> authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .toList();

        var customerAuthentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                customer, null, authorities);

        String jwt = jwtUtil.generateJwtToken(customerAuthentication);

        String targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                .queryParam("token", jwt)
                .build().toUriString();

        response.sendRedirect(targetUrl);
    }
}
