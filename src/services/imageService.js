const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

const escapeXml = (unsafe) => {
    return (unsafe || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

const applyWatermark = async (input, originalname, watermarkText) => {
    const { name, ext } = path.parse(originalname);
    const nuevoNombre = `${name}-watermark${ext}`;

    const watermark = watermarkText ? watermarkText.trim() : "";
    const escapedWatermark = escapeXml(watermark);

    try {
        const image = sharp(input);
        const metadata = await image.metadata();
        const imgWidth = metadata.width || 800;
        const imgHeight = metadata.height || 600;

        // Calcular tamaño de fuente proporcional al ancho de la imagen (2.5% del ancho)
        // Con un mínimo de 16px para imágenes muy pequeñas
        const fontSize = Math.max(16, Math.round(imgWidth * 0.025));
        
        // Coordenadas proporcionales (3% de margen desde los bordes inferior y derecho)
        const xPos = imgWidth - Math.round(imgWidth * 0.03);
        const yPos = imgHeight - Math.round(imgHeight * 0.03);
        
        // Desplazamiento para la sombra
        const shadowOffset = Math.max(1, Math.round(fontSize * 0.05));

        const svgTexto = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${imgWidth}" height="${imgHeight}">
          <style>
            .titulo {
              fill: white;
              font-size: ${fontSize}px;
              font-family: Arial, sans-serif;
              font-weight: bold;
              opacity: 0.75;
            }
            .titulo-shadow {
              fill: black;
              font-size: ${fontSize}px;
              font-family: Arial, sans-serif;
              font-weight: bold;
              opacity: 0.6;
            }
          </style>
          <!-- Sombra para garantizar legibilidad en fondos claros -->
          <text x="${xPos + shadowOffset}" y="${yPos + shadowOffset}" text-anchor="end" class="titulo-shadow">${escapedWatermark}</text>
          <text x="${xPos}" y="${yPos}" text-anchor="end" class="titulo">${escapedWatermark}</text>
        </svg>
        `;

        const bufferConMarcaAgua = await image
            .composite([
                {
                    input: Buffer.from(svgTexto, 'utf-8'),
                    top: 0,
                    left: 0
                }
            ])
            .toBuffer();
        
        return {
            buffer: bufferConMarcaAgua,
            filename: nuevoNombre
        };
    } catch (error) {
        console.error("Error al aplicar la marca de agua: ", error);
        throw error;
    }
}

module.exports = applyWatermark;

