# Screenshots & Media Needed for Website

## Summary of Captured Screenshots

All screenshots are saved to the cursor screenshots folder. The following screenshots have been captured from the live application:

### Screenshots Captured (PHI Status)

| Screenshot | Description | PHI Status | Action Needed |
|------------|-------------|------------|---------------|
| `recent-notes-full.png` | Recent Notes list with patient cards | ⚠️ CONTAINS PHI | Redact patient names, DOBs, MRNs |
| `appointments-nov26.png` | Schedule view with appointments | ⚠️ CONTAINS PHI | Redact patient names, DOBs, phones, emails |
| `note-sections-page.png` | Template configuration overview | ⚠️ Minor | Redact "Dr. Weiner" reference |
| `template-sections-followup.png` | Follow-up note sections config | ✅ Safe | Ready to use |
| `visit-types-settings.png` | Visit Types configuration | ✅ Safe | Ready to use |
| `practice-settings.png` | Practice/Organization settings | ⚠️ CONTAINS PHI | Redact practice name, address, phone |
| `profile-settings.png` | User profile settings | ⚠️ CONTAINS PII | Redact name, email, phone |
| `emr-integration-charm.png` | EMR Integration settings (Charm) | ✅ Safe | Ready to use |
| `patients-with-menu.png` | Navigation menu overlay | ⚠️ CONTAINS PHI | Redact patient info in background |

---

## Media Mapping to Website Sections

### Features Page (`/features`)

| Feature | Screenshot to Use | Notes |
|---------|-------------------|-------|
| Real-Time Audio Transcription | **NEEDS CREATION** | Recording interface with waveform/timer |
| AI-Powered Note Generation | `recent-notes-full.png` (redacted) | Shows completed notes |
| Custom Note Templates | `template-sections-followup.png` or `note-sections-page.png` | Template configuration |
| EMR Integration | `emr-integration-charm.png` | Charm EMR settings |
| Integrated Faxing System | **NEEDS CREATION** | Fax settings or send interface |

### How It Works Page (`/how-it-works`)

| Step | Screenshot to Use | Notes |
|------|-------------------|-------|
| Step 1: Record the Visit | **NEEDS CREATION** | Recording UI with active recording |
| Step 2: Generate the Note | **NEEDS CREATION** | Generation in progress state |
| Step 3: Review & Edit | **NEEDS CREATION** | Note editor with content |
| Step 4: Push to EMR | `emr-integration-charm.png` | EMR push options |
| Demo Video | **NEEDS CREATION** | Full 2-3 min workflow video |

---

## Still Needed (Not Yet Captured)

### Critical Screenshots Needed:

1. **Recording Interface**
   - Active recording with waveform visualization
   - Timer showing recording duration
   - Real-time transcription preview (if available)

2. **Note Generation In Progress**
   - Loading/generating state
   - Progress indicator

3. **Note Editor View**
   - Full note with all sections visible
   - Edit capabilities showing
   - This requires opening a specific note (PHI will need redaction)

4. **Faxing Interface**
   - Fax configuration or send dialog
   - Fax history/status

### Video Needed:

1. **Demo Video (2-3 minutes)**
   - Complete workflow: Record → Generate → Review → Push to EMR
   - Should use test patient data
   - No PHI should be visible
   - Professional narration or captions recommended

---

## PHI Redaction Guide

For screenshots containing PHI, the following should be redacted/blurred:
- Patient names
- Dates of birth
- Medical record numbers (MRN)
- Phone numbers
- Email addresses
- Street addresses
- Any specific medical information

For practice/provider info:
- Consider if practice name/address needs redaction for your use case
- Provider names may be acceptable if it's your own practice

---

## Screenshot Locations

All captured screenshots are saved to:
`/var/folders/t1/x_7gmdr175q71ss218sgxzgw0000gn/T/cursor/screenshots/`

To copy to project:
```bash
cp /var/folders/t1/x_7gmdr175q71ss218sgxzgw0000gn/T/cursor/screenshots/*.png /Users/mattweiner/dev/write-great-notes-web/public/images/screenshots/
```

---

## Recommended Next Steps

1. **Create the missing screenshots:**
   - Recording interface (need an active recording session)
   - Note editor view (open a note, redact PHI)
   - Fax interface
   - Generation in progress state

2. **Redact PHI from captured screenshots:**
   - Use image editing software to blur/block PHI
   - Or create new screenshots with test data

3. **Record demo video:**
   - Use screen recording software
   - Walk through complete workflow
   - Add narration or captions

4. **Update website code:**
   - Replace placeholder components with actual images
   - Reference images from `/public/images/screenshots/`


