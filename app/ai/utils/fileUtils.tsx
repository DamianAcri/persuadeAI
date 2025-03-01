// app/ai/analysis/utils/fileUtils.ts

/**
 * Extracts text from various file types (PDF, Word, TXT)
 */
export async function extractTextFromFile(file: File): Promise<string> {
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    switch (fileType) {
      case 'txt':
        return extractFromTxt(file);
      case 'pdf':
        return extractFromPdf(file);
      case 'doc':
      case 'docx':
        return extractFromWord(file);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
  
  /**
   * Extracts text from a TXT file
   */
  async function extractFromTxt(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read text file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading text file'));
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Extracts text from a PDF file
   * Note: This requires pdf.js library for full implementation
   * For now, we'll use a simplified version with a placeholder
   */
  async function extractFromPdf(file: File): Promise<string> {
    // This is a simplified implementation
    // For a complete implementation, you would need to use pdf.js library
    
    // For demonstration purposes, we'll use a basic extraction method
    // In a production environment, consider using a more robust solution
    
    try {
      // Here you would normally use the pdf.js library to parse the PDF
      // For simplicity, we're loading a script dynamically
      
      // Check if PDF.js is already loaded
      if (!(window as any).pdfjsLib) {
        const pdfjsScript = document.createElement('script');
        pdfjsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
        document.head.appendChild(pdfjsScript);
        
        // Wait for the script to load
        await new Promise((resolve) => {
          pdfjsScript.onload = resolve;
        });
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Could not extract text from PDF file. Please try a different file or paste the conversation directly.');
    }
  }
  
  /**
   * Extracts text from a Word document
   * Note: This requires mammoth.js library for full implementation
   */
  async function extractFromWord(file: File): Promise<string> {
    try {
      // Dynamically import mammoth.js if not already available
      if (!(window as any).mammoth) {
        const mammothScript = document.createElement('script');
        mammothScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.0/mammoth.browser.min.js';
        document.head.appendChild(mammothScript);
        
        // Wait for the script to load
        await new Promise((resolve) => {
          mammothScript.onload = resolve;
        });
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const result = await (window as any).mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('Error extracting text from Word document:', error);
      throw new Error('Could not extract text from Word document. Please try a different file or paste the conversation directly.');
    }
  }