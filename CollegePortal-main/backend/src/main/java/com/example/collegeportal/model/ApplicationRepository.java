package com.example.collegeportal.model;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCollegeId(Long collegeId);
    List<Application> findByStudentId(Long studentId);
    Optional<Application> findByStudentIdAndCollegeIdAndCourseName(Long studentId, Long collegeId, String courseName);
    boolean existsByCollegeIdAndCourseNameAndStudentEmailIgnoreCase(Long collegeId, String courseName, String studentEmail);
    List<Application> findByCollegeIdAndCourseNameAndStatusOrderByIdAsc(Long collegeId, String courseName, String status);
}