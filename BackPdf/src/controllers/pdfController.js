const fs = require('fs');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { Permit } = require('../data');

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
  text = text.replace(/\r\n|\r|\n/g, '\n'); // Mantén los saltos de línea para facilitar la extracción
  text = text.replace(/\s{2,}/g, ' '); // Reemplaza múltiples espacios por uno solo
  text = text.replace(/[^\x20-\x7E\n]/g, ''); // Elimina caracteres no imprimibles, excepto saltos de línea
  return text.trim();
};

const extractData = (text) => {
  const cleanedText = cleanText(text);
  console.log('Texto limpio:', cleanedText); // Agrega este log para ver el texto limpio

  let permitNumber = null;
  let applicationNumber = null;
  let constructionPermitFor = null;

  // Buscar el patrón "FINAL INSPECTION" y capturar las líneas siguientes
  const finalInspectionIndex = cleanedText.indexOf('FINAL INSPECTION');

  if (finalInspectionIndex !== -1) {
    const lines = cleanedText.substring(finalInspectionIndex).split('\n');
    if (lines.length >= 5) {
      permitNumber = lines[3]?.trim() || null;
      applicationNumber = lines[4]?.trim() || null;
    }
  } else {
    // Si no se encuentra "FINAL INSPECTION", buscar "PERMIT #:"
    const permitLineMatch = cleanedText.match(/PERMIT\s+#:\s*\n(.*?)\n/i);
    if (permitLineMatch && permitLineMatch.length > 1) {
      permitNumber = permitLineMatch[1].trim();
    }
  }

   // Extraer permitNumber y applicationNumber de las líneas 144 y 145
   const permitNumberMatch = cleanedText.match(/36-SN-\d+/);
   permitNumber = permitNumberMatch ? permitNumberMatch[0] : null;

   const applicationNumberMatch = cleanedText.match(/AP\d+/);
   applicationNumber = applicationNumberMatch ? applicationNumberMatch[0] : null;

    // Extraer constructionPermitFor
    const constructionPermitForMatch = cleanedText.match(/CONSTRUCTION\s+PERMIT\s+FOR:\s*(?!APPLICANT:)(.*)/i);
    constructionPermitFor = constructionPermitForMatch ? constructionPermitForMatch[1]?.trim() : null;

  return {
    permitNumber,
    applicationNumber,
    documentNumber: cleanedText.match(/DOCUMENT\s+#:(\S+)/i)?.[1]?.trim() || null,
    constructionPermitFor,
    applicant: cleanedText.match(/APPLICANT:(.+?)(?=PROPERTY\s+ADDRESS:)/is)?.[1]?.trim() || null,
    propertyAddress: cleanedText.match(/PROPERTY\s+ADDRESS:(.+?)(?=LOT:)/is)?.[1]?.trim() || null,
    systemType: cleanedText.match(/A\s+TYPE\s+SYSTEM:(.+?)(?=I\s+CONFIGURATION:)/is)?.[1]?.trim() || null,
    configuration: cleanedText.match(/I\s+CONFIGURATION:(.+?)(?=LOCATION\s+OF\s+BENCHMARK:)/is)?.[1]?.trim() || null,
    locationBenchmark: cleanedText.match(/LOCATION\s+OF\s+BENCHMARK:(.+?)(?=ELEVATION\s+OF\s+PROPOSED)/is)?.[1]?.trim() || null,
    elevation: cleanedText.match(/ELEVATION\s+OF\s+PROPOSED\s+SYSTEM\s+SITE(.+?)(?=BOTTOM\s+OF\s+DRAINFIELD)/is)?.[1]?.trim() || null,
    drainfieldDepth: cleanedText.match(/BOTTOM\s+OF\s+DRAINFIELD\s+TO\s+BE(.+?)(?=FILL\s+REQUIRED:)/is)?.[1]?.trim() || null,
    fillRequired: cleanedText.match(/FILL\s+REQUIRED:(.+?)(?=SPECIFICATIONS\s+BY:)/is)?.[1]?.trim() || null,
    specificationsBy: cleanedText.match(/SPECIFICATIONS\s+BY:(.+?)(?=APPROVED\s+BY:)/is)?.[1]?.trim() || null,
    approvedBy: cleanedText.match(/APPROVED\s+BY:(.+?)(?=DATE\s+ISSUED:)/is)?.[1]?.trim() || null,
    dateIssued: cleanedText.match(/DATE\s+ISSUED:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1]?.trim() || null,
    greaseInterceptorCapacity: cleanedText.match(/GREASE\s+INTERCEPTOR\s+CAPACITY\s*[:\]]\s*(\d+)/i)?.[1]?.trim() || null,
    dosingTankCapacity: cleanedText.match(/DOSING\s+TANK\s+CAPACITY\s*[:\]]\s*(\d+)/i)?.[1]?.trim() || null,
    gpdCapacity: cleanedText.match(/\bGPD\s+CAPACITY\s*[:\]]\s*(\d+)/i)?.[1]?.trim() || null,
    squareFeetSystem: cleanedText.match(/\bSQUARE\s+FEET\s+SYSTEM\s*[:\]]\s*(\d+)/i)?.[1]?.trim() || null,
        other: (() => {
            const otherMatch = cleanedText.match(/PERMIT\s+#:\s*(\S+)/i)?.[1]?.trim();
            return otherMatch ? otherMatch.replace(/\n/g, ' ').trim() : null;
        })()
  };
};

const processPdf = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ningún archivo' });
  }

  try {
    const data = await pdfParse(req.file.buffer, { max: 1 }); // Procesar solo la primera hoja
    const text = data.text;
    console.log('Texto extraído:', text); // Agrega este log para ver el texto extraído

    // Guardar el texto extraído en un archivo
    fs.writeFileSync('texto_extraido.txt', text);

    const result = extractData(text);

    const pdfData = await Permit.create(result);

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

