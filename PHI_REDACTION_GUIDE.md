# PHI Redaction Guide for Screenshots

## Quick Guide: Using Mac Preview to Edit Text

1. Open the screenshot in Preview
2. Use the Markup toolbar (View → Show Markup Toolbar)
3. Use the Rectangle tool to draw a white box over PHI
4. Use the Text tool (same font: **Inter** or system font) to add fake text
5. Match the text color (usually #1f2937 for dark text, #6b7280 for muted text)

---

## Screenshot 1: Recent Notes Page (`recent-notes-to-redact.png`)

### Fake Patient Data to Use:

| Original Name | Replace With | Original DOB | Replace DOB | Original MRN | Replace MRN |
|--------------|--------------|--------------|-------------|--------------|-------------|
| Valerie Nelson | Sarah Johnson | Jun 23, 1984 (41) | Mar 15, 1982 (43) | POC23645 | TEST00001 |
| Alma Padron | Emily Williams | Dec 26, 1971 (53) | Aug 22, 1970 (55) | POC23125 | TEST00002 |
| Angela Smith | Jennifer Davis | Nov 23, 1998 (27) | Apr 10, 1996 (29) | POC23646 | TEST00003 |
| Martin Harkins | Robert Miller | Mar 14, 1958 (67) | Sep 05, 1956 (69) | POC23652 | TEST00004 |
| Maryann Ward | Patricia Brown | Jun 29, 1957 (68) | Jan 18, 1955 (70) | POC23647 | TEST00005 |

### Provider Name:
| Original | Replace With |
|----------|--------------|
| Matthew Weiner | Dr. Sample Provider |

### Note Summaries (already generic medical content - can keep as-is or simplify):
The note summaries don't contain specific PHI, just generic medical descriptions. These are acceptable.

---

## Screenshot 2: Appointments Page (`appointments-nov26.png`)

### Fake Patient Data:

| Original Name | Replace With | Original DOB | Replace DOB | Original MRN | Replace MRN |
|--------------|--------------|--------------|-------------|--------------|-------------|
| Sandy Canez | Michelle Anderson | April 2, 1965 | Feb 12, 1963 | POC23630 | TEST00006 |
| Lauren Danks | Amanda Taylor | September 3, 1980 | July 20, 1978 | POC17101 | TEST00007 |
| Tina Taylor | Christina Moore | April 8, 1986 | Nov 14, 1984 | POC23602 | TEST00008 |
| Sharri Miller-Zarate | Rebecca Wilson | September 6, 1966 | May 30, 1964 | POC23460 | TEST00009 |
| Nina Akin | Stephanie Martin | (visible DOB) | Dec 08, 1975 | POC19931 | TEST00010 |

### Contact Info to Redact:
| Original Phone | Replace With | Original Email | Replace With |
|----------------|--------------|----------------|--------------|
| (520) 271-2366 | (555) 123-4567 | sandyc6to1@gmail.com | patient1@example.com |
| (520) 490-5424 | (555) 234-5678 | laurendanks@gmail.com | patient2@example.com |
| (323) 984-6442 | (555) 345-6789 | tinataylor021210@gmail.com | patient3@example.com |
| (520) 445-2637 | (555) 456-7890 | zaratesharri6466@gmail.com | patient4@example.com |

---

## Screenshot 3: Practice Settings (`practice-settings.png`)

### Practice Information:
| Field | Original | Replace With |
|-------|----------|--------------|
| Practice Name | Pound of Cure Weight Loss | Sample Medical Practice |
| Phone | 5202983300 | (555) 000-0000 |
| Website | www.poundofcureweightloss.com | www.samplepractice.com |
| Street Address | 5155 E Farness Dr | 123 Medical Center Blvd |
| City | Tucson | Anytown |
| State | AZ | CA |
| ZIP | 85718 | 90210 |

---

## Screenshot 4: Profile Settings (`profile-settings.png`)

### Provider Information:
| Field | Original | Replace With |
|-------|----------|--------------|
| Email | matthew.weiner@poundofcureweightloss.com | provider@samplepractice.com |
| First Name | Matthew | Sample |
| Last Name | Weiner | Provider |
| Mobile | 2488352997 | (555) 999-0000 |
| Degree | MD | MD |

---

## Screenshot 5: Note Sections Page (`note-sections-page.png`)

### Minor Redaction:
In the "Your Instructions" text box, replace:
- "Dr. Weiner" → "the provider"
- "Deidra" → "the nurse practitioner"  
- "Tucson Medical Center" → "the local hospital"

---

## Font Information

The app uses these fonts (match when adding replacement text):
- **Primary font**: Inter (or system sans-serif fallback)
- **Heading weight**: 600-700 (semibold to bold)
- **Body weight**: 400 (regular)
- **Text colors**:
  - Primary text: #1f2937 (gray-800)
  - Muted text: #6b7280 (gray-500)
  - Blue accent: #3b82f6 (blue-500)

---

## Tools for Redaction

### Mac Preview (Built-in, Free)
1. Open image in Preview
2. Tools → Annotate → Rectangle (white fill)
3. Tools → Annotate → Text
4. Match font size visually

### Figma (Free, Web-based)
1. Import screenshot
2. Add rectangles with white fill over PHI
3. Add text layers with Inter font
4. Export as PNG

### Canva (Free, Web-based)
1. Upload screenshot
2. Add shapes to cover PHI
3. Add text with similar fonts
4. Download as PNG

### Photoshop/GIMP
1. Use selection + fill for backgrounds
2. Type tool for replacement text
3. Match fonts and colors precisely














