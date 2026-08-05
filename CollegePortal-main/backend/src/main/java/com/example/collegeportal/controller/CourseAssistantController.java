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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

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
    private final String openaiKey = System.getenv("OPENAI_API_KEY");
    private final String chatModel = "gpt-3.5-turbo";

    @PostMapping(value = "/query", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> handleQuery(@RequestBody Map<String, Object> body) {
        try {
            String query = (String) body.getOrDefault("query", "");
            if (query == null || query.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "Query is required"));
            }

            // Build student profile string (optional)
            String profileText = "";
            if (body.containsKey("studentId")) {
                try {
                    Long sid = Long.parseLong(String.valueOf(body.get("studentId")));
                    Optional<User> uOpt = userRepository.findById(sid);
                    if (uOpt.isPresent()) {
                        User u = uOpt.get();
                        profileText = String.format("Student: %s (email: %s)\nRole: %s\n", u.getName(), u.getEmail(), u.getRole());
                    }
                } catch (Exception ignored) {}
            }

            // Accept optional profile fields from request
            if (body.containsKey("preferences")) profileText += "Preferences: " + String.valueOf(body.get("preferences")) + "\n";
            if (body.containsKey("score")) profileText += "Score/Marks: " + String.valueOf(body.get("score")) + "\n";

            // Retrieve top semantic snippets to provide context
            List<Map<String, Object>> snippets = List.of();
            try {
                Map<String, Object> searchResp = semanticSearchController.search(query, 6);
                if (Boolean.TRUE.equals(searchResp.get("ok"))) {
                    snippets = (List<Map<String, Object>>) searchResp.getOrDefault("results", List.of());
                }
            } catch (Exception e) {
                // ignore retrieval failures; proceed without snippets
            }

            // Prepare system and user messages
            StringBuilder system = new StringBuilder();
            system.append("You are a helpful college search assistant for students using a college portal. Focus on college profiles, location, fees, placements, accreditation, programs, eligibility and student preferences. When the user asks to compare colleges, provide a clear comparison with pros and cons for each institution, and indicate which college is a better fit for the student's goals. Use the provided structured college data and context snippets to answer accurately. Keep answers concise and student-friendly.\n");

            StringBuilder context = new StringBuilder();
            if (!profileText.isBlank()) {
                context.append("Student profile:\n").append(profileText).append("\n");
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

            String userMessage = "User query: " + query + "\n" + "Please answer as an assistant, focusing on colleges and their profiles. When relevant, recommend colleges and explain why they are a good fit for the student, including pros and cons. Also suggest next steps for the student to explore or apply.";

            List<College> collegeCandidates = pickCandidateColleges(body);
            if (!collegeCandidates.isEmpty()) {
                context.append("Available college profiles:\n");
                for (College c : collegeCandidates) {
                    context.append(String.format("- %s | Location: %s, %s | Type: %s | Category: %s | Cutoff: %s | Fees: %s-%s | Placement: %s%% | Accreditation: %s | Eligibility: %s\n",
                            c.getName(),
                            c.getCity() == null ? c.getLocation() : c.getCity(),
                            c.getState() == null ? "" : c.getState(),
                            c.getType() == null ? "N/A" : c.getType(),
                            c.getCategory() == null ? "N/A" : c.getCategory(),
                            c.getCutoff() == null ? "N/A" : String.format("%.1f", c.getCutoff()),
                            c.getMinFee() == null ? "N/A" : String.format("%.0f", c.getMinFee()),
                            c.getMaxFee() == null ? "N/A" : String.format("%.0f", c.getMaxFee()),
                            c.getPlacementPercentage() == null ? "N/A" : String.format("%.0f", c.getPlacementPercentage()),
                            c.getAccreditation() == null ? "N/A" : c.getAccreditation(),
                            c.getEligibilityCriteria() == null ? "N/A" : c.getEligibilityCriteria()));
                }
                context.append("\n");
            }

            if (openaiKey == null || openaiKey.isBlank()) {
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
                    .header("Authorization", "Bearer " + openaiKey)
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
        Double score = null;
        if (body.containsKey("score")) {
            try { score = Double.parseDouble(String.valueOf(body.get("score"))); } catch (Exception ignored) {}
        }

        List<College> all = collegeRepository.findAll();
        if (all == null) return List.of();

        List<College> filtered = new ArrayList<>(all);
        if (score != null) {
            List<College> tmp = new ArrayList<>();
            for (College c : filtered) {
                if (c.getCutoff() == null || c.getCutoff() <= score) tmp.add(c);
            }
            filtered = tmp;
        }

        filtered.sort((a, b) -> {
            Double ca = a.getCutoff() == null ? -1.0 : a.getCutoff();
            Double cb = b.getCutoff() == null ? -1.0 : b.getCutoff();
            return Double.compare(cb, ca);
        });
        return filtered.stream().limit(8).collect(Collectors.toList());
    }
}

