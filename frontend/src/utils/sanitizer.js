/**
 * Sanitizes a string by escaping HTML special characters to match backend storage.
 */
export const sanitizeHTML = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Removes Thai tone marks and vowels that might interfere with basic search.
 */
export const stripThaiToneMarks = (str) => {
  if (typeof str !== 'string') return str;
  // This regex targets Thai tone marks and some vowels
  // 0E48-0E4B are tone marks (ไม้เอก, โท, ตรี, จัตวา)
  // 0E4C is การันต์
  // 0E47 is ไม้ไต่คู้
  // 0E31 is ไม้หันอากาศ
  // 0E34-0E37 are upper vowels
  return str.replace(/[\u0E31\u0E34-\u0E37\u0E47-\u0E4C]/g, "");
};

