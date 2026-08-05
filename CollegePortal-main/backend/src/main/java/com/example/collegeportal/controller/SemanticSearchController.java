package com.example.collegeportal.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/semantic")
public class SemanticSearchController {

    private final Map<String, Document> docs = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(20)).build();
    private final String uploadsDir = "backend/uploads"; // relative to project root when running from project folder
    private final String openaiKey = System.getenv("OPENAI_API_KEY");
    private final String openaiModel = "text-embedding-3-small"; // changeable

    static class Document {
        public final String id;
        public final String filename;
        public final String text;
        public float[] embedding; // may be null if embeddings not available

        public Document(String id, String filename, String text) {
            this.id = id;
            this.filename = filename;
            this.text = text;
            this.embedding = null;
        }
    }

    public void init() {
        // Do not auto-index on startup to avoid slowing boot; keep method available.
    }

    @PostMapping(value = "/index", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> indexAll() throws IOException, InterruptedException {
        File dir = new File(uploadsDir);
        if (!dir.exists() || !dir.isDirectory()) {
            return Map.of("ok", false, "message", "uploads dir not found: " + dir.getAbsolutePath());
        }
        File[] files = dir.listFiles();
        if (files == null) files = new File[0];

        int indexed = 0;
        for (File f : files) {
            String name = f.getName();
            if (name.startsWith(".")) continue;
            String id = UUID.randomUUID().toString();
            String text = "";
            if (name.toLowerCase().endsWith(".pdf")) {
                try {
                    text = extractTextFromPdf(f);
                } catch (Exception e) {
                    text = "";
                }
            } else {
                // try to read as plain text for small other files
                try {
                    text = Files.readString(f.toPath(), StandardCharsets.UTF_8);
                } catch (Exception ignored) {
                    text = "";
                }
            }
            if (text == null) text = "";
            Document d = new Document(id, name, text);
            docs.put(id, d);
            indexed++;
        }

        // If OpenAI key present, request embeddings for each document (truncated to first 2000 chars)
        if (openaiKey != null && !openaiKey.isBlank()) {
            List<Document> toEmbed = docs.values().stream().filter(doc -> doc.embedding == null).collect(Collectors.toList());
            for (Document doc : toEmbed) {
                String inputText = doc.text;
                if (inputText.length() > 2000) inputText = inputText.substring(0, 2000);
                try {
                    float[] emb = getEmbeddingFromOpenAI(inputText);
                    doc.embedding = emb;
                } catch (Exception e) {
                    // ignore embedding failures; leave as null
                }
            }
        }

        return Map.of("ok", true, "indexed", indexed, "haveEmbeddings", openaiKey != null && !openaiKey.isBlank());
    }

    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> search(@RequestParam("q") String q, @RequestParam(value = "k", required = false, defaultValue = "5") int k) throws IOException, InterruptedException {
        if (q == null || q.isBlank()) return Map.of("ok", false, "results", List.of());

        boolean embeddingsAvailable = openaiKey != null && !openaiKey.isBlank() && docs.values().stream().anyMatch(d -> d.embedding != null);

        List<Map<String, Object>> results;
        if (embeddingsAvailable) {
            float[] qEmb = getEmbeddingFromOpenAI(q.length() > 2000 ? q.substring(0, 2000) : q);
            // compute cosine similarities
            results = docs.values().stream()
                    .filter(d -> d.embedding != null)
                    .map(d -> Map.<String, Object>of(
                            "id", d.id,
                            "filename", d.filename,
                            "score", cosineSimilarity(qEmb, d.embedding),
                            "snippet", makeSnippet(d.text, q)
                    ))
                    .sorted((a, b) -> Double.compare((Double) b.get("score"), (Double) a.get("score")))
                    .limit(k)
                    .collect(Collectors.toList());
        } else {
            // fallback: simple token overlap scoring
            String[] qTerms = q.toLowerCase().split("\\W+");
            Set<String> qSet = Arrays.stream(qTerms).filter(s -> !s.isBlank()).collect(Collectors.toSet());
            results = docs.values().stream()
                    .map(d -> {
                        String txt = d.text == null ? "" : d.text.toLowerCase();
                        int matches = 0;
                        for (String t : qSet) if (!t.isBlank() && txt.contains(t)) matches++;
                        double score = matches / (double) Math.max(1, qSet.size());
                        return Map.<String, Object>of(
                                "id", d.id,
                                "filename", d.filename,
                                "score", score,
                                "snippet", makeSnippet(d.text, q)
                        );
                    })
                    .filter(m -> ((Double) m.get("score")) > 0)
                    .sorted((a, b) -> Double.compare((Double) b.get("score"), (Double) a.get("score")))
                    .limit(k)
                    .collect(Collectors.toList());
        }

        return Map.of("ok", true, "query", q, "results", results);
    }

    private String makeSnippet(String text, String q) {
        if (text == null || text.isBlank()) return "";
        String lower = text.toLowerCase();
        String ql = q.toLowerCase().split("\\W+")[0];
        int idx = lower.indexOf(ql);
        if (idx < 0) return text.length() > 300 ? text.substring(0, 300) + "..." : text;
        int start = Math.max(0, idx - 80);
        int end = Math.min(text.length(), idx + 220);
        String snip = text.substring(start, end);
        if (start > 0) snip = "..." + snip;
        if (end < text.length()) snip = snip + "...";
        return snip.replaceAll("\\s+", " ");
    }

    private String extractTextFromPdf(File f) throws IOException {
        try (PDDocument doc = PDDocument.load(f)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private float[] getEmbeddingFromOpenAI(String input) throws IOException, InterruptedException {
        if (openaiKey == null || openaiKey.isBlank()) throw new IllegalStateException("OpenAI key not configured");
        Map<String, Object> body = new HashMap<>();
        body.put("input", input);
        body.put("model", openaiModel);
        String reqBody = mapper.writeValueAsString(body);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/embeddings"))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + openaiKey)
                .POST(HttpRequest.BodyPublishers.ofString(reqBody))
                .build();

        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) {
            throw new IOException("OpenAI embedding request failed: " + resp.body());
        }
        JsonNode node = mapper.readTree(resp.body());
        JsonNode data = node.get("data");
        if (data == null || !data.isArray() || data.size() == 0) throw new IOException("No embedding in response");
        JsonNode embNode = data.get(0).get("embedding");
        float[] emb = new float[embNode.size()];
        for (int i = 0; i < embNode.size(); i++) emb[i] = (float) embNode.get(i).asDouble();
        return emb;
    }

    private double cosineSimilarity(float[] a, float[] b) {
        if (a == null || b == null) return 0.0;
        int n = Math.min(a.length, b.length);
        double dot = 0.0, na = 0.0, nb = 0.0;
        for (int i = 0; i < n; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        if (na == 0 || nb == 0) return 0.0;
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }
}
