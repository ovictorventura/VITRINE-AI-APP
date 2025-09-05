import { GoogleGenAI, Modality, Part } from "@google/genai";
import { AppMode, ImageFile, InputType } from "../types";

// The API key is obtained from the environment variable `process.env.API_KEY`.
// It is assumed to be pre-configured and accessible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Helper function to convert a File object to a Gemini API Part
const fileToGenerativePart = (file: File): Promise<Part> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result) {
        const data = result.split(',')[1];
        resolve({
          inlineData: {
            data,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error('File could not be read.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface GenerateImageParams {
  appMode: AppMode;
  prompt: string;
  aspectRatio: string;
  productImage: ImageFile | null;
  referenceImage?: ImageFile | null;
  characterImage?: ImageFile | null;
  characterPrompt?: string;
  characterInputType?: InputType;
  environmentImage?: ImageFile | null;
  environmentPrompt?: string;
  environmentInputType?: InputType;
}

export const generateImage = async (params: GenerateImageParams): Promise<string[]> => {
  const { 
    appMode, prompt, productImage, referenceImage, 
    characterImage, characterPrompt, characterInputType,
    environmentImage, environmentPrompt, environmentInputType,
    aspectRatio
  } = params;

  if (!productImage) {
    throw new Error("Product image is required.");
  }

  // Use 'gemini-2.5-flash-image-preview' for image editing tasks.
  const model = 'gemini-2.5-flash-image-preview';

  const parts: Part[] = [];

  // Add the product image, which is common to all modes
  const productPart = await fileToGenerativePart(productImage.file);
  // Add context before the image
  parts.push({ text: 'Esta é a imagem do produto:' });
  parts.push(productPart);
  
  // Construct the final text prompt based on the mode and inputs
  let fullPrompt = '';

  switch (appMode) {
    case AppMode.ProductScene:
      fullPrompt = `Usando a imagem do produto fornecida, crie uma nova imagem com base nesta descrição: ${prompt}`;
      break;

    case AppMode.ProductReference:
      if (!referenceImage) throw new Error("Reference image is required for this mode.");
      const referencePart = await fileToGenerativePart(referenceImage.file);
      // Add context before the image
      parts.push({ text: 'Esta é a imagem de referência de estilo:' });
      parts.push(referencePart);
      fullPrompt = `Usando o produto da primeira imagem e o estilo da segunda imagem, crie uma nova cena. Descrição adicional: ${prompt}`;
      break;

    case AppMode.SceneComposition:
      const compositionDescriptions: string[] = [];

      if (characterInputType === 'image' && characterImage) {
        const charImgPart = await fileToGenerativePart(characterImage.file);
        parts.push({ text: 'Use esta imagem para o personagem:' });
        parts.push(charImgPart);
        compositionDescriptions.push('um personagem da imagem de personagem fornecida');
      } else if (characterInputType === 'text' && characterPrompt) {
        compositionDescriptions.push(`um personagem descrito como: "${characterPrompt}"`);
      }

      if (environmentInputType === 'image' && environmentImage) {
        const envImgPart = await fileToGenerativePart(environmentImage.file);
        parts.push({ text: 'Use esta imagem para o ambiente:' });
        parts.push(envImgPart);
        compositionDescriptions.push('um ambiente da imagem de ambiente fornecida');
      } else if (environmentInputType === 'text' && environmentPrompt) {
        compositionDescriptions.push(`um ambiente descrito como: "${environmentPrompt}"`);
      }
      
      fullPrompt = `Crie uma cena com o produto da primeira imagem. A cena também deve incluir ${compositionDescriptions.join(' e ')}. Descrição geral da cena: ${prompt}`;
      break;
  }
  
  parts.push({ text: fullPrompt.trim() });
  // Add a separate, explicit instruction for aspect ratio to ensure it's followed.
  parts.push({ text: `Instrução final e mais importante: a imagem de saída DEVE OBRIGATORIAMENTE ter a proporção de aspecto de ${aspectRatio}.` });
  
  try {
    const generateRequest = {
      model: model,
      contents: { parts },
      config: {
        // Must include both Modality.IMAGE and Modality.TEXT for image editing/generation
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    };

    // Make two parallel API calls to ensure we get two image options
    const [response1, response2] = await Promise.all([
      ai.models.generateContent(generateRequest),
      ai.models.generateContent(generateRequest)
    ]);

    const allGeneratedImages: string[] = [];
    const responses = [response1, response2];
    let textFallback = '';

    // Process both responses
    for (const response of responses) {
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes = part.inlineData.data;
            const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            allGeneratedImages.push(imageUrl);
          } else if (part.text) {
             // Store the first text response as a potential fallback error message
             if (!textFallback) {
                textFallback = part.text;
             }
          }
        }
      }
    }

    if (allGeneratedImages.length === 0) {
      throw new Error(textFallback || "A imagem não pôde ser gerada. Tente ajustar o prompt.");
    }
    
    // Return only up to 2 images to keep it consistent
    return allGeneratedImages.slice(0, 2);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`API Error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while generating the image.");
  }
};

interface EditImageParams {
  baseImage: ImageFile;
  maskImage: ImageFile;
  prompt: string;
  aspectRatio: string;
}

export const editImage = async (params: EditImageParams): Promise<string[]> => {
  const { baseImage, maskImage, prompt, aspectRatio } = params;
  const model = 'gemini-2.5-flash-image-preview';

  const baseImagePart = await fileToGenerativePart(baseImage.file);
  const maskPart = await fileToGenerativePart(maskImage.file);

  // Removed the contradictory aspect ratio instruction. The model should preserve the original aspect ratio during edits.
  const fullPrompt = `Usando a imagem base e a máscara, edite a área branca da máscara de acordo com esta instrução: "${prompt}". Mantenha o resto da imagem inalterado, incluindo sua proporção original.`;

  const parts: Part[] = [
    { text: "Imagem base:" },
    baseImagePart,
    { text: "Máscara (edite a área branca):" },
    maskPart,
    { text: fullPrompt }
  ];

  try {
    const generateRequest = {
      model: model,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    };

    // Generate two options
    const [response1, response2] = await Promise.all([
      ai.models.generateContent(generateRequest),
      ai.models.generateContent(generateRequest)
    ]);
    
    const allGeneratedImages: string[] = [];
    const responses = [response1, response2];
    let textFallback = '';

    for (const response of responses) {
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes = part.inlineData.data;
            const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            allGeneratedImages.push(imageUrl);
          } else if (part.text) {
             if (!textFallback) {
                textFallback = part.text;
             }
          }
        }
      }
    }

    if (allGeneratedImages.length === 0) {
      throw new Error(textFallback || "A imagem não pôde ser editada. Tente ajustar o prompt.");
    }
    
    return allGeneratedImages.slice(0, 2);

  } catch (error) {
    console.error("Error calling Gemini API for editing:", error);
    if (error instanceof Error) {
      throw new Error(`API Error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while editing the image.");
  }
};