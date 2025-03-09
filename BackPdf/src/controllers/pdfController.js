const fs = require('fs');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { Permit } = require('../data');
const { application } = require('express');
const moment = require('moment');

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

// Función para limpiar el texto extraído
const cleanText = (text) => {
    // Normaliza saltos de línea comunes
    text = text.replace(/\r\n|\r|\n/g, '\n');
    // Remueve saltos de línea ocultos (Unicode U+2028 o U+2029)
    text = text.replace(/[\u2028\u2029]/g, ' ');
    text = text.replace(/\s{2,}/g, ' ');
    text = text.replace(/[^\x20-\x7E\n]/g, '');
    return text.trim();
};

const extractData = async (text) => {
    const cleanedText = cleanText(text);
    console.log('Texto limpio:', cleanedText);

    let permitNumber = null;
    let applicationNumber = null;
    let constructionPermitFor = null;
    let dateIssued = null;

    // Opción A: extraer permitNumber y applicationNumber usando bloque condicional
    const finalInspectionIndex = cleanedText.indexOf('FINAL INSPECTION');
    if (finalInspectionIndex !== -1) {
        const linesFromInspection = cleanedText.substring(finalInspectionIndex).split('\n');
        if (linesFromInspection.length >= 5) {
            permitNumber = linesFromInspection[3]?.trim() || null;
            applicationNumber = linesFromInspection[4]?.trim() || null;
        }
    } else {
        const permitLineMatch = cleanedText.match(/PERMIT\s+#:\s*\n(.*?)\n/i);
        if (permitLineMatch && permitLineMatch.length > 1) {
            permitNumber = permitLineMatch[1].trim();
        }
    }
    console.log('Permit Number (pre-pattern):', permitNumber);

    // Reasignar permitNumber según otro patrón
    const permitNumberMatch = cleanedText.match(/36-SN-\d+/);
    permitNumber = permitNumberMatch ? permitNumberMatch[0] : permitNumber;
    console.log('Permit Number (final):', permitNumber);

    // EXTRAER expirationDate desde la sección "EXPIRATION DATE:"
    const expirationSection = cleanedText.split("EXPIRATION DATE:")[1];
    console.log('expirationSection:', expirationSection);
    
    let expirationDate = null;
    if (expirationSection) {
        const dates = expirationSection.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g);
        console.log('Fechas encontradas:', dates);
        // Usar la posición 1 (el segundo valor) si existe; de lo contrario fallback a null
        expirationDate = dates && dates.length >= 2 ? dates[1].trim() : null;
        console.log('expirationDate extraído:', expirationDate);
    }
    if (expirationDate) {
        const mexpirationDate = moment(expirationDate, 'DD/MM/YYYY', true);
        console.log('Fecha parseada:', mexpirationDate);
        expirationDate = mexpirationDate.isValid() ? mexpirationDate.format('YYYY-MM-DD') : null;
        console.log('expirationDate formateado:', expirationDate);
    }

    const applicationNumberMatch = cleanedText.match(/AP\d+/);
    applicationNumber = applicationNumberMatch ? applicationNumberMatch[0] : applicationNumber;
    console.log('Application Number:', applicationNumber);

    // EXTRAER constructionPermitFor y obtener dateIssued basado en posiciones fijas
    // (Suponiendo que: constructionPermitFor está en la línea 130, dateIssued en la 131)
    const lines = cleanedText.split('\n');
    constructionPermitFor = lines.length >= 106 ? lines[105].trim() : null;
    dateIssued = lines.length >= 41 ? lines[40].trim() : null;
    console.log('constructionPermitFor:', constructionPermitFor);
    console.log('dateIssued (raw):', dateIssued);
    
    if (dateIssued) {
        const mDateIssued = moment(dateIssued, 'DD/MM/YYYY', true);
        dateIssued = mDateIssued.isValid() ? mDateIssued.format('YYYY-MM-DD') : null;
    }
    console.log('dateIssued (formateado):', dateIssued);

    // EXTRAER datos del bloque "EXCAVATION REQUIRED:"
    const excavationSection = cleanedText.split("EXCAVATION REQUIRED:")[1];
    console.log('excavationSection:', excavationSection);
    
    let applicant = null;
    let propertyAddress = null;
    let excavationData = null;
    if (excavationSection) {
        // Separar el bloque en líneas y filtrar líneas vacías
        const excavationLines = excavationSection.split('\n').map(line => line.trim()).filter(line => line);
        console.log('Líneas de excavación:', excavationLines);
        
        // Conservamos propertyAddress si se extrae usando un índice fijo (puedes ajustarlo si es necesario)
        propertyAddress = excavationLines.length >= 21 ? excavationLines[20] : null;
        console.log('PropertyAddress:', propertyAddress);
        
        // Para applicant, recorremos las líneas y buscamos la subcadena en paréntesis que contenga "ALLIED REALTY"
        const applicantLine = excavationLines.find(line => line.includes("(ALLIED REALTY"));
        if (applicantLine) {
            const match = applicantLine.match(/\(ALLIED REALTY.*?\)/);
            applicant = match ? match[0] : null;
        }
        console.log('Applicant:', applicant);
        
        excavationData = {
            applicant,
            propertyAddress
            // Agrega otros campos extraídos según el formato
        };
    }
    
    // Mostrar variables finales extrídas
    console.log('Extracción final:');
    console.log('permitNumber:', permitNumber);
    console.log('applicationNumber:', applicationNumber);
    console.log('expirationDate:', expirationDate);
    console.log('constructionPermitFor:', constructionPermitFor);
    console.log('dateIssued:', dateIssued);
    console.log('applicant:', applicant);
    console.log('propertyAddress:', propertyAddress);
    
    return {
        permitNumber,
        applicationNumber,
        documentNumber: cleanedText.match(/DOCUMENT\s+#:(\S+)/i)?.[1]?.trim() || null,
        constructionPermitFor,
        // Asignar los datos extraídos de excavación a los campos correspondientes
        applicant,
        propertyAddress,
        systemType: cleanedText.match(/A\s+TYPE\s+SYSTEM:(.+?)(?=I\s+CONFIGURATION:)/is)?.[1]?.trim() || null,
        configuration: cleanedText.match(/I\s+CONFIGURATION:(.+?)(?=LOCATION\s+OF\s+BENCHMARK:)/is)?.[1]?.trim() || null,
        locationBenchmark: cleanedText.match(/LOCATION\s+OF\s+BENCHMARK:(.+?)(?=ELEVATION\s+OF\s+PROPOSED)/is)?.[1]?.trim() || null,
        elevation: cleanedText.match(/ELEVATION\s+OF\s+PROPOSED\s+SYSTEM\s+SITE(.+?)(?=BOTTOM\s+OF\s+DRAINFIELD)/is)?.[1]?.trim() || null,
        drainfieldDepth: cleanedText.match(/BOTTOM\s+OF\s+DRAINFIELD\s+TO\s+BE(.+?)(?=FILL\s+REQUIRED:)/is)?.[1]?.trim() || null,
        fillRequired: cleanedText.match(/FILL\s+REQUIRED:(.+?)(?=SPECIFICATIONS\s+BY:)/is)?.[1]?.trim() || null,
        specificationsBy: cleanedText.match(/SPECIFICATIONS\s+BY:(.+?)(?=APPROVED\s+BY:)/is)?.[1]?.trim() || null,
        approvedBy: cleanedText.match(/APPROVED\s+BY:(.+?)(?=DATE\s+ISSUED:)/is)?.[1]?.trim() || null,
        dateIssued,
        expirationDate,
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
        // Extraer el texto del PDF usando pdf-parse
        const pdfData = await pdfParse(req.file.buffer);
        console.log('pdfData.text:', pdfData.text);
        const text = pdfData.text;
        const cleanedText = cleanText(text);
        console.log('Texto extraído:', cleanedText);

        // Extraer datos del texto
        const result = await extractData(cleanedText);

        // Crear registro en la base de datos con los datos extraídos
        const permitData = await Permit.create(result);

        res.json({
            message: 'PDF procesado correctamente',
            data: permitData
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