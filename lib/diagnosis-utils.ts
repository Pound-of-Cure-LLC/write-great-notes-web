/**
 * Diagnosis utility functions - mirrors backend diagnosis parsing logic
 * from app/adapters/charm.py push_note_to_emr function (lines 2400-2426)
 */

export interface ParsedDiagnosis {
  diagnosis: string;
  code: string;
  comments?: string | null;
}

/**
 * Parse diagnoses from database field.
 * Handles both structured list format and legacy string format.
 *
 * @param diagnosesRaw - Raw diagnoses field from API (can be array, string, or null)
 * @returns Array of parsed diagnosis objects
 */
export function parseDiagnoses(diagnosesRaw: any): ParsedDiagnosis[] {
  const parsedDiagnoses: ParsedDiagnosis[] = [];

  if (!diagnosesRaw) {
    return parsedDiagnoses;
  }

  // Handle JSON string (from database JSONB field)
  if (typeof diagnosesRaw === 'string') {
    try {
      const parsed = JSON.parse(diagnosesRaw);
      if (Array.isArray(parsed)) {
        // Recursively parse the array
        return parseDiagnoses(parsed);
      }
    } catch (e) {
      // Not valid JSON, treat as legacy formatted string
      const stringParsed = parseDiagnosesFromString(diagnosesRaw);
      parsedDiagnoses.push(...stringParsed);
      return parsedDiagnoses;
    }
  }

  if (Array.isArray(diagnosesRaw)) {
    // New structured format: list of DiagnosisItem objects (dicts with diagnosis, code, comments)
    // Validate and normalize the structure
    for (const d of diagnosesRaw) {
      if (typeof d === 'object' && d !== null) {
        let diagnosisName = d.diagnosis || d.name || '';
        let diagnosisCode = d.code || '';
        
        // If code is missing, try to extract it from diagnosis name
        // Format: "**Diagnosis Name [CODE]:** description"
        if (!diagnosisCode && diagnosisName) {
          // Extract code from brackets like [E66.813] or [Z98.84]
          const codeMatch = diagnosisName.match(/\[([A-Z]\d{2,3}(?:\.\d+)?)\]/);
          if (codeMatch && codeMatch[1]) {
            diagnosisCode = codeMatch[1];
            // Clean up diagnosis name - remove code in brackets
            diagnosisName = diagnosisName.replace(/\[([A-Z]\d{2,3}(?:\.\d+)?)\]/, '').trim();
          }
        }
        
        // Ensure we have the expected structure
        const diagnosisDict: ParsedDiagnosis = {
          diagnosis: diagnosisName,
          code: diagnosisCode,
          comments: d.comments || null,
        };
        // Only include if we have at least diagnosis name and code
        if (diagnosisDict.diagnosis && diagnosisDict.code) {
          parsedDiagnoses.push(diagnosisDict);
        }
      }
    }
  }

  return parsedDiagnoses;
}

/**
 * Parse diagnoses from formatted string format.
 * Mirrors backend _parse_diagnoses_from_string function.
 *
 * Handles formats like:
 * - "Diagnosis Name — ICD_CODE"
 * - "- Diagnosis Name — ICD_CODE"
 * - "- Diagnosis Name - Description — ICD_CODE"
 *
 * @param diagnosesStr - Formatted string with diagnoses
 * @returns Array of parsed diagnosis objects
 */
export function parseDiagnosesFromString(diagnosesStr: string): ParsedDiagnosis[] {
  if (!diagnosesStr || typeof diagnosesStr !== 'string') {
    return [];
  }

  const diagnoses: ParsedDiagnosis[] = [];
  const lines = diagnosesStr.trim().split('\n');

  for (let line of lines) {
    line = line.trim();
    if (!line) {
      continue;
    }

    // Remove leading bullet point if present
    if (line.startsWith('- ')) {
      line = line.substring(2);
    } else if (line.startsWith('• ')) {
      line = line.substring(2);
    }

    let parts: string[];
    let diagnosisName: string;
    let codePart: string;

    // Split by em dash (—) or double dash (--) to separate name from code
    if (line.includes(' — ')) {
      parts = line.split(' — ', 2);
      diagnosisName = parts[0]?.trim() || '';
      codePart = parts[1]?.trim() || '';
    } else if (line.includes(' -- ')) {
      parts = line.split(' -- ', 2);
      diagnosisName = parts[0]?.trim() || '';
      codePart = parts[1]?.trim() || '';
    } else if (line.includes(' - ')) {
      // Check if it's a code at the end (starts with letter + numbers)
      // Pattern: ends with " - CODE" where CODE is like E66.813 or I10
      const codeMatch = line.match(/ - ([A-Z]\d{2}(?:\.\d+)?)$/);
      if (codeMatch && codeMatch[1] && codeMatch.index !== undefined) {
        diagnosisName = line.substring(0, codeMatch.index).trim();
        codePart = codeMatch[1] || '';
      } else {
        // Regular description separator
        const lastDashIndex = line.lastIndexOf(' - ');
        diagnosisName = line.substring(0, lastDashIndex).trim();
        codePart = line.substring(lastDashIndex + 3).trim();
      }
    } else {
      // No separator found, treat entire line as diagnosis name
      diagnosisName = line;
      codePart = '';
    }

    if (!diagnosisName) {
      continue;
    }

    // Extract code (remove any trailing description)
    // Code format: E66.813, I10, Z71.3 (letter + digits + optional decimal)
    const codeRegex = /([A-Z]\d{2}(?:\.\d+)?)/;
    const codeMatch = codePart.match(codeRegex);
    const diagnosisCode = codeMatch && codeMatch[1] ? codeMatch[1] : '';

    // Extract comments (anything after the code)
    let comments = '';
    if (codeMatch && codeMatch.index !== undefined) {
      const codeEndIndex = codeMatch.index + codeMatch[0].length;
      if (codeEndIndex < codePart.length) {
        comments = codePart.substring(codeEndIndex).trim();
        // Remove leading dash or comma if present
        comments = comments.replace(/^[-,]\s*/, '');
      }
    }

    diagnoses.push({
      diagnosis: diagnosisName,
      code: diagnosisCode,
      comments: comments || null,
    });
  }

  return diagnoses;
}

/**
 * Strip markdown formatting from text.
 * Converts **bold** to bold text, _italic_ to italic text, etc.
 * 
 * @param text - Text with markdown formatting
 * @returns Plain text without markdown syntax
 */
function stripMarkdown(text: string): string {
  if (!text) return text;
  
  // Remove bold: **text** or __text__ → text
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/__(.+?)__/g, '$1');
  
  // Remove italic: *text* or _text_ → text
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/_(.+?)_/g, '$1');
  
  // Remove code in brackets like [E66.813] if it appears in the diagnosis name
  // The code should be in the separate code field, not embedded in the name
  text = text.replace(/\[([A-Z]\d{2,3}(?:\.\d+)?)\]/g, '');
  
  // Remove trailing colons and extra whitespace
  text = text.replace(/:\s*$/, '').trim();
  
  return text;
}

/**
 * Format a diagnosis for display.
 * Format: "Diagnosis Name (Code)" or "Diagnosis Name (Code) - Comments"
 *
 * @param diagnosis - Parsed diagnosis object
 * @returns Formatted string for display
 */
export function formatDiagnosisForDisplay(diagnosis: ParsedDiagnosis): string {
  // Strip markdown from diagnosis name and comments
  const cleanDiagnosis = stripMarkdown(diagnosis.diagnosis);
  const cleanComments = diagnosis.comments ? stripMarkdown(diagnosis.comments) : null;
  
  const parts: string[] = [cleanDiagnosis];

  if (diagnosis.code) {
    parts.push(`(${diagnosis.code})`);
  }

  if (cleanComments && cleanComments.trim()) {
    parts.push(`- ${cleanComments}`);
  }

  return parts.join(' ');
}

