package com.balazs.hajdu.secretsanta.domain.request;

import java.util.List;
import java.util.Map;

/**
 * @author Balazs_Hajdu
 */
public class SecretSantaRequest {

    private List<String> emails;
    private Map<String, List<String>> exclusions;
    private Map<String, String> mappings;
    private boolean emailSendingEnabled;

    public List<String> getEmails() {
        return emails;
    }

    public void setEmails(List<String> emails) {
        this.emails = emails;
    }

    public Map<String, List<String>> getExclusions() {
        return exclusions;
    }

    public void setExclusions(Map<String, List<String>> exclusions) {
        this.exclusions = exclusions;
    }

    public Map<String, String> getMappings() {
        return mappings;
    }

    public void setMappings(Map<String, String> mappings) {
        this.mappings = mappings;
    }

    public boolean isEmailSendingEnabled() {
        return emailSendingEnabled;
    }

    public void setEmailSendingEnabled(boolean emailSendingEnabled) {
        this.emailSendingEnabled = emailSendingEnabled;
    }
}
