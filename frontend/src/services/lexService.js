import {LexRuntimeV2Client, RecognizeTextCommand} from '@aws-sdk/client-lex-runtime-v2'

// Agregamos la configuracion del cliente ahora
const lexClient = new LexRuntimeV2Client({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
});

export const sendMessageToLex = async (message, sessionId) => {

    const params = {
        botId: import.meta.env.VITE_LEX_BOT_ID,
        botAliasId: import.meta.env.VITE_LEX_BOT_ALIAS_ID,
        localeId: import.meta.env.VITE_LEX_LOCALE_ID,
        sessionId: sessionId,
        text: message,
    };

    try {
        const command = new RecognizeTextCommand(params);
        const response = await lexClient.send(command);
        return response;
    } catch (error) {
        console.error("Error al comunicarse con Lex:", error);
        throw error;
    }
};


