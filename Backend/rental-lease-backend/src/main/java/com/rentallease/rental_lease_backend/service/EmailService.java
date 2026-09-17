package com.rentallease.rental_lease_backend.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final String RESEND_API_URL =
            "https://api.resend.com/emails";

    private final HttpClient httpClient;

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    @Value("${RESEND_FROM_EMAIL:onboarding@resend.dev}")
    private String fromEmail;

    public EmailService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public void sendTenantInvitation(
            String tenantEmail,
            String tenantName,
            String invitationLink) {

        String subject =
                "LeaseFlow - Rental Agreement Invitation";

        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">
                    <h2 style="color:#173f5f">LeaseFlow</h2>

                    <p>Hello %s,</p>

                    <p>
                        You have been invited to complete a rental agreement
                        through LeaseFlow.
                    </p>

                    <p>
                        Please use the secure link below to complete your
                        information and provide your digital signature.
                    </p>

                    <p>
                        <a href="%s"
                           style="display:inline-block;padding:12px 20px;
                                  background:#173f5f;color:white;
                                  text-decoration:none;border-radius:6px;">
                            Complete Rental Agreement
                        </a>
                    </p>

                    <p>
                        Or copy and paste this link into your browser:
                    </p>

                    <p>%s</p>

                    <p>
                        This invitation link is valid for 7 days.
                    </p>

                    <p>
                        Thank you,<br>
                        <strong>LeaseFlow</strong>
                    </p>
                </div>
                """.formatted(
                        escapeHtml(tenantName),
                        invitationLink,
                        invitationLink
                );

        sendEmail(
                tenantEmail,
                subject,
                html,
                null
        );
    }

    public void sendTenantCompletedNotification(
            String homeownerEmail,
            String tenantName) {

        String subject =
                "LeaseFlow - Tenant Application Completed";

        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">
                    <h2 style="color:#173f5f">LeaseFlow</h2>

                    <p>Hello,</p>

                    <p>
                        Tenant <strong>%s</strong> has completed their
                        rental application and provided their digital signature.
                    </p>

                    <p>
                        Please log in to LeaseFlow to review the application
                        and provide your signature.
                    </p>

                    <p>
                        Thank you,<br>
                        <strong>LeaseFlow</strong>
                    </p>
                </div>
                """.formatted(
                        escapeHtml(tenantName)
                );

        sendEmail(
                homeownerEmail,
                subject,
                html,
                null
        );
    }

    public void sendCompletedAgreement(
            String recipientEmail,
            String recipientName,
            byte[] pdf) {

        String subject =
                "LeaseFlow - Completed Rental Agreement";

        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033">
                    <h2 style="color:#173f5f">LeaseFlow</h2>

                    <p>Hello %s,</p>

                    <p>
                        Your rental agreement has been completed and signed
                        by all required parties.
                    </p>

                    <p>
                        The completed rental agreement is attached to this email.
                    </p>

                    <p>
                        Please keep this document for your records.
                    </p>

                    <p>
                        Thank you,<br>
                        <strong>LeaseFlow</strong>
                    </p>
                </div>
                """.formatted(
                        escapeHtml(recipientName)
                );

        sendEmail(
                recipientEmail,
                subject,
                html,
                pdf
        );
    }

    private void sendEmail(
            String recipientEmail,
            String subject,
            String html,
            byte[] attachment) {

        try {

            validateConfiguration();

            StringBuilder json = new StringBuilder();

            json.append("{")
                    .append("\"from\":")
                    .append(jsonString(fromEmail))
                    .append(",")

                    .append("\"to\":[")
                    .append(jsonString(recipientEmail))
                    .append("],")

                    .append("\"subject\":")
                    .append(jsonString(subject))
                    .append(",")

                    .append("\"html\":")
                    .append(jsonString(html));

            if (attachment != null) {

                String base64 =
                        Base64.getEncoder()
                                .encodeToString(attachment);

                json.append(",")
                        .append("\"attachments\":[{")
                        .append("\"filename\":\"completed-rental-agreement.pdf\",")
                        .append("\"content\":")
                        .append(jsonString(base64))
                        .append("}]");
            }

            json.append("}");

            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(URI.create(RESEND_API_URL))
                            .timeout(Duration.ofSeconds(20))
                            .header(
                                    "Authorization",
                                    "Bearer " + resendApiKey
                            )
                            .header(
                                    "Content-Type",
                                    "application/json"
                            )
                            .POST(
                                    HttpRequest.BodyPublishers
                                            .ofString(json.toString())
                            )
                            .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() < 200 ||
                    response.statusCode() >= 300) {

                throw new RuntimeException(
                        "Resend email failed (" +
                                response.statusCode() +
                                "): " +
                                response.body()
                );
            }

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to connect to Resend email API",
                    e
            );

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            throw new RuntimeException(
                    "Email request was interrupted",
                    e
            );
        }
    }

    private void validateConfiguration() {

        if (resendApiKey == null ||
                resendApiKey.isBlank()) {

            throw new IllegalStateException(
                    "RESEND_API_KEY is not configured"
            );
        }

        if (fromEmail == null ||
                fromEmail.isBlank()) {

            throw new IllegalStateException(
                    "RESEND_FROM_EMAIL is not configured"
            );
        }
    }

    private String jsonString(String value) {

        if (value == null) {
            return "\"\"";
        }

        return "\"" +
                value
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"")
                        .replace("\r", "\\r")
                        .replace("\n", "\\n")
                        .replace("\t", "\\t")
                + "\"";
    }

    private String escapeHtml(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
