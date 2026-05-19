package com.test.testmanagement.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.element.Image;
import com.test.testmanagement.entity.*;
import com.test.testmanagement.repository.ProjetRepository;
import com.test.testmanagement.repository.AnomalieRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ArrayList;
import com.itextpdf.layout.element.AreaBreak;

@Service
public class ReportService {

    private final ProjetRepository projetRepository;
    private final AnomalieRepository anomalieRepository;

    public ReportService(ProjetRepository projetRepository, AnomalieRepository anomalieRepository) {
        this.projetRepository = projetRepository;
        this.anomalieRepository = anomalieRepository;
    }

    public byte[] generateProjetReport(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        List<Anomalie> anomalies = anomalieRepository.findByProjetId(projetId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Titre
            document.add(new Paragraph("Rapport de Test Fonctionnel")
                    .setBold().setFontSize(20).setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

            // Infos Projet
            document.add(new Paragraph("Projet : " + projet.getNom()).setBold());
            document.add(new Paragraph("Date de génération : " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))));
            document.add(new Paragraph("Description : " + (projet.getDescription() != null ? projet.getDescription() : "N/A")).setMarginBottom(20));

            // Statistiques
            long totalModules = projet.getModules().size();
            long totalScenarios = projet.getModules().stream().flatMap(m -> m.getScenarios().stream()).count();
            long totalAnomalies = anomalies.size();

            document.add(new Paragraph("Résumé des composants").setBold().setUnderline());
            document.add(new Paragraph("• Nombre de modules : " + totalModules));
            document.add(new Paragraph("• Nombre de scénarios : " + totalScenarios));
            document.add(new Paragraph("• Nombre d'anomalies détectées : " + totalAnomalies).setMarginBottom(15));

            // Table des Anomalies
            if (!anomalies.isEmpty()) {
                document.add(new Paragraph("Liste des Anomalies").setBold().setFontSize(14).setMarginBottom(10));
                Table table = new Table(UnitValue.createPointArray(new float[]{150, 80, 80, 200}));
                table.addHeaderCell(new Cell().add(new Paragraph("Titre").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Gravité").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Statut").setBold()));
                table.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()));

                for (Anomalie a : anomalies) {
                    table.addCell(new Cell().add(new Paragraph(a.getTitre())));
                    table.addCell(new Cell().add(new Paragraph(a.getGravite().toString())));
                    table.addCell(new Cell().add(new Paragraph(a.getStatut().toString())));
                    table.addCell(new Cell().add(new Paragraph(a.getDescription() != null ? a.getDescription() : "")));

                    // Ajout de l'image si elle existe
                    if (a.getUrlCapture() != null && !a.getUrlCapture().isEmpty()) {
                        try {
                            // On extrait le nom du fichier de l'URL (http://localhost:8081/uploads/filename)
                            String filename = a.getUrlCapture().substring(a.getUrlCapture().lastIndexOf("/") + 1);
                            String imagePath = "uploads/" + filename;
                            
                            java.io.File file = new java.io.File(imagePath);
                            if (file.exists()) {
                                Image img = new Image(ImageDataFactory.create(imagePath));
                                img.setMaxWidth(100); // Limiter la largeur dans le tableau
                                table.addCell(new Cell(1, 4).add(new Paragraph("Capture d'écran :")).add(img));
                            }
                        } catch (Exception e) {
                            // Si l'image ne peut pas être chargée, on continue sans bloquer le rapport
                            table.addCell(new Cell(1, 4).add(new Paragraph("Erreur chargement image : " + a.getUrlCapture()).setItalic()));
                        }
                    }
                }
                document.add(table);
            } else {
                document.add(new Paragraph("Aucune anomalie déclarée pour ce projet.").setItalic());
            }

            // NOUVELLE SECTION : DÉTAILS DES TESTS
            document.add(new AreaBreak());
            document.add(new Paragraph("Détails du Plan de Test")
                    .setBold().setFontSize(18).setTextAlignment(TextAlignment.CENTER).setMarginBottom(15));

            for (ModuleProjet module : projet.getModules()) {
                document.add(new Paragraph("Module : " + module.getNom())
                        .setBold().setFontSize(14).setFontColor(ColorConstants.BLUE).setMarginTop(10));
                document.add(new Paragraph("Description : " + (module.getDescription() != null ? module.getDescription() : "N/A")));

                for (Scenario scenario : module.getScenarios()) {
                    document.add(new Paragraph("  Scénario : " + scenario.getTitre())
                            .setBold().setFontSize(12).setMarginLeft(20).setMarginTop(5));
                    
                    if (!scenario.getCasDeTests().isEmpty()) {
                        Table testTable = new Table(UnitValue.createPointArray(new float[]{100, 150, 150, 80}));
                        testTable.setMarginLeft(30).setMarginTop(5).setMarginBottom(10);
                        testTable.addHeaderCell(new Cell().add(new Paragraph("ID / Titre").setBold().setFontSize(10)));
                        testTable.addHeaderCell(new Cell().add(new Paragraph("Étapes").setBold().setFontSize(10)));
                        testTable.addHeaderCell(new Cell().add(new Paragraph("Résultat Attendu").setBold().setFontSize(10)));
                        testTable.addHeaderCell(new Cell().add(new Paragraph("Priorité").setBold().setFontSize(10)));

                        for (CasDeTest ct : scenario.getCasDeTests()) {
                            testTable.addCell(new Cell().add(new Paragraph("CT-" + ct.getId() + "\n" + ct.getTitre()).setFontSize(9)));
                            testTable.addCell(new Cell().add(new Paragraph(ct.getEtapes() != null ? ct.getEtapes() : "").setFontSize(9)));
                            testTable.addCell(new Cell().add(new Paragraph(ct.getResultatAttendu() != null ? ct.getResultatAttendu() : "").setFontSize(9)));
                            testTable.addCell(new Cell().add(new Paragraph(ct.getPriority().toString()).setFontSize(9)));
                        }
                        document.add(testTable);
                    } else {
                        document.add(new Paragraph("    (Aucun cas de test)").setItalic().setMarginLeft(40));
                    }
                }
            }

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    public byte[] generateProjetCSV(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             PrintWriter writer = new PrintWriter(baos, false, StandardCharsets.UTF_8)) {
            
            // UTF-8 BOM for Excel
            baos.write(0xEF);
            baos.write(0xBB);
            baos.write(0xBF);

            // Header
            writer.println("Module;Scenario;ID Cas de Test;Titre Cas de Test;Priorite;Etapes;Resultat Attendu");

            for (ModuleProjet module : projet.getModules()) {
                for (Scenario scenario : module.getScenarios()) {
                    for (CasDeTest ct : scenario.getCasDeTests()) {
                        writer.printf("%s;%s;CT-%d;%s;%s;\"%s\";\"%s\"%n",
                                module.getNom(),
                                scenario.getTitre(),
                                ct.getId(),
                                ct.getTitre(),
                                ct.getPriority(),
                                (ct.getEtapes() != null ? ct.getEtapes().replace("\"", "'").replace("\n", " ") : ""),
                                (ct.getResultatAttendu() != null ? ct.getResultatAttendu().replace("\"", "'").replace("\n", " ") : "")
                        );
                    }
                }
            }
            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du CSV", e);
        }
    }
}
