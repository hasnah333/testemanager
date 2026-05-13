package com.test.testmanagement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;

/**
 * Service d'upload d'images vers Cloudinary.
 * Utilise l'API REST Cloudinary avec signature SHA-1 (sans SDK tiers).
 */
@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    /**
     * Upload un fichier image vers Cloudinary et retourne l'URL sécurisée.
     *
     * @param file le fichier multipart à uploader
     * @return l'URL HTTPS de l'image sur Cloudinary
     * @throws RuntimeException en cas d'erreur d'upload
     */
    public String uploadImage(MultipartFile file) {
        try {
            String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
            String folder = "executions";

            // Paramètres à signer (ordre alphabétique obligatoire)
            Map<String, String> params = new TreeMap<>();
            params.put("folder", folder);
            params.put("timestamp", timestamp);

            String signature = generateSignature(params);

            // Construction de la requête multipart
            String boundary = "----FormBoundary" + System.currentTimeMillis();
            String uploadUrl = "https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload";

            HttpURLConnection conn = (HttpURLConnection) new URL(uploadUrl).openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (OutputStream out = conn.getOutputStream();
                 PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8), true)) {

                // Champ : api_key
                writeField(writer, out, boundary, "api_key", apiKey);
                // Champ : timestamp
                writeField(writer, out, boundary, "timestamp", timestamp);
                // Champ : folder
                writeField(writer, out, boundary, "folder", folder);
                // Champ : signature
                writeField(writer, out, boundary, "signature", signature);
                // Champ : file (binaire)
                writer.append("--").append(boundary).append("\r\n");
                writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"")
                      .append(file.getOriginalFilename()).append("\"").append("\r\n");
                writer.append("Content-Type: ").append(file.getContentType()).append("\r\n");
                writer.append("\r\n");
                writer.flush();
                out.write(file.getBytes());
                out.flush();
                writer.append("\r\n");

                // Fin du multipart
                writer.append("--").append(boundary).append("--").append("\r\n");
                writer.flush();
            }

            int responseCode = conn.getResponseCode();
            InputStream responseStream = responseCode == 200
                    ? conn.getInputStream()
                    : conn.getErrorStream();
            String responseBody = new String(responseStream.readAllBytes(), StandardCharsets.UTF_8);

            if (responseCode != 200) {
                throw new RuntimeException("Cloudinary upload failed [" + responseCode + "]: " + responseBody);
            }

            // Extraction de secure_url depuis la réponse JSON (sans dépendance externe)
            return extractJsonField(responseBody, "secure_url");

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'upload vers Cloudinary", e);
        }
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private void writeField(PrintWriter writer, OutputStream out, String boundary,
                            String name, String value) {
        writer.append("--").append(boundary).append("\r\n");
        writer.append("Content-Disposition: form-data; name=\"").append(name).append("\"").append("\r\n");
        writer.append("\r\n");
        writer.append(value).append("\r\n");
        writer.flush();
    }

    /**
     * Génère la signature HMAC-SHA1 requise par Cloudinary.
     * Format : SHA1( "param1=val1&param2=val2" + apiSecret )
     */
    private String generateSignature(Map<String, String> params) throws Exception {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0) sb.append("&");
            sb.append(entry.getKey()).append("=").append(entry.getValue());
        }
        sb.append(apiSecret);

        MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
        byte[] hash = sha1.digest(sb.toString().getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }

    /**
     * Extrait la valeur d'un champ d'une chaîne JSON simple (sans librairie).
     */
    private String extractJsonField(String json, String fieldName) {
        String key = "\"" + fieldName + "\":\"";
        int start = json.indexOf(key);
        if (start == -1) {
            throw new RuntimeException("Champ '" + fieldName + "' introuvable dans la réponse Cloudinary: " + json);
        }
        start += key.length();
        int end = json.indexOf("\"", start);
        // Cloudinary échappe les slashes → on les restitue
        return json.substring(start, end).replace("\\/", "/");
    }
}
