const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

const applyWatermark = async (rutaImagen, originalname) => {
    const { name, ext } = path.parse(originalname);
    const nuevoNombre = `${name}-watermark${ext}`;

    const watermark = "Fotaza 2 - 2026 © Todos los derechos reservados";
    const svgTexto = `
    <svg width="400" height="60">
      <style>
        .titulo { fill: white; font-size: 24px; font-family: sans-serif; font-weight: bold; opacity: 0.5; }
      </style>
      <text x="10" y="40" class="titulo">${watermark}</text>
    </svg>
  `;

    try {
        const bufferConMarcaAgua = await sharp(rutaImagen)
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

