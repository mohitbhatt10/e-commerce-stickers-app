package com.eazybytes.eazystore.security.oauth;

import com.eazybytes.eazystore.entity.Customer;
import com.eazybytes.eazystore.repository.CustomerRepository;
import com.eazybytes.eazystore.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GoogleCustomerProvisioningService {

    private final CustomerRepository customerRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public Customer findOrCreateCustomer(String email, String name, String providerUserId) {
        Customer customer = customerRepository.findByEmail(email).orElse(null);
        if (customer == null) {
            Customer newCustomer = new Customer();
            newCustomer.setEmail(email);
            newCustomer.setName(name != null && !name.isBlank() ? name : email);
            newCustomer.setAuthProvider("GOOGLE");
            newCustomer.setProviderUserId(providerUserId);
            roleRepository.findByName("ROLE_USER").ifPresent(role -> newCustomer.getRoles().add(role));
            newCustomer.setCreatedBy("GOOGLE_OAUTH2");
            return customerRepository.save(newCustomer);
        }

        boolean updated = false;
        if (customer.getAuthProvider() == null) {
            customer.setAuthProvider("GOOGLE");
            updated = true;
        }
        if (customer.getProviderUserId() == null && providerUserId != null && !providerUserId.isBlank()) {
            customer.setProviderUserId(providerUserId);
            updated = true;
        }
        if ((customer.getName() == null || customer.getName().isBlank()) && name != null && !name.isBlank()) {
            customer.setName(name);
            updated = true;
        }

        return updated ? customerRepository.save(customer) : customer;
    }
}
