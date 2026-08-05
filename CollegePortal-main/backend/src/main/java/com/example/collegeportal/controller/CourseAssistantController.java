package com.example.collegeportal.controller;

import com.example.collegeportal.model.Course;
import com.example.collegeportal.model.CourseRepository;
import com.example.collegeportal.model.User;
import com.example.collegeportal.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
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
    private UserRepository userRepository;

    @Autowired
    private SemanticSearchController semanticSearchController;

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(20)).build();
    private final String openaiKey = System.getenv("OPENAI_API_KEY");
    private final String chatModel = "gpt-3.5-turbo";

    @PostMapping(value = "/query", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> handleQuery(@RequestBody Map<String, Object> body) throws IOException, InterruptedException {
        String query = (String) body.getOrDefault("query", "");
        if (query == null || query.isBlank()) return Map.of("ok", false, "message", "Query is required");

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
        system.append("You are a helpful academic advisor bot for a college portal. Use provided context from course materials and the student's profile to answer and recommend courses. When recommending, explain why a course suits the student and compare alternatives. Always mention sources when possible from the provided snippets. Keep answers concise and actionable.\n");

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

        String userMessage = "User query: " + query + "\n" + "Please answer as an assistant and provide up to 5 recommended courses (name, college, why it's a fit, estimated cutoff/fees if known). Also suggest next steps for the student to apply or learn more.";

        // Include simple course list as structured context (top candidates by cutoff if score provided)
        List<Course> courseCandidates = pickCandidateCourses(body);
        if (!courseCandidates.isEmpty()) {
            context.append("Available course samples:\n");
            for (Course c : courseCandidates) {
                context.append(String.format("- %s (collegeId=%d) | Cutoff=%.2f | Fees=%.2f | Eligibility=%s\n",
                        c.getName(), c.getCollegeId(), c.getCutoff() == null ? 0.0 : c.getCutoff(), c.getFees() == null ? 0.0 : c.getFees(), c.getEligibility()));
            }
            context.append("\n");
        }

        // If OpenAI key missing, return fallback: basic suggestions using courseCandidates and token matching
        if (openaiKey == null || openaiKey.isBlank()) {
            // Build a simple textual suggestion
            StringBuilder fallback = new StringBuilder();
            fallback.append("(No OpenAI key configured — returning simple candidate-based recommendations)\n\n");
            fallback.append("Query: ").append(query).append("\n\n");
            if (!courseCandidates.isEmpty()) {
                fallback.append("Top candidates:\n");
                for (Course c : courseCandidates) {
                    fallback.append(String.format("- %s (College %d): cutoff=%.2f, fees=%.2f\n", c.getName(), c.getCollegeId(), c.getCutoff() == null ? 0.0 : c.getCutoff(), c.getFees() == null ? 0.0 : c.getFees()));
                }
            } else {
                fallback.append("No course data available to recommend.\n");
            }
            return Map.of("ok", true, "answer", fallback.toString());
        }

        // Build chat request
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
            return Map.of("ok", false, "message", "OpenAI chat request failed: " + resp.body());
        }

        JsonNode root = mapper.readTree(resp.body());
        String assistantText = "";
        try {
            assistantText = root.get("choices").get(0).get("message").get("content").asText();
        } catch (Exception e) {
            assistantText = root.toString();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("ok", true);
        result.put("answer", assistantText);
        result.put("sources", snippets);
        return result;
    }

    private List<Course> pickCandidateCourses(Map<String, Object> body) {
        // Simple candidate selection: if score provided, pick courses with cutoff <= score (or null cutoff)
        Double score = null;
        if (body.containsKey("score")) {
            try { score = Double.parseDouble(String.valueOf(body.get("score"))); } catch (Exception ignored) {}
        }

        List<Course> all = courseRepository.findAll();
        if (all == null) return List.of();

        List<Course> filtered = new ArrayList<>(all);
        if (score != null) {
            List<Course> tmp = new ArrayList<>();
            for (Course c : filtered) {
                if (c.getCutoff() == null || c.getCutoff() <= score) tmp.add(c);
            }
            filtered = tmp;
        }
        // sort by cutoff desc so higher-quality fits first (nulls go last)
        filtered.sort((a, b) -> {
            Double ca = a.getCutoff() == null ? -1.0 : a.getCutoff();
            Double cb = b.getCutoff() == null ? -1.0 : b.getCutoff();
            return Double.compare(cb, ca);
        });
        return filtered.stream().limit(8).collect(Collectors.toList());
    }
}
