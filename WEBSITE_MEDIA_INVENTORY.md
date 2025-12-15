# Website Media Inventory

Complete list of all images and videos used across the website, with recommendations for video replacements.

## Current Images

### Logo & Branding Images
| File Path | Location | Usage | Status |
|-----------|----------|-------|--------|
| `/images/grail logo - transparent.png` | Homepage hero, Header, Footer, Layout | Main logo displayed throughout site | ✅ In Use |
| `/images/write-great-notes-logo.png` | Integrations page | Secondary logo | ✅ In Use |
| `/images/charmhealth-logo.png` | Integrations page | Partner logo | ✅ In Use |
| `/images/charm-logo.png` | Integrations page | Partner logo variant | ✅ In Use |
| `/app/icon.png` | Browser tab, PWA | Favicon/app icon | ✅ In Use |
| `/app/apple-icon.png` | iOS devices | Apple touch icon | ✅ In Use |
| `/app/favicon-16.png` | Browser | 16x16 favicon | ✅ In Use |
| `/app/favicon-32.png` | Browser | 32x32 favicon | ✅ In Use |

### Feature Screenshots (Currently Used)
| File Path | Page | Feature | Status | Video Recommendation |
|-----------|------|---------|--------|---------------------|
| `/images/screenshots/template-sections-followup.png` | Features, How It Works | Custom Note Templates (Step 3) | ✅ In Use | **Replace with video** showing template configuration workflow |
| `/images/screenshots/emr-integration-charm.png` | Features, How It Works | EMR Integration (Step 4) | ✅ In Use | **Replace with video** showing EMR push workflow |

### Feature Screenshots (Missing - Currently Placeholders)
| Feature | Page | Current Status | Video Recommendation |
|---------|------|---------------|---------------------|
| Real-Time Audio Transcription | Features | ❌ Placeholder icon | **Create video** showing: browser-based recording, real-time transcription appearing, waveform visualization, timer |
| AI-Powered Note Generation | Features | ❌ Placeholder icon | **Create video** showing: clicking "Generate Note", moving to next patient, status updates, note appearing in list |
| Integrated Faxing System | Features | ❌ Placeholder icon | **Create video** showing: fax configuration, automatic sending, fax status/history |

### How It Works Screenshots
| Step | File Path | Status | Video Recommendation |
|------|-----------|--------|---------------------|
| Step 1: Record the Visit | ❌ Missing | Placeholder icon | **Create video** showing: starting recording, real-time transcription, recording in progress |
| Step 2: Generate the Note | ❌ Missing | Placeholder icon | **Create video** showing: clicking generate, immediate move to next patient, generation progress |
| Step 3: Review & Edit | `/images/screenshots/template-sections-followup.png` | ✅ In Use | **Replace with video** showing: note review interface, editing sections, finalizing note |
| Step 4: Push to EMR | `/images/screenshots/emr-integration-charm.png` | ✅ In Use | **Replace with video** showing: EMR integration settings, one-click push, confirmation |

### Blog Images
| File Path | Article | Section | Status | Video Recommendation |
|-----------|---------|---------|--------|---------------------|
| `/images/blog/ehr-legacy-systems-featured.jpg` | EHR Reckoning | Featured image | ✅ In Use | Keep as image (conceptual) |
| `/images/blog/technical-debt-concept.jpg` | EHR Reckoning | Technical Debt section | ✅ In Use | Keep as image (conceptual) |
| `/images/blog/ai-healthcare-promise.jpg` | EHR Reckoning | AI Promise section | ✅ In Use | Keep as image (conceptual) |
| `/images/blog/ehr-addon-integration.jpg` | EHR Reckoning | Add-on Solutions section | ✅ In Use | Keep as image (conceptual) |

### Demo Video
| Location | Status | Recommendation |
|----------|--------|----------------|
| `/how-it-works` page - "See It In Action" section | ❌ Placeholder | **Create 2-3 minute video** showing complete workflow: Record → Generate → Review → Push to EMR |

---

## Recommended Video Replacements

### Priority 1: Feature Videos (Replace Screenshots)
1. **Real-Time Audio Transcription Video** (Features page)
   - Show browser-based recording interface
   - Demonstrate real-time transcription appearing
   - Show waveform visualization
   - Display recording timer
   - Duration: 30-45 seconds

2. **AI-Powered Note Generation Video** (Features page)
   - Show clicking "Generate Note" button
   - Demonstrate moving to next patient immediately
   - Show real-time status updates
   - Display note appearing in list when ready
   - Duration: 30-45 seconds

3. **Custom Note Templates Video** (Features & How It Works - Step 3)
   - Show template configuration interface
   - Demonstrate creating/editing sections
   - Show AI-powered section import
   - Duration: 30-45 seconds

4. **EMR Integration Video** (Features & How It Works - Step 4)
   - Show EMR integration settings
   - Demonstrate one-click push to EMR
   - Show confirmation and audit trail
   - Duration: 30-45 seconds

5. **Integrated Faxing System Video** (Features page)
   - Show fax configuration interface
   - Demonstrate automatic fax sending
   - Show fax status/history
   - Duration: 30-45 seconds

### Priority 2: How It Works Step Videos
1. **Step 1: Record the Visit** (How It Works page)
   - Show starting recording
   - Demonstrate real-time transcription
   - Show recording in progress with timer
   - Duration: 30-45 seconds

2. **Step 2: Generate the Note** (How It Works page)
   - Show clicking "Generate Note"
   - Demonstrate immediate move to next patient
   - Show generation progress indicator
   - Duration: 30-45 seconds

### Priority 3: Complete Workflow Video
1. **Demo Video** (How It Works page - "See It In Action")
   - Complete workflow: Record → Generate → Review → Push to EMR
   - Use test patient data (no PHI)
   - Professional narration or captions
   - Duration: 2-3 minutes

---

## Video Specifications

### Recommended Format
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1920x1080 (Full HD) minimum
- **Aspect Ratio**: 16:9
- **Frame Rate**: 30fps
- **Audio**: Include narration or background music (optional)
- **File Size**: Optimize for web (target < 10MB per 30-second video)

### Content Guidelines
- Use test/demo patient data only (no PHI)
- Show actual product interface (not mockups)
- Include smooth transitions and clear focus on key actions
- Consider adding subtle UI highlights or callouts
- Ensure good contrast and readability

### Storage Location
- Recommended: `/public/videos/` directory
- Or use external hosting (YouTube, Vimeo, Cloudflare Stream) for better performance

---

## Summary

### Current State
- **Images**: 12 unique images in use
- **Videos**: 0 videos (all placeholders)
- **Missing Media**: 5 feature screenshots, 2 step screenshots, 1 demo video

### Recommended Action Plan
1. **Create 5 feature videos** to replace screenshots/placeholders on Features page
2. **Create 2 step videos** for How It Works page (Steps 1 & 2)
3. **Create 1 comprehensive demo video** for How It Works page
4. **Keep blog images** as-is (conceptual images work well)
5. **Keep logo/branding images** as-is

### Total Videos Needed: 8
- 5 feature videos (Features page)
- 2 step videos (How It Works page)
- 1 demo video (How It Works page)

---

## Notes
- All videos should use test/demo data with no PHI
- Consider creating shorter "teaser" versions for homepage if needed
- Videos can be embedded using Next.js `<video>` tag or external hosting
- Ensure videos are accessible (captions/transcripts recommended)
