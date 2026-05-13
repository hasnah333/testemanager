package com.test.testmanagement.dto;

public class DashboardDTO {
    private long totalModules;
    private long totalScenarios;
    private long totalCasDeTest;
    private long totalExecutions;
    private long testsReussis;
    private long testsEchoues;
    private long totalAnomalies;
    private long anomaliesCritiques;
    private double tauxReussite;

    public DashboardDTO() {}

    public DashboardDTO(long totalModules, long totalScenarios, long totalCasDeTest, long totalExecutions, long testsReussis, long testsEchoues, long totalAnomalies, long anomaliesCritiques, double tauxReussite) {
        this.totalModules = totalModules;
        this.totalScenarios = totalScenarios;
        this.totalCasDeTest = totalCasDeTest;
        this.totalExecutions = totalExecutions;
        this.testsReussis = testsReussis;
        this.testsEchoues = testsEchoues;
        this.totalAnomalies = totalAnomalies;
        this.anomaliesCritiques = anomaliesCritiques;
        this.tauxReussite = tauxReussite;
    }

    public long getTotalModules() { return totalModules; }
    public void setTotalModules(long totalModules) { this.totalModules = totalModules; }

    public long getTotalScenarios() { return totalScenarios; }
    public void setTotalScenarios(long totalScenarios) { this.totalScenarios = totalScenarios; }

    public long getTotalCasDeTest() { return totalCasDeTest; }
    public void setTotalCasDeTest(long totalCasDeTest) { this.totalCasDeTest = totalCasDeTest; }

    public long getTotalExecutions() { return totalExecutions; }
    public void setTotalExecutions(long totalExecutions) { this.totalExecutions = totalExecutions; }

    public long getTestsReussis() { return testsReussis; }
    public void setTestsReussis(long testsReussis) { this.testsReussis = testsReussis; }

    public long getTestsEchoues() { return testsEchoues; }
    public void setTestsEchoues(long testsEchoues) { this.testsEchoues = testsEchoues; }

    public long getTotalAnomalies() { return totalAnomalies; }
    public void setTotalAnomalies(long totalAnomalies) { this.totalAnomalies = totalAnomalies; }

    public long getAnomaliesCritiques() { return anomaliesCritiques; }
    public void setAnomaliesCritiques(long anomaliesCritiques) { this.anomaliesCritiques = anomaliesCritiques; }

    public double getTauxReussite() { return tauxReussite; }
    public void setTauxReussite(double tauxReussite) { this.tauxReussite = tauxReussite; }
}
