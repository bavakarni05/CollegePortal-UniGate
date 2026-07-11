package com.example.collegeportal.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.collegeportal.model.Application;
import com.example.collegeportal.model.ApplicationRepository;
import com.example.collegeportal.model.College;
import com.example.collegeportal.model.Course;
import com.example.collegeportal.model.CourseRepository;
import com.example.collegeportal.model.User;
import com.example.collegeportal.repository.CollegeRepository;
import com.example.collegeportal.repository.UserRepository;
import com.example.collegeportal.security.JwtUtil;


@RestController
@RequestMapping("/api/college")
@CrossOrigin(origins = "https://collegeportal2.netlify.app", allowedHeaders = "*")
public class CollegeController {

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private CollegeService collegeService;

    // Get current college profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
            }

            String jwt = token.substring(7);
            Long userId = Long.parseLong(jwtUtil.parseToken(jwt).getBody().getSubject());

            Optional<College> college = collegeRepository.findByUserId(userId);
            if (college.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "College profile not found"));
            }

            return ResponseEntity.ok(college.get());
        } catch (Exception e) {
            String msg = (e.getMessage() != null) ? e.getMessage() : "Invalid token or session expired";
            return ResponseEntity.status(401).body(Map.of("error", msg));
        }
    }

    // Create or update college profile
    @PostMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String token, @RequestBody Map<String, Object> data) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
            }

            String jwt = token.substring(7);
            Long userId = Long.parseLong(jwtUtil.parseToken(jwt).getBody().getSubject());

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty() || !userOpt.get().getRole().equals("COLLEGE")) {
                return ResponseEntity.status(403).body(Map.of("error", "Only colleges can update profile"));
            }

            Optional<College> collegeOpt = collegeRepository.findByUserId(userId);
            College college = collegeOpt.orElseGet(() -> {
                College newCollege = new College();
                newCollege.setUserId(userId);
                User user = userOpt.get();
                newCollege.setName(user.getCollegeName());
                return newCollege;
            });

            if (data.containsKey("name")) {
                String name = (String) data.get("name");
                if (name != null && !name.trim().isEmpty()) college.setName(name);
            }
            if (data.containsKey("description")) college.setDescription((String) data.get("description"));
            if (data.containsKey("location")) college.setLocation((String) data.get("location"));
            if (data.containsKey("city")) college.setCity((String) data.get("city"));
            if (data.containsKey("state")) college.setState((String) data.get("state"));
            if (data.containsKey("category")) college.setCategory((String) data.get("category"));
            if (data.containsKey("facilities")) college.setFacilities((String) data.get("facilities"));
            if (data.containsKey("website")) college.setWebsite((String) data.get("website"));
            if (data.containsKey("contactPhone")) college.setContactPhone((String) data.get("contactPhone"));
            if (data.containsKey("contactEmail")) college.setContactEmail((String) data.get("contactEmail"));
            if (data.containsKey("establishedYear")) {
                Object val = data.get("establishedYear");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setEstablishedYear(Double.valueOf(val.toString()).intValue()); } catch (Exception e) {}
                } else { college.setEstablishedYear(null); }
            }
            if (data.containsKey("imagePath")) college.setImagePath((String) data.get("imagePath"));
            if (data.containsKey("nirf")) {
                Object val = data.get("nirf");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setNirf(Double.valueOf(val.toString()).intValue()); } catch (Exception e) {}
                } else { college.setNirf(null); }
            }
            if (data.containsKey("accreditation")) college.setAccreditation((String) data.get("accreditation"));
            if (data.containsKey("type")) college.setType((String) data.get("type"));
            if (data.containsKey("avgPackage")) {
                Object val = data.get("avgPackage");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setAvgPackage(Double.valueOf(val.toString())); } catch (Exception e) {}
                } else { college.setAvgPackage(null); }
            }
            if (data.containsKey("highestPackage")) {
                Object val = data.get("highestPackage");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setHighestPackage(Double.valueOf(val.toString())); } catch (Exception e) {}
                } else { college.setHighestPackage(null); }
            }
            if (data.containsKey("placementPercentage")) {
                Object val = data.get("placementPercentage");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setPlacementPercentage(Double.valueOf(val.toString())); } catch (Exception e) {}
                } else { college.setPlacementPercentage(null); }
            }
            if (data.containsKey("minFee")) {
                Object val = data.get("minFee");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setMinFee(Double.valueOf(val.toString())); } catch (Exception e) {}
                } else { college.setMinFee(null); }
            }
            if (data.containsKey("maxFee")) {
                Object val = data.get("maxFee");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setMaxFee(Double.valueOf(val.toString())); } catch (Exception e) {}
                } else { college.setMaxFee(null); }
            }
            if (data.containsKey("totalSeats")) {
                Object val = data.get("totalSeats");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setTotalSeats(Double.valueOf(val.toString()).intValue()); } catch (Exception e) {}
                } else { college.setTotalSeats(null); }
            }
            if (data.containsKey("cutoff")) {
                Object val = data.get("cutoff");
                if (val != null && !val.toString().trim().isEmpty()) {
                    try { college.setCutoff(Double.valueOf(val.toString())); } catch (Exception e) {}
                } else { college.setCutoff(null); }
            }
            if (data.containsKey("logoPath")) college.setLogoPath((String) data.get("logoPath"));
            if (data.containsKey("shortName")) college.setShortName((String) data.get("shortName"));
            if (data.containsKey("topRecruiters")) college.setTopRecruiters((String) data.get("topRecruiters"));
            if (data.containsKey("gallery")) college.setGallery((String) data.get("gallery"));
            if (data.containsKey("eligibilityCriteria")) college.setEligibilityCriteria((String) data.get("eligibilityCriteria"));

            College saved = collegeRepository.save(college);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "College profile updated successfully");
            response.put("college", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            e.printStackTrace();
            String msg = (e.getMessage() != null) ? e.getMessage() : "An unexpected database error occurred";
            error.put("error", "Database error: " + msg);
            return ResponseEntity.status(500).body(error);
        }
    }

    // Apply for a course and automatically update seats
    @PostMapping(value = "/apply", consumes = "multipart/form-data")
    public ResponseEntity<?> apply(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam Long collegeId,
            @RequestParam String courseName,
            @RequestParam String quota,
            @RequestParam String studentName,
            @RequestParam String studentEmail,
            @RequestParam(required = false) String studentPhone,
            @RequestParam Double tenthMark,
            @RequestParam Double twelfthMark,
            @RequestParam Double cutoffMark,
            @RequestParam(required = false) MultipartFile tenthMarksheet,
            @RequestParam(required = false) MultipartFile twelfthMarksheet,
            @RequestParam(required = false) MultipartFile photo) {
        try {
            System.out.println("Received application request for college: " + collegeId + " from: " + studentEmail);

            Optional<College> collegeOpt = collegeRepository.findById(collegeId);
            if (collegeOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "College not found"));
            College college = collegeOpt.get();

            List<Course> courses = courseRepository.findByCollegeId(collegeId);
            // More efficient duplicate check using repository query
            String fullCourseName = courseName + " (" + quota + ")";
            Course selectedCourse = courses.stream()
                .filter(c -> (c.getName() + " (" + (c.getQuota() != null ? c.getQuota() : "N/A") + ")").equals(fullCourseName))
                .findFirst().orElse(null);

            System.out.println("Processing application for course: " + fullCourseName);
            if (applicationRepository.existsByCollegeIdAndCourseNameAndStudentEmailIgnoreCase(collegeId, fullCourseName, studentEmail)) {
                System.out.println("Duplicate application detected for: " + studentEmail);
                return ResponseEntity.status(409).body(Map.of("error", "You have already applied for this course at this college."));
            }
            
            Application app = new Application();
            
            if (token != null && token.startsWith("Bearer ")) {
                try {
                    String jwt = token.substring(7);
                    Long userId = Long.parseLong(jwtUtil.parseToken(jwt).getBody().getSubject());
                    app.setStudentId(userId);
                } catch (Exception e) { /* continue as guest if token invalid */ }
            }

            app.setCollegeId(collegeId);
            app.setCollegeName(college.getName());
            app.setCourseName(fullCourseName);
            
            // Safe check: If course is not found, we shouldn't proceed. 
            if (selectedCourse == null) {
                System.err.println("Course not found matching: " + fullCourseName);
                return ResponseEntity.status(404).body(Map.of("error", "Selected course configuration not found."));
            }

            Integer currentSeats = (selectedCourse.getSeats() != null) ? selectedCourse.getSeats() : 0;
            if (currentSeats > 0) {
                app.setStatus("PENDING");
                selectedCourse.setSeats(currentSeats - 1);
                courseRepository.save(selectedCourse);
            } else {
                app.setStatus("WAITING_LIST");
            }
            
            app.setStudentName(studentName);
            app.setStudentEmail(studentEmail);
            app.setStudentPhone(studentPhone);
            app.setTenthMark(tenthMark);
            app.setTwelfthMark(twelfthMark);
            app.setCutoffMark(cutoffMark);
            
            try {
                if (tenthMarksheet != null && !tenthMarksheet.isEmpty()) {
                    System.out.println("Uploading 10th marksheet...");
                    app.setTenthMarksheetPath(cloudinaryService.uploadFile(tenthMarksheet));
                }
                if (twelfthMarksheet != null && !twelfthMarksheet.isEmpty()) {
                    System.out.println("Uploading 12th marksheet...");
                    app.setTwelfthMarksheetPath(cloudinaryService.uploadFile(twelfthMarksheet));
                }
                if (photo != null && !photo.isEmpty()) {
                    System.out.println("Uploading photo...");
                    app.setPhotoPath(cloudinaryService.uploadFile(photo));
                }
            } catch (Exception cloudErr) {
                System.err.println("Cloudinary Upload Error: " + cloudErr.getMessage());
                // We can choose to continue without files or return error
                return ResponseEntity.status(500).body(Map.of("error", "File upload failed. Please check your Cloudinary configuration."));
            }
            
            applicationRepository.save(app);
            System.out.println("Application saved successfully for: " + studentEmail);
            return ResponseEntity.ok(Map.of("message", "Application submitted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            String msg = (e.getMessage() != null) ? e.getMessage() : "Internal server error";
            return ResponseEntity.status(500).body(Map.of("error", msg));
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(@RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
            }
            String jwt = token.substring(7);
            Long userId = Long.parseLong(jwtUtil.parseToken(jwt).getBody().getSubject());
            Optional<College> college = collegeRepository.findByUserId(userId);
            if (college.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "College not found"));
            return ResponseEntity.ok(applicationRepository.findByCollegeId(college.get().getId()));
        } catch (Exception e) {
            String msg = (e.getMessage() != null) ? e.getMessage() : "Failed to fetch applications";
            return ResponseEntity.status(500).body(Map.of("error", msg));
        }
    }

    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(@RequestHeader("Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
            }
            String jwt = token.substring(7);
            Long userId = Long.parseLong(jwtUtil.parseToken(jwt).getBody().getSubject());
            return ResponseEntity.ok(applicationRepository.findByStudentId(userId));
        } catch (Exception e) {
            String msg = (e.getMessage() != null) ? e.getMessage() : "Failed to fetch your applications";
            return ResponseEntity.status(500).body(Map.of("error", msg));
        }
    }

    @PostMapping("/applications/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> data) {
        try {
            String status = data.get("status");
            
            // Seat increment logic for cancellation
            if ("CANCELLED".equalsIgnoreCase(status)) {
                Optional<Application> appOpt = applicationRepository.findById(id);
                if (appOpt.isPresent()) {
                    Application app = appOpt.get();
                    // Only increment if it was occupying a seat (PENDING or ACCEPTED)
                    if ("PENDING".equalsIgnoreCase(app.getStatus()) || "ACCEPTED".equalsIgnoreCase(app.getStatus())) {
                        List<Course> courses = courseRepository.findByCollegeId(app.getCollegeId());
                        courses.stream()
                            .filter(c -> (c.getName() + " (" + (c.getQuota() != null ? c.getQuota() : "N/A") + ")").equals(app.getCourseName()))
                            .findFirst()
                            .ifPresent(c -> {
                                c.setSeats((c.getSeats() != null ? c.getSeats() : 0) + 1);
                                courseRepository.save(c);
                            });
                    }
                }
            }

            collegeService.updateApplicationStatus(id, status);
            return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
        } catch (Exception e) {
            String msg = (e.getMessage() != null) ? e.getMessage() : "Unknown error";
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update status: " + msg));
        }
    }

    // Course Catalog Endpoints
    @GetMapping("/{collegeId}/courses")
    public ResponseEntity<?> getCourses(@PathVariable Long collegeId) {
        return ResponseEntity.ok(courseRepository.findByCollegeId(collegeId));
    }

    @PostMapping("/courses")
    public ResponseEntity<?> updateCourse(@RequestHeader("Authorization") String token, @RequestBody Course course) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid token"));
            }
            String jwt = token.substring(7);
            Long userId = Long.parseLong(jwtUtil.parseToken(jwt).getBody().getSubject());
            Optional<College> college = collegeRepository.findByUserId(userId);
            if (college.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "College not found"));
            
            course.setCollegeId(college.get().getId());
            return ResponseEntity.ok(courseRepository.save(course));
        } catch (Exception e) {
            String msg = (e.getMessage() != null) ? e.getMessage() : "Failed to update course";
            return ResponseEntity.status(500).body(Map.of("error", msg));
        }
    }

    @PostMapping("/courses/delete/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Course deleted"));
    }

    // Get all colleges (for student search)
    @GetMapping("/list")
    public ResponseEntity<?> getAllColleges(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer maxNirf,
            @RequestParam(required = false) Double minPlacement,
            @RequestParam(required = false) Double maxFee,
            @RequestParam(required = false) Double maxCutoff,
            @RequestParam(required = false, defaultValue = "false") boolean recommend) {
        try {
            List<College> colleges = collegeRepository.findAll();
            Stream<College> stream = colleges.stream();

            if (recommend) {
                // Logical OR for profile-based recommendation details
                final String fCity = city;
                final Double fMaxFee = maxFee;
                final Double fMaxCutoff = maxCutoff;

                boolean hasProfileData = (fCity != null && !fCity.isEmpty() && !"All".equalsIgnoreCase(fCity)) || 
                                         fMaxFee != null || fMaxCutoff != null;

                if (hasProfileData) {
                    stream = stream.filter(c -> {
                        if (fCity != null && !fCity.isEmpty() && !"All".equalsIgnoreCase(fCity) && fCity.equalsIgnoreCase(c.getCity())) return true;
                        if (fMaxFee != null && ((c.getMinFee() != null && c.getMinFee() <= fMaxFee) || (c.getMaxFee() != null && c.getMaxFee() <= fMaxFee))) return true;
                        if (fMaxCutoff != null && c.getCutoff() != null && c.getCutoff() <= fMaxCutoff) return true;
                        return false;
                    });
                }
            } else {
                // Standard Logical AND for search filters
                if (category != null && !category.isEmpty() && !"All".equalsIgnoreCase(category)) {
                    stream = stream.filter(c -> category.equalsIgnoreCase(c.getCategory()));
                }
                if (type != null && !type.isEmpty() && !"All".equalsIgnoreCase(type)) {
                    stream = stream.filter(c -> type.equalsIgnoreCase(c.getType()));
                }
                if (city != null && !city.isEmpty() && !"All".equalsIgnoreCase(city)) {
                    stream = stream.filter(c -> city.equalsIgnoreCase(c.getCity()));
                }
                if (maxNirf != null) {
                    stream = stream.filter(c -> c.getNirf() != null && c.getNirf() <= maxNirf);
                }
                if (minPlacement != null) {
                    stream = stream.filter(c -> c.getPlacementPercentage() != null && c.getPlacementPercentage() >= minPlacement);
                }
                if (maxFee != null) {
                    stream = stream.filter(c -> (c.getMinFee() != null && c.getMinFee() <= maxFee) || 
                                               (c.getMaxFee() != null && c.getMaxFee() <= maxFee));
                }
                if (maxCutoff != null) {
                    stream = stream.filter(c -> c.getCutoff() != null && c.getCutoff() <= maxCutoff);
                }
            }

            return ResponseEntity.ok(stream.collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching colleges: " + e.getMessage()));
        }
    }

    // Get specific college details
    @GetMapping("/{collegeId}")
    public ResponseEntity<?> getCollege(@PathVariable Long collegeId) {
        try {
            Optional<College> college = collegeRepository.findById(collegeId);
            if (college.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "College not found"));
            }
            return ResponseEntity.ok(college.get());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching college: " + e.getMessage()));
        }
    }
}
