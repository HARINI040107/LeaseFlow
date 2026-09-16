package com.rentallease.rental_lease_backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(
            JavaMailSender mailSender) {

        this.mailSender = mailSender;
    }

    public void sendTenantInvitation(
            String tenantEmail,
            String tenantName,
            String invitationLink) {

        try {

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true
                    );

            helper.setTo(tenantEmail);

            helper.setSubject(
                    "LeaseFlow - Rental Agreement Invitation"
            );

            String body =
                    """
                    Hello %s,

                    You have been invited to complete
                    a rental agreement through LeaseFlow.

                    Please use the secure link below
                    to complete your information and
                    provide your digital signature:

                    %s

                    This invitation link is valid for
                    7 days.

                    Thank you,
                    LeaseFlow
                    """.formatted(
                            tenantName,
                            invitationLink
                    );

            helper.setText(body);

            mailSender.send(message);

        } catch (MessagingException e) {

            throw new RuntimeException(
                    "Unable to send tenant invitation email",
                    e
            );
        }
    }

    public void sendTenantCompletedNotification(
            String homeownerEmail,
            String tenantName) {

        try {

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true
                    );

            helper.setTo(homeownerEmail);

            helper.setSubject(
                    "LeaseFlow - Tenant Application Completed"
            );

            String body =
                    """
                    Hello,

                    Tenant %s has completed their
                    rental application and provided
                    their digital signature.

                    Please log in to LeaseFlow to
                    review the application and provide
                    your signature.

                    Thank you,
                    LeaseFlow
                    """.formatted(
                            tenantName
                    );

            helper.setText(body);

            mailSender.send(message);

        } catch (MessagingException e) {

            throw new RuntimeException(
                    "Unable to send homeowner notification",
                    e
            );
        }
    }

    public void sendCompletedAgreement(
            String recipientEmail,
            String recipientName,
            byte[] pdf) {

        try {

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true
                    );

            helper.setTo(recipientEmail);

            helper.setSubject(
                    "LeaseFlow - Completed Rental Agreement"
            );

            String body =
                    """
                    Hello %s,

                    Your rental agreement has been
                    completed and signed by all required
                    parties.

                    The completed rental agreement is
                    attached to this email.

                    Please keep this document for your
                    records.

                    Thank you,
                    LeaseFlow
                    """.formatted(
                            recipientName
                    );

            helper.setText(body);

            helper.addAttachment(
                    "completed-rental-agreement.pdf",
                    new ByteArrayResource(pdf)
            );

            mailSender.send(message);

        } catch (MessagingException e) {

            throw new RuntimeException(
                    "Unable to send completed agreement email",
                    e
            );
        }
    }
}
