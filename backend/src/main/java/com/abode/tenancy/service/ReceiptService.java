package com.abode.tenancy.service;

import com.abode.tenancy.domain.model.Payment;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Slf4j
@Service
public class ReceiptService {

    public byte[] generateReceiptPdf(Payment payment) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                PDType1Font boldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                PDType1Font regularFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                // Header
                contentStream.beginText();
                contentStream.setFont(boldFont, 20);
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("ABODE TENANCY - RENT RECEIPT");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(regularFont, 12);
                contentStream.newLineAtOffset(50, 725);
                contentStream.showText("Property: " + payment.getProperty().getName());
                contentStream.newLineAtOffset(0, -18);
                contentStream.showText("Address: " + payment.getProperty().getAddress() + ", " + payment.getProperty().getCity());
                contentStream.newLineAtOffset(0, -18);
                contentStream.showText("Receipt ID: " + payment.getReceiptNumber());
                contentStream.newLineAtOffset(0, -18);
                String paidDateStr = payment.getPaidAt() != null ? payment.getPaidAt().toLocalDate().toString() : java.time.LocalDate.now().toString();
                contentStream.showText("Date: " + paidDateStr);
                contentStream.endText();

                // Horizontal line
                contentStream.moveTo(50, 650);
                contentStream.lineTo(550, 650);
                contentStream.stroke();

                // Tenant Details
                contentStream.beginText();
                contentStream.setFont(boldFont, 14);
                contentStream.newLineAtOffset(50, 620);
                contentStream.showText("Tenant & Payment Details");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(regularFont, 12);
                contentStream.newLineAtOffset(50, 590);
                contentStream.showText("Tenant Name: " + payment.getTenant().getUser().getFullName());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Phone Number: " + payment.getTenant().getUser().getPhone());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Room / Bed: Room " + (payment.getTenant().getRoom() != null ? payment.getTenant().getRoom().getRoomNumber() : "N/A") +
                        " (" + (payment.getTenant().getBed() != null ? payment.getTenant().getBed().getBedLabel() : "N/A") + ")");
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Billing Month: " + payment.getInvoice().getMonthYear());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Payment Method: " + payment.getPaymentMethod().name());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Payment Status: " + payment.getStatus().name());
                contentStream.newLineAtOffset(0, -20);
                contentStream.setFont(boldFont, 14);
                contentStream.showText("Amount Paid: Rs. " + payment.getAmount().toString());
                contentStream.endText();

                // Footer Notice
                contentStream.beginText();
                contentStream.setFont(regularFont, 10);
                contentStream.newLineAtOffset(50, 420);
                contentStream.showText("This is an electronically generated receipt verified by Abode Tenancy Platform.");
                contentStream.endText();
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            log.error("Failed to generate PDF receipt", e);
            throw new RuntimeException("Could not generate receipt PDF: " + e.getMessage());
        }
    }
}
