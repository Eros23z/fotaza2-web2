const sharp = require('sharp');
const Jimp = require('jimp');
const path = require('path');

const applyWatermark = async (input, originalname, watermarkText) => {
    const { name, ext } = path.parse(originalname);
    const nuevoNombre = `${name}-watermark${ext}`;

    const watermark = watermarkText ? watermarkText.trim() : "";

    try {
        // Convertir el buffer de entrada a PNG 
        const pngBuffer = await sharp(input).png().toBuffer();
        const image = await Jimp.read(pngBuffer);
        const imgWidth = image.getWidth();
        const imgHeight = image.getHeight();

        // Elegir fuente segun el ancho de la imagen 
        let fontBlack, fontWhite;
        if (imgWidth >= 1000) {
            fontBlack = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
            fontWhite = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
        } else if (imgWidth >= 500) {
            fontBlack = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
            fontWhite = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        } else {
            fontBlack = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
            fontWhite = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
        }

        // Calcular posición inferior derecha con margen del 3%
        const margen = Math.round(imgWidth * 0.03);
        const textWidth = Jimp.measureText(fontWhite, watermark);
        const textHeight = Jimp.measureTextHeight(fontWhite, watermark, textWidth);
        const x = imgWidth - textWidth - margen;
        const y = imgHeight - textHeight - margen;

        // Aplicar sombra y luego el texto blanco encima
        image.print(fontBlack, x + 1, y + 1, watermark);
        image.print(fontWhite, x, y, watermark);

        // Exportar de vuelta al formato original usando sharp
        const finalBuffer = await sharp(await image.getBufferAsync(Jimp.MIME_PNG))
            .toFormat(ext.replace('.', '') === 'jpg' ? 'jpeg' : ext.replace('.', ''))
            .toBuffer();

        return {
            buffer: finalBuffer,
            filename: nuevoNombre
        };
    } catch (error) {
        console.error("Error al aplicar la marca de agua: ", error);
        throw error;
    }
}

module.exports = applyWatermark;
