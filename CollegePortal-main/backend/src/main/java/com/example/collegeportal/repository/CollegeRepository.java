package com.example.collegeportal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.collegeportal.model.College;

@Repository
public interface CollegeRepository extends JpaRepository<College, Long> {
    Optional<College> findByUserId(Long userId);
    Optional<College> findByName(String name);
    List<College> findAll();
}
