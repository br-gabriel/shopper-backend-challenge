import dotenv from "dotenv";
import Measurement from "../models/Measurement";
import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const uploadMeasurement = async(req: Request, res: Response) => {
    const { image, customer_code, measure_datetime, measure_type } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    
    const validMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    const detectMimeTypeFromBase64 = (base64: string): string | undefined => {
        if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
        if (base64.startsWith('/9j/')) return 'image/jpeg';
        if (base64.startsWith('UklGR')) return 'image/webp';
        return undefined;
      };

    const extractNumbers = (response: string): number[] => {
        const numberPattern = /\d+/g;
        return (response.match(numberPattern) || []).map(Number);
    };

    try {
        const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
        const prompt = `Analise a imagem fornecida de um hidrômetro e extraia apenas os números de cor preta. Por favor, ignore e não inclua na resposta quaisquer números que estejam na cor vermelha. Retorne somente os números pretos visíveis na imagem`;

        const mimeType = detectMimeTypeFromBase64(image);

        if (!mimeType || !validMimeTypes.includes(mimeType)) {
            return res.status(400).json({ message: 'Tipo MIME não suportado ou não detectado.' });
        }

        const imageData = {
            inlineData: {
              data: image,
              mimeType: mimeType,
            },
          };

        const result = await model.generateContent([prompt, imageData]);
        const responseText = await result.response.text();

        const extractedValue = extractNumbers(responseText);

        const newMeasurement = new Measurement({
            image_url: 'URL da Imagem',
            measure_time: measure_datetime,
            measure_type: measure_type,
            customer_code: customer_code,
            measure_value: extractedValue[0],
        });

        const savedMeasurement = await newMeasurement.save();

        res.status(200).json({
            image_url: 'URL da Imagem',
            id: savedMeasurement._id,
            measure_value: extractedValue[0],
        });
    } catch (err: any) {
        res
        .status(500)
        .json({ message: "Erro interno do servidor", error: err.message });
    }
};

// const confirmMeasurement = async(req: Request, res: Response) => {
//   try {
//   } catch (err: any) {
//     res
//       .status(500)
//       .json({ message: "Erro interno do servidor", error: err.message });
//   }
// };

// const getListOfMeasurements = async(req: Request, res: Response) => {
//   try {

//   } catch (err: any) {
//     res
//       .status(500)
//       .json({ message: "Erro interno do servidor", error: err.message });
//   }
// };

export {
    uploadMeasurement,
    // confirmMeasurement,
    // getListOfMeasurements,
};