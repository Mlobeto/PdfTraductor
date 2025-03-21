const multer = require('multer');
const pdfParse = require('pdf-parse');
const { PdfData } = require('../data');

// Configurar multer para almacenar el archivo en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Solo se permiten archivos PDF'), false);
    }
    cb(null, true);
  }
});

const cleanText = (text) => {
  // Elimina caracteres especiales no visibles como saltos de línea ocultos
  text = text.replace(/\r\n|\r|\n/g, ' '); // Reemplaza todos los saltos de línea por espacios
  text = text.replace(/\s{2,}/g, ' '); // Reemplaza múltiples espacios por uno solo
  text = text.replace(/[^\x20-\x7E]/g, ''); // Elimina caracteres no imprimibles
  return text.trim();
};

const extractData = (text) => {
  const cleanedText = cleanText(text);

  // Extrae todas las posibles coincidencias que sigan a "PERMIT #:"
  const permitMatches = Array.from(
    cleanedText.matchAll(/PERMIT\s+#:\s*([A-Z0-9\-]+)/gi)
  );
  // Filtrar las coincidencias que no sean "MINIMUM"
  const validPermits = permitMatches
    .map(m => m[1].trim())
    .filter(p => p.toUpperCase() !== 'MINIMUM');
  const permitNumber = validPermits.length > 0 ? validPermits[validPermits.length - 1] : null;

  return {
    permitNumber,
    applicationNumber: cleanedText.match(/APPLICATION\s+#:\s*(\S+)/i)?.[1]?.trim() || null,
    documentNumber: cleanedText.match(/DOCUMENT\s+#:\s*(\S+)/i)?.[1]?.trim() || null,
    constructionPermitFor: cleanedText.match(/CONSTRUCTION\s+PERMIT\s+FOR:\s*(.+?)(?:\s+APPLICANT:|$)/is)?.[1]?.trim() || null,
    applicant: cleanedText.match(/APPLICANT:\s*(.+?)(?:\s+PROPERTY\s+ADDRESS:|$)/is)?.[1]?.trim() || null,
    propertyAddress: cleanedText.match(/PROPERTY\s+ADDRESS:\s*(.+?)(?:\s+LOT:|$)/is)?.[1]?.trim() || null,
    systemType: text.match(/A\s+TYPE\s+SYSTEM:\s*(.+?)(?:\n|I\s+CONFIGURATION:)/is)?.[1]?.trim() || null,
    configuration: text.match(/I\s+CONFIGURATION:\s*(.+?)(?:\n|LOCATION\s+OF\s+BENCHMARK:)/is)?.[1]?.trim() || null,
    locationBenchmark: text.match(/LOCATION\s+OF\s+BENCHMARK:\s*(.+?)(?:\n|ELEVATION\s+OF\s+PROPOSED)/is)?.[1]?.trim() || null,
    elevation: text.match(/ELEVATION\s+OF\s+PROPOSED\s+SYSTEM\s+SITE\s*(.+?)(?:\n|BOTTOM\s+OF\s+DRAINFIELD)/is)?.[1]?.trim() || null,
    drainfieldDepth: text.match(/BOTTOM\s+OF\s+DRAINFIELD\s+TO\s+BE\s*(.+?)(?:\n|FILL\s+REQUIRED)/is)?.[1]?.trim() || null,
    fillRequired: text.match(/FILL\s+REQUIRED:\s*(.+?)(?:\n|SPECIFICATIONS\s+BY:)/is)?.[1]?.trim() || null,
    specificationsBy: text.match(/SPECIFICATIONS\s+BY:\s*(.+?)(?:\n|APPROVED\s+BY:)/is)?.[1]?.trim() || null,
    approvedBy: text.match(/APPROVED\s+BY:\s*(.+?)(?:\n|DATE\s+ISSUED:)/is)?.[1]?.trim() || null,
    dateIssued: text.match(/DATE\s+ISSUED:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1]?.trim() || null,
    expirationDate: text.match(/EXPIRATION\s+DATE:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1]?.trim() || null,
    greaseInterceptorCapacity: text.match(/GREASE\s+INTERCEPTOR\s+CAPACITY\s*[:\]]\s*(\d+)/i)?.[1]?.trim() || null,
    dosingTankCapacity: text.match(/DOSING\s+TANK\s+CAPACITY\s*[:\]]\s*(\d+)/i)?.[1]?.trim() || null,
    gpdCapacity: text.match(/\bGPD\s+CAPACITY\s*[:\]]\s*(\d+)/i)?.[1]?.trim() || null,
    squareFeetSystem: text.match(/\bSQUARE\s+FEET\s+SYSTEM\s*[:\]]\s*(\d+)/i)?.[1]?.trim() || null,
    other: (() => {
      // Aquí puedes ajustar la lógica para otro campo si lo requieres.
      const otherMatch = text.match(/PERMIT\s+#:\s*(\S+)/i)?.[1]?.trim();
      return otherMatch ? otherMatch.replace(/\n/g, ' ').trim() : null;
    })()
  };
};

const processPdf = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ningún archivo' });
  }

  try {
    const data = await pdfParse(req.file.buffer);
    const text = data.text;
    const result = extractData(text);

    const pdfData = await PdfData.create(result);

    res.json({
      message: 'PDF procesado correctamente',
      data: pdfData
    });
  } catch (err) {
    console.error('Error procesando el PDF:', err);
    res.status(500).json({ message: 'Error al procesar el PDF' });
  }
};

module.exports = {
  upload,
  processPdf
};