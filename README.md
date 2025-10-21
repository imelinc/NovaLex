# NovaLex

NovaLex es un chatbot inteligente y completamente serverless, desarrollado sobre la capa gratuita de AWS. Utiliza Amazon Lex para el procesamiento de lenguaje natural y AWS Lambda para gestionar la lógica conversacional de manera dinámica, sin almacenar información ni mantener sesiones.

## 🚀 Características

- **Procesamiento de Lenguaje Natural**: Integración con Amazon Lex V2
- **IA Generativa**: Respuestas potenciadas por Amazon Bedrock (Claude)
- **Arquitectura Serverless**: Backend en AWS Lambda, 100% escalable
- **Frontend Moderno**: Desarrollado con React + Vite
- **Sin Gestión de Estado**: Sin base de datos, completamente stateless
- **Multiidioma**: Soporte para español (es_419) y otros idiomas

## 📋 Requisitos Previos

- Cuenta de AWS activa
- Node.js (versión 18+)
- Python 3.9+ (para el backend Lambda)
- AWS CLI configurado (opcional pero recomendado)

## 🏗️ Arquitectura

```
Frontend (React) → Amazon Lex V2 → AWS Lambda → Amazon Bedrock (Claude)
```

## 📦 Estructura del Proyecto

```
NovaLex/
├── backend/
│   ├── lambda_handler.py       # Función Lambda principal
│   └── requirements.txt        # Dependencias de Python
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Componente principal
│   │   ├── components/
│   │   │   ├── ChatBot.jsx    # Componente del chatbot
│   │   │   └── ChatBot.css    # Estilos del chatbot
│   │   └── services/
│   │       └── lexService.js  # Cliente de Lex V2
│   ├── package.json
│   └── .env.example           # Plantilla de variables de entorno
└── README.md
```

## ⚙️ Configuración

### 1. Configurar AWS Bedrock

1. Ve a la consola de AWS Bedrock
2. Solicita acceso al modelo **Claude 3 Haiku** (anthropic.claude-3-haiku-20240307-v1:0)
3. Espera la aprobación (puede tardar unos minutos)

### 2. Crear el Bot de Amazon Lex

1. Ve a la consola de Amazon Lex V2
2. Crea un nuevo bot con las siguientes características:
   - **Nombre**: NovaLex
   - **Idioma**: Spanish (es_419)
   - **IAM Role**: Crea un nuevo rol o usa uno existente

3. Crea un **Intent** llamado `ConsultaGeneral`:
   - **Sample utterances** (ejemplos):
     - `{query}`
     - `quiero saber sobre {query}`
     - `dime acerca de {query}`
   - **Slot**: 
     - Nombre: `query`
     - Tipo: `AMAZON.FreeFormInput`
     - Prompt: "¿Qué te gustaría saber?"

4. Configura el **Fulfillment**:
   - Selecciona "AWS Lambda function"
   - Selecciona la función Lambda que crearás en el siguiente paso

5. **Build** el bot y crea un **Alias** (por ejemplo, "Production")

### 3. Configurar AWS Lambda

1. Ve a la consola de AWS Lambda
2. Crea una nueva función:
   - **Nombre**: NovaLex-Handler
   - **Runtime**: Python 3.9 o superior
   - **Arquitectura**: x86_64

3. Copia el código de `backend/lambda_handler.py` en el editor de Lambda

4. Configurar permisos IAM:
   - Añade la política `AmazonBedrockFullAccess` al rol de ejecución
   - O crea una política personalizada con permisos para:
     - `bedrock:InvokeModel`

5. Configuración de la función:
   - **Timeout**: 30 segundos (recomendado)
   - **Memoria**: 256 MB (mínimo)

6. Añade un **Resource-based policy** para permitir que Lex invoque la función:
   ```json
   {
     "Effect": "Allow",
     "Principal": {
       "Service": "lexv2.amazonaws.com"
     },
     "Action": "lambda:InvokeFunction",
     "Resource": "arn:aws:lambda:REGION:ACCOUNT_ID:function:NovaLex-Handler"
   }
   ```

### 4. Configurar el Frontend

1. Navega a la carpeta frontend:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Copia el archivo de ejemplo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

4. Edita `.env` con tus credenciales de AWS:
   ```env
   VITE_AWS_REGION=us-east-1
   VITE_AWS_ACCESS_KEY_ID=tu_access_key_id
   VITE_AWS_SECRET_ACCESS_KEY=tu_secret_access_key
   VITE_LEX_BOT_ID=tu_bot_id
   VITE_LEX_BOT_ALIAS_ID=tu_bot_alias_id
   VITE_LEX_LOCALE_ID=es_419
   ```

   **Obtener credenciales:**
   - Bot ID y Alias ID: En la consola de Lex, ve a tu bot → Settings
   - Access Keys: IAM → Users → Security Credentials
   - ⚠️ **Importante**: Para producción, usa AWS Cognito en lugar de credenciales directas

## 🚀 Ejecutar el Proyecto

### Modo Desarrollo

```bash
cd frontend
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

### Construir para Producción

```bash
cd frontend
npm run build
```

Los archivos optimizados estarán en `frontend/dist/`

## 🌐 Despliegue

### Opción 1: AWS S3 + CloudFront

1. Construye el proyecto:
   ```bash
   npm run build
   ```

2. Crea un bucket de S3:
   ```bash
   aws s3 mb s3://novalex-frontend
   ```

3. Configura el bucket para hosting estático:
   ```bash
   aws s3 website s3://novalex-frontend --index-document index.html
   ```

4. Sube los archivos:
   ```bash
   aws s3 sync dist/ s3://novalex-frontend --acl public-read
   ```

5. (Opcional) Configura CloudFront para HTTPS y CDN

### Opción 2: Vercel

```bash
npm install -g vercel
vercel --prod
```

### Opción 3: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## 🔒 Seguridad

⚠️ **IMPORTANTE**: El archivo `.env` contiene credenciales sensibles.

- **Nunca** subas el archivo `.env` a repositorios públicos
- **Usa AWS Cognito** para autenticación en producción
- **Implementa AWS IAM Roles** en lugar de access keys
- **Habilita MFA** en tu cuenta de AWS

### Implementar AWS Cognito (Recomendado para Producción)

1. Crea un User Pool en AWS Cognito
2. Crea un Identity Pool con acceso a Lex
3. Actualiza `lexService.js` para usar Cognito:

```javascript
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

const lexClient = new LexRuntimeV2Client({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: import.meta.env.VITE_AWS_REGION }),
        identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID
    })
});
```

## 🧪 Pruebas

Ejemplos de consultas para probar:

- "¿Qué es la inteligencia artificial?"
- "Explícame qué es AWS Lambda"
- "¿Cuál es la capital de Francia?"
- "Hazme un resumen de la teoría de la relatividad"

## 🐛 Solución de Problemas

### Error: "No se pudo comunicar con Lex"

- Verifica que las credenciales en `.env` sean correctas
- Comprueba que el Bot ID y Alias ID coincidan
- Revisa los permisos IAM del usuario

### Error: "Timeout" en Lambda

- Aumenta el timeout de la función Lambda (30-60 segundos)
- Verifica que Bedrock esté disponible en tu región

### Bot responde "Lo siento, no entendí eso"

- Verifica que el slot `query` esté configurado correctamente
- Comprueba los logs de CloudWatch en Lambda
- Asegúrate de que el fulfillment esté conectado a Lambda

## 📊 Costos Estimados

Con la **capa gratuita de AWS**:

- **Amazon Lex**: 10,000 solicitudes/mes gratis
- **AWS Lambda**: 1M solicitudes + 400,000 GB-s gratis
- **Amazon Bedrock**: Varía según el modelo (Claude Haiku ~$0.00025/1K tokens)
- **S3 + CloudFront**: 5GB almacenamiento + 50GB transferencia gratis

**Estimación**: Gratis para ~5,000-10,000 conversaciones/mes

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autor

**NovaLex Team**

## 🙏 Agradecimientos

- Amazon Web Services por la infraestructura
- Anthropic por el modelo Claude
- La comunidad de React y Vite

---

**¿Preguntas?** Abre un issue en GitHub o contacta al equipo de desarrollo.

