package com.rentallease.rental_lease_backend.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.rentallease.rental_lease_backend.entity.ApplicationSection;
import com.rentallease.rental_lease_backend.entity.Party;
import com.rentallease.rental_lease_backend.entity.Signature;
import com.rentallease.rental_lease_backend.repository.ApplicationSectionRepository;
import com.rentallease.rental_lease_backend.repository.PartyRepository;
import com.rentallease.rental_lease_backend.repository.SignatureRepository;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.UUID;

@Service
public class PdfService {

    private final ApplicationSectionRepository sectionRepository;
    private final PartyRepository partyRepository;
    private final SignatureRepository signatureRepository;

    public PdfService(
            ApplicationSectionRepository sectionRepository,
            PartyRepository partyRepository,
            SignatureRepository signatureRepository) {

        this.sectionRepository =
                sectionRepository;

        this.partyRepository =
                partyRepository;

        this.signatureRepository =
                signatureRepository;
    }

    public byte[] generatePdf(
            UUID applicationId) {

        try {

            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            Document document =
                    new Document(
                            PageSize.A4,
                            35,
                            35,
                            40,
                            40
                    );

            PdfWriter.getInstance(
                    document,
                    outputStream
            );

            document.open();

            addHeader(document);

            addSection1(
                    document,
                    applicationId
            );

            addSection2(
                    document,
                    applicationId
            );

            addSection3(
                    document,
                    applicationId
            );

            addRemainingSections(
                    document,
                    applicationId
            );

            addSignatures(
                    document,
                    applicationId
            );

            document.close();

            return outputStream.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to generate rental agreement PDF",
                    e
            );
        }
    }

    private void addHeader(
            Document document)
            throws DocumentException {

        Font titleFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        16
                );

        Font normalFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA,
                        9
                );

        Paragraph title =
                new Paragraph(
                        "FORM P",
                        titleFont
                );

        title.setAlignment(
                Element.ALIGN_CENTER
        );

        document.add(title);

        Paragraph subtitle =
                new Paragraph(
                        "RESIDENTIAL TENANCY AGREEMENT",
                        titleFont
                );

        subtitle.setAlignment(
                Element.ALIGN_CENTER
        );

        document.add(subtitle);

        Paragraph description =
                new Paragraph(
                        "Rental Agreement",
                        normalFont
                );

        description.setAlignment(
                Element.ALIGN_CENTER
        );

        document.add(description);

        document.add(
                new Paragraph(" ")
        );
    }

    private void addSection1(
            Document document,
            UUID applicationId)
            throws DocumentException {

        addSectionHeading(
                document,
                "1. PARTIES"
        );

        List<Party> parties =
                partyRepository
                        .findByApplicationId(
                                applicationId
                        );

        PdfPTable table =
                createTable(2);

        addCell(
                table,
                "Party",
                true
        );

        addCell(
                table,
                "Information",
                true
        );

        if (parties.isEmpty()) {

            addCell(
                    table,
                    "Tenant",
                    false
            );

            addCell(
                    table,
                    "No tenant information provided.",
                    false
            );

        } else {

            int tenantNumber = 1;

            for (Party party : parties) {

                String partyLabel;

                if ("OCCUPANT".equals(
                        party.getPartyType())) {

                    partyLabel =
                            "Occupant "
                                    + tenantNumber;

                } else {

                    partyLabel =
                            "Tenant "
                                    + tenantNumber;
                }

                String information =
                        "Name: "
                                + safe(
                                party.getName()
                        )
                                + "\n"
                                + "Email: "
                                + safe(
                                party.getEmail()
                        )
                                + "\n"
                                + "Date of Birth: "
                                + (
                                party.getDateOfBirth()
                                        != null
                                        ? party
                                        .getDateOfBirth()
                                        .toString()
                                        : "Not provided"
                        )
                                + "\n"
                                + "Type: "
                                + safe(
                                party.getPartyType()
                        );

                addCell(
                        table,
                        partyLabel,
                        false
                );

                addCell(
                        table,
                        information,
                        false
                );

                tenantNumber++;
            }
        }

        document.add(table);

        document.add(
                new Paragraph(" ")
        );
    }

    private void addSection2(
            Document document,
            UUID applicationId)
            throws DocumentException {

        addSectionHeading(
                document,
                "2. OCCUPANTS"
        );

        ApplicationSection section =
                getSection(
                        applicationId,
                        "2"
                );

        if (section == null) {

            addInformationBox(
                    document,
                    "No occupant information provided."
            );

            return;
        }

        addInformationBox(
                document,
                cleanJson(
                        section.getSectionData()
                )
        );
    }

    private void addSection3(
            Document document,
            UUID applicationId)
            throws DocumentException {

        addSectionHeading(
                document,
                "3. PREMISES"
        );

        ApplicationSection section =
                getSection(
                        applicationId,
                        "3"
                );

        PdfPTable table =
                createTable(2);

        addCell(
                table,
                "Field",
                true
        );

        addCell(
                table,
                "Details",
                true
        );

        if (section == null) {

            addCell(
                    table,
                    "Premises",
                    false
            );

            addCell(
                    table,
                    "No premises information provided.",
                    false
            );

        } else {

            addCell(
                    table,
                    "Premises Information",
                    false
            );

            addCell(
                    table,
                    cleanJson(
                            section.getSectionData()
                    ),
                    false
            );
        }

        document.add(table);

        document.add(
                new Paragraph(" ")
        );
    }

    private void addRemainingSections(
            Document document,
            UUID applicationId)
            throws DocumentException {

        String[] sections = {
                "4",
                "8",
                "9",
                "11",
                "13",
                "16",
                "17",
                "18",
                "19",
                "23",
                "26"
        };

        for (String number : sections) {

            ApplicationSection section =
                    getSection(
                            applicationId,
                            number
                    );

            if (section == null) {
                continue;
            }

            document.newPage();

            addSectionHeading(
                    document,
                    getSectionTitle(number)
            );

            PdfPTable table =
                    createTable(2);

            addCell(
                    table,
                    "Field",
                    true
            );

            addCell(
                    table,
                    "Information",
                    true
            );

            addCell(
                    table,
                    "Section " + number,
                    false
            );

            addCell(
                    table,
                    cleanJson(
                            section.getSectionData()
                    ),
                    false
            );

            document.add(table);
        }
    }

    private void addSignatures(
            Document document,
            UUID applicationId)
            throws DocumentException {

        document.newPage();

        addSectionHeading(
                document,
                "SIGNATURES"
        );

        List<Signature> signatures =
                signatureRepository
                        .findByApplicationId(
                                applicationId
                        );

        List<Party> parties =
                partyRepository
                        .findByApplicationId(
                                applicationId
                        );

        PdfPTable table =
                createTable(4);

        addCell(
                table,
                "Signer",
                true
        );

        addCell(
                table,
                "Type",
                true
        );

        addCell(
                table,
                "Signature",
                true
        );

        addCell(
                table,
                "Date / Time",
                true
        );

        if (signatures.isEmpty()) {

            addCell(
                    table,
                    "No signatures",
                    false
            );

            addCell(
                    table,
                    "-",
                    false
            );

            addCell(
                    table,
                    "-",
                    false
            );

            addCell(
                    table,
                    "-",
                    false
            );

        } else {

            for (Signature signature :
                    signatures) {

                String signerName =
                        "Homeowner";

                if ("TENANT".equals(
                        signature.getSignerType())) {

                    signerName =
                            findPartyName(
                                    parties,
                                    signature
                                            .getPartyId()
                            );
                }

                addCell(
                        table,
                        signerName,
                        false
                );

                addCell(
                        table,
                        safe(
                                signature
                                        .getSignerType()
                        ),
                        false
                );

                addCell(
                        table,
                        safe(
                                signature
                                        .getSignatureData()
                        ),
                        false
                );

                addCell(
                        table,
                        signature
                                .getSignedAt()
                                .toString(),
                        false
                );
            }
        }

        document.add(table);

        document.add(
                new Paragraph(" ")
        );

        Paragraph notice =
                new Paragraph(
                        "By signing this agreement, the parties acknowledge "
                                + "that the information contained in this document "
                                + "represents the completed rental application."
                );

        document.add(notice);

        document.add(
                new Paragraph(" ")
        );

        Paragraph generated =
                new Paragraph(
                        "Generated electronically by LeaseFlow."
                );

        document.add(generated);
    }

    private String findPartyName(
            List<Party> parties,
            UUID partyId) {

        for (Party party : parties) {

            if (party.getId()
                    .equals(partyId)) {

                return safe(
                        party.getName()
                );
            }
        }

        return "Tenant";
    }

    private ApplicationSection getSection(
            UUID applicationId,
            String sectionNumber) {

        return sectionRepository
                .findByApplicationIdAndSectionNumber(
                        applicationId,
                        sectionNumber
                )
                .orElse(null);
    }

    private void addSectionHeading(
            Document document,
            String title)
            throws DocumentException {

        Font headingFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        12
                );

        Paragraph heading =
                new Paragraph(
                        title,
                        headingFont
                );

        heading.setSpacingBefore(8);
        heading.setSpacingAfter(8);

        document.add(heading);
    }

    private PdfPTable createTable(
            int columns) {

        PdfPTable table =
                new PdfPTable(columns);

        table.setWidthPercentage(100);

        table.setSpacingBefore(5);

        table.setSpacingAfter(10);

        return table;
    }

    private void addCell(
            PdfPTable table,
            String text,
            boolean header) {

        Font font;

        if (header) {

            font =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            9
                    );

        } else {

            font =
                    FontFactory.getFont(
                            FontFactory.HELVETICA,
                            9
                    );
        }

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(
                                safe(text),
                                font
                        )
                );

        cell.setPadding(6);

        if (header) {

            cell.setHorizontalAlignment(
                    Element.ALIGN_CENTER
            );
        }

        table.addCell(cell);
    }

    private void addInformationBox(
            Document document,
            String text)
            throws DocumentException {

        PdfPTable table =
                createTable(1);

        addCell(
                table,
                text,
                false
        );

        document.add(table);

        document.add(
                new Paragraph(" ")
        );
    }

    private String getSectionTitle(
            String number) {

        switch (number) {

            case "4":
                return "4. EMERGENCY CONTACT";

            case "8":
                return "8. LEASE INFORMATION";

            case "9":
                return "9. SERVICE BY TENANT";

            case "11":
                return "11. LEASE TYPE";

            case "13":
                return "13. RENT";

            case "16":
                return "16. RENT INCLUDES";

            case "17":
                return "17. ADDITIONAL OBLIGATIONS";

            case "18":
                return "18. SECURITY DEPOSIT";

            case "19":
                return "19. INSPECTION";

            case "23":
                return "23. TENANT NOTICE TO QUIT";

            case "26":
                return "26. TENANTS RESPONSIBLE FOR COMPLYING";

            default:
                return "SECTION " + number;
        }
    }

    private String cleanJson(
            String data) {

        if (data == null ||
                data.isBlank()) {

            return "No information provided.";
        }

        return data
                .replace("{", "")
                .replace("}", "")
                .replace("\"", "")
                .replace(",", "\n")
                .replace(":", ": ");
    }

    private String safe(
            String value) {

        if (value == null ||
                value.isBlank()) {

            return "Not provided";
        }

        return value;
    }
}