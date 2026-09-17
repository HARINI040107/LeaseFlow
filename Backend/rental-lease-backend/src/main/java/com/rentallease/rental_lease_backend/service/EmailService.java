package com.rentallease.rental_lease_backend.service;

import java.util.Base64;

import org.springframework.stereotype.Service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.Attachment;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

@Service
public class EmailService {

    private final String resendApiKey;
    private final String fromEmail;
    private final Resend resend;

    public EmailService() {

        // Read directly from the Render environment.
        // This avoids Spring @Value property-resolution issues.
        resendApiKey = System.getenv("RESEND_API_KEY");

        String configuredFrom = System.getenv("RESEND_FROM_EMAIL");

        fromEmail = (configuredFrom == null || configuredFrom.isBlank())
                ? "onboarding@resend.dev"
                : configuredFrom;

        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new IllegalStateException(
                    "RESEND_API_KEY is not configured"
            );
        }

        resend = new Resend(resendApiKey);
    }

    // =========================================================
    // TENANT INVITATION
    // =========================================================

    public void sendTenantInvitation(
            String tenantEmail,
            String tenantName,
            String invitationLink) {

        String subject =
                "LeaseFlow - Rental Agreement Invitation";

        String html = """
                <div style="font-family:Arial,sans-serif;
                            line-height:1.6;
                            color:#172033;
                            max-width:600px;
                            margin:0 auto;">

                    <h2 style="color:#173f5f;">
                        LeaseFlow
                    </h2>

                    <p>Hello %s,</p>

                    <p>
                        You have been invited to complete a rental agreement
                        through LeaseFlow.
                    </p>

                    <p>
                        Please use the secure link below to complete your
                        information and provide your digital signature.
                    </p>

                    <p style="margin:30px 0;">
                        <a href="%s"
                           style="display:inline-block;
                                  padding:12px 20px;
                                  background:#173f5f;
                                  color:white;
                                  text-decoration:none;
                                  border-radius:6px;">
                            Complete Rental Agreement
                        </a>
                    </p>

                    <p>
                        Or copy and paste this link into your browser:
                    </p>

                    <p style="word-break:break-all;">
                        %s
                    </p>

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

    // =========================================================
    // TENANT COMPLETED NOTIFICATION
    // =========================================================

    public void sendTenantCompletedNotification(
            String homeownerEmail,
            String tenantName) {

        String subject =
                "LeaseFlow - Tenant Application Completed";

        String html = """
                <div style="font-family:Arial,sans-serif;
                            line-height:1.6;
                            color:#172033;
                            max-width:600px;
                            margin:0 auto;">

                    <h2 style="color:#173f5f;">
                        LeaseFlow
                    </h2>

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

    // =========================================================
    // COMPLETED AGREEMENT + PDF ATTACHMENT
    // =========================================================

    public void sendCompletedAgreement(
            String recipientEmail,
            String recipientName,
            byte[] pdf) {

        String subject =
                "LeaseFlow - Completed Rental Agreement";

        String html = """
                <div style="font-family:Arial,sans-serif;
                            line-height:1.6;
                            color:#172033;
                            max-width:600px;
                            margin:0 auto;">

                    <h2 style="color:#173f5f;">
                        LeaseFlow
                    </h2>

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

    // =========================================================
    // COMMON SEND METHOD
    // =========================================================

    private void sendEmail(
            String recipientEmail,
            String subject,
            String html,
            byte[] attachmentBytes) {

        try {

            CreateEmailOptions.Builder builder =
                    CreateEmailOptions.builder()
                            .from(fromEmail)
                            .to(recipientEmail)
                            .subject(subject)
                            .html(html);

            // Add PDF attachment when provided.
            if (attachmentBytes != null &&
                    attachmentBytes.length > 0) {

                String base64Content =
                        Base64.getEncoder()
                                .encodeToString(attachmentBytes);

                Attachment attachment =
                        Attachment.builder()
                                .fileName(
                                        "completed-rental-agreement.pdf"
                                )
                                .content(base64Content)
                                .contentType("application/pdf")
                                .build();

                builder.addAttachment(attachment);
            }

            CreateEmailResponse response =
                    resend.emails().send(builder.build());

            System.out.println(
                    "LeaseFlow email sent successfully. Email ID: "
                            + response.getId()
            );

        } catch (ResendException e) {

            throw new RuntimeException(
                    "Resend email failed: " + e.getMessage(),
                    e
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to send email through Resend",
                    e
            );
        }
    }

    // =========================================================
    // HTML ESCAPING
    // =========================================================

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