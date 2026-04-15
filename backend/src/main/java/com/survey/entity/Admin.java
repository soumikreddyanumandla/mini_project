package com.survey.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Admin entity — represents a registered admin user who can create and manage surveys.
 *
 * NOTE: @Builder is intentionally NOT used here because Lombok's generated
 * builder conflicts with UserDetails.getPassword() override. Use the
 * explicit no-args + setters pattern instead (provided by @Getter @Setter).
 */
@Entity
@Table(name = "admins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "password")
@EqualsAndHashCode(of = "id")
public class Admin implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /** Convenience factory used in AuthService instead of a builder. */
    public static Admin create(String fullName, String email, String encodedPassword) {
        Admin admin = new Admin();
        admin.setFullName(fullName);
        admin.setEmail(email);
        admin.setPassword(encodedPassword);
        return admin;
    }

    // --- UserDetails implementation ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    @Override public String getUsername()              { return email; }
    @Override public String getPassword()              { return password; }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}
