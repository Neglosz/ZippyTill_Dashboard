/**
 * Sanitizes a string by escaping HTML special characters to prevent XSS.
 * It allows normal special characters like ! @ # $ % ^ & * ( ) _ + - = [ ] { } ; : ' " , . / < > ? \ | ` ~
 * but specifically targets potential script/HTML tags.
 */
const sanitizeHTML = (str) => {
  if (typeof str !== 'string') return str;
  
  // Basic replacement for common HTML tags and script-related characters
  // This converts < to &lt; and > to &gt; which prevents them from being parsed as HTML tags
  // while still allowing the characters themselves to be stored and displayed as text.
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Strips HTML tags entirely from a string.
 */
const stripTags = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>?/gm, '');
};

module.exports = {
  sanitizeHTML,
  stripTags
};
