const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

const applyWatermark = async (input, originalname, watermarkText) => {
    const { name, ext } = path.parse(originalname);
    const nuevoNombre = `${name}-watermark${ext}`;

    const watermark = watermarkText || "Fotaza 2 - 2026 © Todos los derechos reservados";
    const svgTexto = `
    <svg width="600" height="80">
      <style>
        .titulo { fill: white; font-size: 20px; font-family: sans-serif; font-weight: bold; opacity: 0.5; }
      </style>
      <text x="15" y="45" class="titulo">${watermark}</text>
    </svg>
  `;

    try {
        const bufferConMarcaAgua = await sharp(input)
            .composite([
                {
                    input: Buffer.from(svgTexto),
                    gravity: 'southeast'
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

