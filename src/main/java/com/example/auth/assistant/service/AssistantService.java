package com.example.auth.assistant.service;

import com.example.auth.assistant.dto.AssistantChatRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AssistantService {

    private static final Logger log = LoggerFactory.getLogger(AssistantService.class);

    private static final String SYSTEM_PROMPT = """
            Sen bir e-ticaret müşteri destek asistanısın. Türkçe konuş. Kullanıcıya kısa, net ve yardımcı cevap ver. \
            Sipariş, iade, kampanya, ürün önerisi, kategori yönlendirme ve hesap işlemleri hakkında yardımcı ol. \
            Emin olmadığın konularda kullanıcıyı müşteri hizmetlerine veya ilgili sayfaya yönlendir. \
            Gerçek sipariş verisi veya API erişimin yoksa sipariş numarası, kargo durumu veya tutar uydurma. \
            "Siparişim nerede" gibi sorularda: kullanıcının giriş yapması veya "Siparişlerim" / hesap bölümünü kontrol etmesi gerektiğini söyle. \
            İade ve iptal için genel prosedürü (iade süresi, ürünün kullanılmamış olması, iletişim kanalları) özetle; kesin kurallar için müşteri hizmetlerine yönlendir. \
            Ürün önerisi istenirse bağlamdaki sayfa, sepet veya kategori bilgisini dikkate al; site dışı marka uydurma.""";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model:qwen2.5:3b}")
    private String ollamaModel;

    public String chat(AssistantChatRequest request) {
        String userContent = buildUserContent(request);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", ollamaModel);
        body.put("stream", false);
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
        messages.add(Map.of("role", "user", "content", userContent));
        body.put("messages", messages);

        String url = ollamaBaseUrl.replaceAll("/$", "") + "/api/chat";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, entity, JsonNode.class);
            JsonNode root = response.getBody();
            if (root == null) {
                return fallbackReply();
            }
            String content = root.path("message").path("content").asText("").trim();
            if (content.isEmpty()) {
                return fallbackReply();
            }
            return content;
        } catch (RestClientException e) {
            log.warn("Ollama chat failed: {}", e.getMessage());
            return ollamaUnavailableReply();
        } catch (Exception e) {
            log.error("Assistant error", e);
            return fallbackReply();
        }
    }

    private String buildUserContent(AssistantChatRequest request) {
        StringBuilder sb = new StringBuilder(request.getMessage().trim());
        Map<String, Object> ctx = request.getContext();
        if (ctx != null && !ctx.isEmpty()) {
            try {
                sb.append("\n\n[Kullanıcı arayüzü bağlamı (JSON): ")
                        .append(objectMapper.writeValueAsString(ctx))
                        .append("]");
            } catch (Exception e) {
                sb.append("\n\n[Bağlam özeti mevcut ama serileştirilemedi.]");
            }
        }
        return sb.toString();
    }

    private static String ollamaUnavailableReply() {
        return "Şu an yapay zeka asistanına bağlanılamıyor. Lütfen daha sonra tekrar deneyin veya "
                + "sipariş ve iade işlemleri için hesabınızdaki “Siparişlerim” bölümünü veya müşteri hizmetlerini kullanın.";
    }

    private static String fallbackReply() {
        return "Yanıt oluşturulamadı. Sorunuzu kısaca tekrar yazar mısınız? Sipariş takibi için giriş yapıp “Siparişlerim” sayfasına bakmanızı öneririm.";
    }
}
