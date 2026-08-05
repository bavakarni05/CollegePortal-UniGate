package com.example.collegeportal.controller;

import com.example.collegeportal.model.College;
import com.example.collegeportal.model.Course;
import com.example.collegeportal.model.CourseRepository;
import com.example.collegeportal.model.User;
import com.example.collegeportal.repository.CollegeRepository;
import com.example.collegeportal.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/assistant")
public class CourseAssistantController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SemanticSearchController semanticSearchController;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(20)).build();

    @Value("${openai.api.key:${OPENAI_API_KEY:}}")
    private String openaiKey;

    @Value("${openai.model:${OPENAI_MODEL:gpt-4o-mini}}")
    private String chatModel;

    private String getEffectiveOpenaiKey() {
        if (openaiKey != null && !openaiKey.isBlank()) return openaiKey.trim();
        String envKey = System.getenv("OPENAI_API_KEY");
        return envKey != null ? envKey.trim() : null;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        String key = getEffectiveOpenaiKey();
        boolean configured = key != null && !key.isBlank();
        long collegeCount = collegeRepository.count();
        return ResponseEntity.ok(Map.of(
                "ok", true,
                "openaiConfigured", configured,
                "useFallback", !configured,
                "collegeCount", collegeCount
        ));
    }

    // Debug endpoint to list colleges visible to the assistant (safe, returns limited fields)
    @GetMapping("/colleges")
    public ResponseEntity<Map<String, Object>> listColleges() {
        try {
            List<College> all = collegeRepository.findAll();
            List<Map<String, Object>> out = all.stream().map(c -> Map.<String,Object>of(
                    "id", c.getId(),
                    "name", c.getName(),
                    "city", c.getCity(),
                    "state", c.getState(),
                    "cutoff", c.getCutoff(),
                    "minFee", c.getMinFee(),
                    "maxFee", c.getMaxFee(),
                    "placementPercentage", c.getPlacementPercentage()
            )).collect(Collectors.toList());
            return ResponseEntity.ok(Map.of("ok", true, "count", out.size(), "colleges", out));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("ok", false, "message", "Failed to list colleges: " + e.getMessage()));
        }
    }

    @PostMapping({"/query", "/assistant/query", ""})
    public ResponseEntity<Map<String, Object>> handleQuery(@RequestBody Map<String, Object> body) {
        try {
            String query = (String) body.getOrDefault("query", "");
            if (query == null || query.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "Query is required"));
            }

            String profileText = "";
            if (body.containsKey("studentId")) {
                try {
                    Long sid = Long.parseLong(String.valueOf(body.get("studentId")));
                    Optional<User> uOpt = userRepository.findById(sid);
                    if (uOpt.isPresent()) {
                        User u = uOpt.get();
                        profileText = String.format("Student: %s (email: %s)\nRole: %s\n", u.getName(), u.getEmail(), u.getRole());
                    }
                } catch (Exception ignored) {
                }
            }
            if (body.containsKey("preferences")) profileText += "Preferences: " + String.valueOf(body.get("preferences")) + "\n";
            if (body.containsKey("score")) profileText += "Score/Marks: " + String.valueOf(body.get("score")) + "\n";

            List<Map<String, Object>> snippets = List.of();
            try {
                Map<String, Object> searchResp = semanticSearchController.search(query, 6);
                if (Boolean.TRUE.equals(searchResp.get("ok"))) {
                    snippets = (List<Map<String, Object>>) searchResp.getOrDefault("results", List.of());
                }
            } catch (Exception e) {
                // ignore retrieval failures; proceed without snippets
            }
 
            StringBuilder system = new StringBuilder();
            system.append("You are a helpful college search assistant for students using a college portal. Use only the given college profile data and student preferences when answering. If you do not have enough verified information about a college, say so rather than guessing. When comparing colleges, give pros and cons for each college and recommend which is better for the student's goals.");
            system.append("\nAlways answer as a college advisor for students exploring admissions, courses, placements, fees, and eligibility.\n");
 
            StringBuilder context = new StringBuilder();
            if (!profileText.isBlank()) {
                context.append("Student profile:\n").append(profileText).append("\n\n");
            }
            if (!snippets.isEmpty()) {
                context.append("Context snippets from uploaded materials:\n");
                int i = 1;
                for (Map<String, Object> s : snippets) {
                    String fname = String.valueOf(s.getOrDefault("filename", ""));
                    String snippet = String.valueOf(s.getOrDefault("snippet", ""));
                    context.append(String.format("[%d] %s - %s\n", i++, fname, snippet.replaceAll("\n", " ")));
                }
                context.append("\n");
            }
 
            List<College> collegeCandidates = pickCandidateColleges(body);
            if (!collegeCandidates.isEmpty()) {
                context.append("Available college profiles (use these exact details in your response):\n");
                for (College c : collegeCandidates) {
                    context.append(buildCollegeContext(c)).append("\n");
                }
                context.append("\n");
            }
 
            String userMessage = "User query: " + query + "\n" + "Please answer as a college assistant. Use the provided college profile details and student preferences. Provide comparisons, pros and cons, and recommended next steps when appropriate.";

            String activeOpenaiKey = getEffectiveOpenaiKey();
            if (activeOpenaiKey == null || activeOpenaiKey.isBlank()) {
                StringBuilder fallback = new StringBuilder();
                fallback.append("(No OpenAI key configured — returning simple college-based recommendations)\n\n");
                fallback.append("Query: ").append(query).append("\n\n");
                if (!collegeCandidates.isEmpty()) {
                    fallback.append("Top college suggestions:\n");
                    for (College c : collegeCandidates) {
                        fallback.append(String.format("- %s: location=%s, cutoff=%s, fees=%s-%s, placement=%.0f%%\n",
                                c.getName(),
                                c.getCity() == null ? c.getLocation() : c.getCity(),
                                c.getCutoff() == null ? 0.0 : c.getCutoff(),
                                c.getMinFee() == null ? 0.0 : c.getMinFee(),
                                c.getMaxFee() == null ? 0.0 : c.getMaxFee(),
                                c.getPlacementPercentage() == null ? 0.0 : c.getPlacementPercentage()));
                    }
                } else {
                    fallback.append("No college data available to recommend.\n");
                }
                return ResponseEntity.ok(Map.of("ok", true, "answer", fallback.toString()));
            }

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", system.toString()));
            if (context.length() > 0) messages.add(Map.of("role", "system", "content", context.toString()));
            messages.add(Map.of("role", "user", "content", userMessage));

            Map<String, Object> req = Map.of(
                    "model", chatModel,
                    "messages", messages,
                    "temperature", 0.2
            );

            String reqBody = mapper.writeValueAsString(req);
            HttpRequest httpReq = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + activeOpenaiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(reqBody))
                    .build();

            HttpResponse<String> resp = httpClient.send(httpReq, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                return ResponseEntity.status(resp.statusCode()).body(Map.of("ok", false, "message", "OpenAI chat request failed: " + resp.body()));
            }

            JsonNode root = mapper.readTree(resp.body());
            String assistantText;
            try {
                assistantText = root.get("choices").get(0).get("message").get("content").asText();
            } catch (Exception e) {
                assistantText = root.toString();
            }

            Map<String, Object> result = new HashMap<>();
            result.put("ok", true);
            result.put("answer", assistantText);
            result.put("sources", snippets);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("ok", false, "message", "Assistant error: " + e.getMessage()));
        }
    }

    private List<College> pickCandidateColleges(Map<String, Object> body) {
       String query = String.valueOf(body.getOrDefault("query", "")).toLowerCase();
       String preferences = String.valueOf(body.getOrDefault("preferences", "")).toLowerCase();
       Double score = null;
       if (body.containsKey("score")) {
           try {
               score = Double.parseDouble(String.valueOf(body.get("score")));
           } catch (Exception ignored) {
           }
       }
 
       List<College> all = collegeRepository.findAll();
       if (all == null || all.isEmpty()) return List.of();
 
       List<College> matched = new ArrayList<>();
       matched.addAll(findCollegesByQueryTerms(query, all));
 
       if (matched.isEmpty() && (!preferences.isBlank() || score != null)) {
           for (College c : all) {
               if (matchesPreferences(c, preferences, query) || (score != null && (c.getCutoff() == null || c.getCutoff() <= score))) {
                   matched.add(c);
               }
           }
       }
 
       if (matched.isEmpty()) {
           matched.addAll(all.stream()
                   .sorted((a, b) -> {
                       Double ca = a.getCutoff() == null ? -1.0 : a.getCutoff();
                       Double cb = b.getCutoff() == null ? -1.0 : b.getCutoff();
                       return Double.compare(cb, ca);
                   })
                   .limit(6)
                   .collect(Collectors.toList()));
       }
 
       return matched.stream().distinct().limit(8).collect(Collectors.toList());
   }
 
   private List<College> findCollegesByQueryTerms(String query, List<College> all) {
       if (query == null || query.isBlank()) return List.of();
       String normalizedQuery = query.toLowerCase();
       List<String> terms = Arrays.stream(normalizedQuery.split("\\W+"))
               .filter(term -> !term.isBlank())
               .toList();
       if (terms.isEmpty()) return List.of();

       List<College> results = new ArrayList<>();
       for (College college : all) {
           String name = Optional.ofNullable(college.getName()).orElse("").toLowerCase();
           String shortName = Optional.ofNullable(college.getShortName()).orElse("").toLowerCase();
           String combined = (name + " " + shortName).trim();
           boolean matched = false;
           if (!name.isBlank() && (normalizedQuery.contains(name) || name.contains(normalizedQuery))) {
               matched = true;
           }
           if (!matched && !shortName.isBlank() && (normalizedQuery.contains(shortName) || shortName.contains(normalizedQuery))) {
               matched = true;
           }
           if (!matched) {
               for (String term : terms) {
                   if ((!name.isBlank() && name.contains(term)) || (!shortName.isBlank() && shortName.contains(term)) || (!combined.isBlank() && combined.contains(term))) {
                       matched = true;
                       break;
                   }
               }
           }
           if (matched) {
               results.add(college);
           }
       }
       return results;
   }
 
   private String buildCollegeContext(College c) {
       String location = c.getCity() != null && !c.getCity().isBlank() ? c.getCity() : c.getLocation();
       String region = location == null ? "" : location + (c.getState() != null && !c.getState().isBlank() ? ", " + c.getState() : "");
       String fees = (c.getMinFee() == null ? "N/A" : String.format("%.0f", c.getMinFee())) + " - " + (c.getMaxFee() == null ? "N/A" : String.format("%.0f", c.getMaxFee()));
       String cutoff = c.getCutoff() == null ? "N/A" : String.format("%.1f", c.getCutoff());
       String placement = c.getPlacementPercentage() == null ? "N/A" : String.format("%.0f%%", c.getPlacementPercentage());
       String avgPackage = c.getAvgPackage() == null ? "N/A" : String.format("%.2f", c.getAvgPackage());
       String highestPackage = c.getHighestPackage() == null ? "N/A" : String.format("%.2f", c.getHighestPackage());
       String facilities = c.getFacilities() == null ? "N/A" : c.getFacilities().replaceAll("\\s+", " ");
       String description = c.getDescription() == null ? "N/A" : c.getDescription().replaceAll("\\s+", " ");
       String eligibility = c.getEligibilityCriteria() == null ? "N/A" : c.getEligibilityCriteria().replaceAll("\\s+", " ");
       String recruiters = c.getTopRecruiters() == null ? "N/A" : c.getTopRecruiters().replaceAll("\\s+", " ");
       return String.format("- %s | Location: %s | Type: %s | Category: %s | Cutoff: %s | Fees: %s | Placement: %s | Accreditation: %s | AvgPackage: %s | HighestPackage: %s | Eligibility: %s | TopRecruiters: %s | Description: %s | Facilities: %s",
               c.getName(),
               region.isBlank() ? "N/A" : region,
               Optional.ofNullable(c.getType()).orElse("N/A"),
               Optional.ofNullable(c.getCategory()).orElse("N/A"),
               cutoff,
               fees,
               placement,
               Optional.ofNullable(c.getAccreditation()).orElse("N/A"),
               avgPackage,
               highestPackage,
               eligibility,
               recruiters,
               description,
               facilities);
   }
 
   private boolean matchesPreferences(College college, String preferences, String query) {
       if ((preferences == null || preferences.isBlank()) && (query == null || query.isBlank())) return false;
       String text = Stream.of(
                       college.getName(),
                       college.getShortName(),
                       college.getCategory(),
                       college.getType(),
                       college.getLocation(),
                       college.getCity(),
                       college.getState(),
                       college.getDescription(),
                       college.getFacilities(),
                       college.getAccreditation(),
                       college.getEligibilityCriteria())
               .filter(Objects::nonNull)
               .map(String::toLowerCase)
               .collect(Collectors.joining(" "));
 
       if (!preferences.isBlank()) {
           for (String token : preferences.split("\\W+")) {
               if (!token.isBlank() && text.contains(token)) return true;
           }
       }
       if (!query.isBlank()) {
           for (String token : query.split("\\W+")) {
               if (!token.isBlank() && text.contains(token)) return true;
           }
       }
       return false;
   }
}
