package com.example.collegeportal.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;
    private Long collegeId;
    private String collegeName;
    private String courseName;
    
    private String studentName;
    private String studentEmail;
    private String studentPhone;
    
    private Double tenthMark;
    private Double twelfthMark;
    private Double cutoffMark;
    
    private String tenthMarksheetPath;
    private String twelfthMarksheetPath;
    private String photoPath;
    
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getCollegeId() { return collegeId; }
    public void setCollegeId(Long collegeId) { this.collegeId = collegeId; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStudentPhone() { return studentPhone; }
    public void setStudentPhone(String studentPhone) { this.studentPhone = studentPhone; }

    public Double getTenthMark() { return tenthMark; }
    public void setTenthMark(Double tenthMark) { this.tenthMark = tenthMark; }

    public Double getTwelfthMark() { return twelfthMark; }
    public void setTwelfthMark(Double twelfthMark) { this.twelfthMark = twelfthMark; }

    public Double getCutoffMark() { return cutoffMark; }
    public void setCutoffMark(Double cutoffMark) { this.cutoffMark = cutoffMark; }

    public String getTenthMarksheetPath() { return tenthMarksheetPath; }
    public void setTenthMarksheetPath(String tenthMarksheetPath) { this.tenthMarksheetPath = tenthMarksheetPath; }

    public String getTwelfthMarksheetPath() { return twelfthMarksheetPath; }
    public void setTwelfthMarksheetPath(String twelfthMarksheetPath) { this.twelfthMarksheetPath = twelfthMarksheetPath; }

    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}