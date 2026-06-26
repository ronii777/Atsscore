import pdfParse from 'pdf-parse';

/**
 * Extracts text from a PDF file buffer.
 * @param {Buffer} pdfBuffer - The raw buffer of the PDF file.
 * @returns {Promise<string>} The extracted and cleaned text.
 */
export async function extractTextFromPDF(pdfBuffer) {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error('Empty PDF buffer provided');
  }

  try {
    const data = await pdfParse(pdfBuffer);
    
    // Clean up extracted text: normalise newlines and spaces to keep prompt size efficient
    let cleanText = data.text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n+/g, '\n\n')
      .trim();

    if (!cleanText) {
      throw new Error('No readable text found in PDF. It might be scanned or image-only.');
    }

    return cleanText;
  } catch (error) {
    console.error('Error during PDF parsing:', error);
    throw new Error(`Failed to parse PDF file: ${error.message}`);
  }
}
