package com.casciz.commerceos.domain.user.repository;

import com.casciz.commerceos.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Data access port for the User aggregate.
 * The citext column type handles case-insensitive email lookup at the DB level.
 */
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :lastLoginAt WHERE u.id = :id")
    void updateLastLoginAt(@Param("id") UUID id, @Param("lastLoginAt") Instant lastLoginAt);

    @Modifying
    @Query("UPDATE User u SET u.emailVerified = true WHERE u.id = :id")
    void verifyEmail(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE User u SET u.passwordHash = :hash WHERE u.id = :id")
    void updatePasswordHash(@Param("id") UUID id, @Param("hash") String hash);
}
