import dotenv from "dotenv";
import Measurement from "../models/Measurement";
import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileTypeFromBuffer } from "file-type";

dotenv.config();

const uploadMeasurement = async(req: Request, res: Response) => {
    const { image, customer_code, measure_type, measure_datetime } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

    try {
        if (!image || !customer_code || !measure_type || !measure_datetime) {
            return res.status(400).json({
              error_code: "INVALID_DATA",
              error_description: "Os dados fornecidos no corpo da requisição são inválidos",
            });
        }

        const measureDate = new Date(measure_datetime);

        const existingMeasurement = await Measurement.findOne({
            customer_code,
            measure_type,
            $expr: {
              $and: [
                { $eq: [{ $month: "$measure_datetime" }, measureDate.getMonth() + 1] },
                { $eq: [{ $year: "$measure_datetime" }, measureDate.getFullYear()] }
              ]
            }
        } as any);

        if (existingMeasurement) {
            return res.status(409).json({
              error_code: "DOUBLE_REPORT",
              error_description: "Leitura do mês já realizada",
            });
        }


        const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Leia a imagem e me retorne apenas os números dentro do registro (o registro é a área retangular com dígitos dentro, o valor a ser lido é apenas esses), trazendo apenas os números como caracteres`;

        const buffer: Buffer = Buffer.from(image, 'base64');
        const fileInfo = await fileTypeFromBuffer(buffer);
        
        if(!fileInfo) {
            return res.status(400).json({ message: "Tipo de arquivo não suportado" })
        };
        
        const mimeType = fileInfo.mime;

        const imageData  = {
            inlineData: {
                data: image,
                mimeType: mimeType,
            }
        };

        const result = await model.generateContent([imageData, prompt]);
        const responseText = await result.response.text();
        const value = parseInt(responseText);

        const fakeUrlImage = "https://example.com/YHfbdomsWEx";

        const measurement = new Measurement({
            measure_datetime: measure_datetime,
            measure_type: measure_type,
            measure_value: value,
            customer_code: customer_code,
            image_url: fakeUrlImage,
        });

        await measurement.save();

        res.status(200).json({ image_url: fakeUrlImage, measure_value: value, measure_uuid: measurement._id });
    } catch (err: any) {
        res
        .status(500)
        .json({ message: "Erro interno do servidor", error: err.message });
    }
};

const confirmMeasurement = async(req: Request, res: Response) => {
  const { _id, confirmed_value } = req.body;
  
  try {
    if (!_id || isNaN(confirmed_value)) {
        return res.status(400).json({
            error_code: "INVALID_DATA", 
            error_description: "Os dados fornecidos no corpo da requisição são inválidos"
        });
    }

    const measurementExists = await Measurement.findById({ _id });
    
    if (!measurementExists) {
        return res.status(404).json({
            error_code: "MEASURE_NOT_FOUND", 
            error_description: "Leitura não encontrada"
        })
    }

    if (measurementExists.has_confirmed == true) {
        return res.status(409).json({
            error_code: "CONFIRMATION_DUPLICATE", 
            error_description: "Leitura do mês já confirmada"
        })
    }

    measurementExists.measure_value = confirmed_value
    measurementExists.has_confirmed = true;
    await measurementExists.save();

    res.status(200).json({ sucess: true })
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Erro interno do servidor", error: err.message });
  }
};

const getListOfMeasurements = async(req: Request, res: Response) => {
    const customer_code = req.params.id;
    const measure_type = req.query.measure_type as string;
  
    try {
        if (!customer_code) {
            return res.status(400).json({
              error_code: "INVALID_CUSTOMER_CODE",
              error_description: "O código do cliente inválido",
            });
        }

        let filter: any = { customer_code };

        if (measure_type) {
            const normalizedMeasureType = measure_type.toUpperCase();
            const allowedMeasureTypes = ["WATER", "GAS"];

            if (!allowedMeasureTypes.includes(normalizedMeasureType)) {
                return res.status(400).json({
                    error_code: "INVALID_TYPE",
                    error_description: "Tipo de medição não permitida"
                })
            }
            filter = { customer_code, normalizedMeasureType };
        }

        const measurementsList = await Measurement.find(filter);

        if (measurementsList.length === 0) {
            return res.status(404).json({
              error_code: "MEASURES_NOT_FOUND",
              error_description: "Nenhuma leitura encontrada",
            });
        }

        res.status(200).json({customer_code , measures: measurementsList})
    } catch (err: any) {
        res
        .status(500)
        .json({ message: "Erro interno do servidor", error: err.message });
    }
};

export {
    uploadMeasurement,
    confirmMeasurement,
    getListOfMeasurements,
};