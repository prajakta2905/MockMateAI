/**
 * Bulletproof PDF Text Extractor
 * Uses dynamic import or CDN or FileReader fallback to ensure zero runtime bundle crashes.
 */

export async function extractTextFromPDF(file) {
  // 1. If it's a plain text file
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || '');
      reader.onerror = () => reject(new Error('Failed to read text file.'));
      reader.readAsText(file);
    });
  }

  // 2. Try loading pdfjs dynamically in browser
  try {
    const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs').catch(() => null) ||
                     await import('pdfjs-dist').catch(() => null);

    if (pdfjsLib && pdfjsLib.getDocument) {
      if (!pdfjsLib.GlobalWorkerOptions?.workerSrc) {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
        } catch {
          // ignore worker assignment error
        }
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += pageText + '\n\n';
      }

      if (fullText.trim().length > 20) {
        return fullText.trim();
      }
    }
  } catch (err) {
    console.warn('PDF.js dynamic import extraction notice:', err);
  }

  // 3. Fallback: Extract ASCII strings from raw PDF binary
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let rawString = '';
    
    // Scan ASCII text blocks inside stream objects
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13) {
        rawString += String.fromCharCode(byte);
      } else if (rawString.endsWith(' ') === false) {
        rawString += ' ';
      }
    }

    // Clean up extracted stream tokens
    const cleaned = rawString
      .replace(/\/[A-Za-z0-9]+/g, ' ')
      .replace(/obj|endobj|stream|endstream|xref|trailer|startxref/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned.length > 50) {
      return cleaned;
    }
  } catch (err) {
    console.warn('Binary stream extract fallback notice:', err);
  }

  // 4. Default fallback: Read as Text
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      if (typeof result === 'string' && result.length > 20) {
        resolve(result);
      } else {
        reject(new Error('Could not parse PDF text. Please ensure it contains readable text or try a sample resume.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
