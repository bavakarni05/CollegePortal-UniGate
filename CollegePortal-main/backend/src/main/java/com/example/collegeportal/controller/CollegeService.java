package com.example.collegeportal.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.collegeportal.model.Application;
import com.example.collegeportal.model.ApplicationRepository;
import com.example.collegeportal.model.Course;
import com.example.collegeportal.model.CourseRepository;

@Service
public class CollegeService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Transactional
    public void updateApplicationStatus(Long id, String status) {
        Optional<Application> appOpt = applicationRepository.findById(id);
        if (appOpt.isEmpty()) return;

        Application app = appOpt.get();
        String oldStatus = app.getStatus();
        app.setStatus(status);
        applicationRepository.save(app);

        // Handle seat management logic
        if ("ACCEPTED".equals(status) && !"ACCEPTED".equals(oldStatus)) {
            updateCourseSeats(app, -1);
        } else if ("ACCEPTED".equals(oldStatus) && !"ACCEPTED".equals(status)) {
            updateCourseSeats(app, 1);
            handleWaitingList(app);
        }
    }

    private void updateCourseSeats(Application app, int delta) {
        List<Course> courses = courseRepository.findByCollegeId(app.getCollegeId());
        for (Course course : courses) {
            String fullCourseName = course.getName() + " (" + (course.getQuota() != null ? course.getQuota() : "N/A") + ")";
            if (fullCourseName.equals(app.getCourseName())) {
                Integer currentSeats = (course.getSeats() != null) ? course.getSeats() : 0;
                course.setSeats(Math.max(0, currentSeats + delta));
                courseRepository.save(course);
                break;
            }
        }
    }

    private void handleWaitingList(Application app) {
        List<Application> waiting = applicationRepository.findByCollegeIdAndCourseNameAndStatusOrderByIdAsc(app.getCollegeId(), app.getCourseName(), "WAITING_LIST");
        if (!waiting.isEmpty()) {
            Application nextInLine = waiting.get(0);
            nextInLine.setStatus("PENDING");
            applicationRepository.save(nextInLine);
        }
    }
}