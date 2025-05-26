import DOMPurify from "dompurify";

/**
 * Sanitizes HTML content with allowed tags and attributes
 */
export const sanitizeHtml = (htmlContent: string): string => {
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target']
  });
};

/**
 * Strips all HTML tags from content
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

/**
 * Extracts the first paragraph from HTML content
 */
export const getFirstParagraph = (text: string): string => {
  if (!text) return '';
  const cleaned = text.replace(/<br\s*\/?>/gi, ' '); // Replace <br> tags with spaces
  const paragraph = cleaned.split(/\n|<\/p>|<\/div>/)[0]; // Get first paragraph
  return paragraph.length > 200 ? `${paragraph.substring(0, 200)}...` : paragraph;
};

/**
 * Clean up narrative language to make instructions more direct
 */
const cleanNarrativeLanguage = (text: string): string => {
  return text
    // Remove blog-style phrases
    .replace(/I like to|You can|If you want|I recommend|Feel free to|I usually|You could|You may want to|I prefer to/gi, '')
    // Remove first-person references
    .replace(/I |me |my |we |our |us /gi, '')
    // Remove filler words
    .replace(/actually|basically|simply|just|really|very|quite|literally|honestly/gi, '')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Parse HTML instructions into an array of clean step objects
 */
export const parseInstructionsIntoSteps = (instructions: string): { id: number, text: string }[] => {
  if (!instructions) return [];
  
  // First try to split by numbered steps (1., 2., etc.)
  const numberedStepsRegex = /\d+\.\s+([^.!?]+[.!?])/g;
  const numberedMatches = [...instructions.matchAll(numberedStepsRegex)];
  
  if (numberedMatches.length > 0) {
    return numberedMatches.map((match, index) => ({
      id: index + 1,
      text: cleanNarrativeLanguage(stripHtml(match[1]))
    }));
  }
  
  // If no numbered steps, try to split by sentences
  const cleanText = stripHtml(instructions);
  const sentences = cleanText.split(/(?<=[.!?])\s+/);
  
  // Filter out very short sentences (likely not instructions)
  return sentences
    .filter(sentence => sentence.trim().length > 10)
    .map((sentence, index) => ({
      id: index + 1,
      text: cleanNarrativeLanguage(sentence)
    }));
};

/**
 * Alternative parser that uses HTML structure (p tags, br tags, etc.)
 */
export const parseInstructionsFromHtml = (htmlInstructions: string): { id: number, text: string }[] => {
  if (!htmlInstructions) return [];
  
  // Create temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizeHtml(htmlInstructions);
  
  // Get all paragraphs and list items
  const paragraphs = Array.from(tempDiv.querySelectorAll('p, li'));
  
  if (paragraphs.length > 0) {
    return paragraphs
      .filter(p => p.textContent && p.textContent.trim().length > 10)
      .map((p, index) => ({
        id: index + 1,
        text: cleanNarrativeLanguage(p.textContent || '')
      }));
  }
  
  // If no paragraphs, split by <br> tags
  const brSplit = htmlInstructions.split(/<br\s*\/?>/gi);
  
  if (brSplit.length > 1) {
    return brSplit
      .filter(text => stripHtml(text).trim().length > 10)
      .map((text, index) => ({
        id: index + 1,
        text: cleanNarrativeLanguage(stripHtml(text))
      }));
  }
  
  // Fallback to sentence parsing
  return parseInstructionsIntoSteps(htmlInstructions);
}; 