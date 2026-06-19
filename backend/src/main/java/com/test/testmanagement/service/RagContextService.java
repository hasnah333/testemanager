package com.test.testmanagement.service;

import com.test.testmanagement.entity.Anomalie;
import com.test.testmanagement.entity.Projet;
import com.test.testmanagement.entity.User;
import com.test.testmanagement.enums.Gravite;
import com.test.testmanagement.enums.StatutAnomalie;
import com.test.testmanagement.repository.AnomalieRepository;
import com.test.testmanagement.repository.CasDeTestRepository;
import com.test.testmanagement.repository.ProjetRepository;
import com.test.testmanagement.repository.SessionTestRepository;
import com.test.testmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * RAG sur données SQL : récupère les données réelles de l'utilisateur depuis MySQL
 * (projets, cas de test, anomalies, sessions) et les met en forme en contexte
 * textuel injecté dans le prompt de l'assistant.
 *
 * La portée respecte le rôle : ADMIN voit tout, MANAGER/TESTEUR voient uniquement
 * les projets dont ils sont membres.
 */
@Service
public class RagContextService {

    private static final int MAX_PROJETS = 10;
    private static final int MAX_ANOMALIES_PAR_PROJET = 5;

    private final UserRepository userRepository;
    private final ProjetRepository projetRepository;
    private final CasDeTestRepository casDeTestRepository;
    private final AnomalieRepository anomalieRepository;
    private final SessionTestRepository sessionTestRepository;

    public RagContextService(UserRepository userRepository,
                             ProjetRepository projetRepository,
                             CasDeTestRepository casDeTestRepository,
                             AnomalieRepository anomalieRepository,
                             SessionTestRepository sessionTestRepository) {
        this.userRepository = userRepository;
        this.projetRepository = projetRepository;
        this.casDeTestRepository = casDeTestRepository;
        this.anomalieRepository = anomalieRepository;
        this.sessionTestRepository = sessionTestRepository;
    }

    /**
     * Construit un résumé textuel des données accessibles à l'utilisateur.
     * Renvoie une chaîne vide si l'utilisateur est introuvable.
     */
    @Transactional(readOnly = true)
    public String buildContext(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return "";
        User user = userOpt.get();

        boolean isAdmin = "ADMIN".equals(user.getRole().name());
        List<Projet> projets = isAdmin
                ? projetRepository.findAll()
                : projetRepository.findProjetsByUserId(user.getId());

        StringBuilder sb = new StringBuilder();
        sb.append("DONNÉES RÉELLES DE L'APPLICATION (source de vérité — base tes réponses sur ces chiffres ").
           append("pour toute question concernant les projets, cas de test, anomalies ou sessions de l'utilisateur) :\n");
        sb.append("Utilisateur : ").append(user.getUsername())
          .append(" (rôle : ").append(user.getRole().name()).append(")\n");
        sb.append("Projets accessibles : ").append(projets.size()).append("\n\n");

        int shown = 0;
        for (Projet p : projets) {
            if (shown >= MAX_PROJETS) {
                sb.append("... (").append(projets.size() - MAX_PROJETS).append(" autre(s) projet(s) non détaillé(s))\n");
                break;
            }
            shown++;
            Long pid = p.getId();

            long nbModules  = projetRepository.countModulesByProjetId(pid);
            long nbCas      = casDeTestRepository.countByProjetId(pid);
            long nbSessions = sessionTestRepository.countByProjetId(pid);
            long nbAno      = anomalieRepository.countByProjetId(pid);
            long anoOuvertes = anomalieRepository.countByProjetIdAndStatut(pid, StatutAnomalie.OUVERTE);
            long anoBloquantes = anomalieRepository.countByProjetIdAndGraviteAndStatutNotFermee(pid, Gravite.BLOQUANTE);

            sb.append("• Projet « ").append(p.getNom()).append(" » (statut : ").append(p.getStatus().name())
              .append(p.isArchived() ? ", archivé" : "").append(")\n");
            if (p.getDescription() != null && !p.getDescription().isBlank()) {
                sb.append("   Description : ").append(truncate(p.getDescription(), 150)).append("\n");
            }
            sb.append("   Modules : ").append(nbModules)
              .append(" | Cas de test : ").append(nbCas)
              .append(" | Sessions : ").append(nbSessions)
              .append(" | Anomalies : ").append(nbAno)
              .append(" (ouvertes : ").append(anoOuvertes)
              .append(", bloquantes non fermées : ").append(anoBloquantes).append(")\n");

            List<Anomalie> anomalies = anomalieRepository.findByProjetId(pid);
            int a = 0;
            for (Anomalie an : anomalies) {
                if (a >= MAX_ANOMALIES_PAR_PROJET) {
                    sb.append("     ... (").append(anomalies.size() - MAX_ANOMALIES_PAR_PROJET).append(" autre(s) anomalie(s))\n");
                    break;
                }
                a++;
                sb.append("     - [").append(an.getGravite().name()).append(" / ").append(an.getStatut().name()).append("] ")
                  .append(an.getTitre()).append("\n");
            }
            sb.append("\n");
        }

        return sb.toString();
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
