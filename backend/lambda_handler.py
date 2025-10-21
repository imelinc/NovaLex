import json
import boto3

bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1') # cliente para invocar el modelo de Bedrock

def lambda_handler(event, context):
    """
    Funcion principal que maneja las peticiones de Amazon Lex.

    Args:
        event: Evento de Amazon Lex.
        context: Contexto de la funcion.

    Returns:
        Respuesta de Amazon Lex.
    """

    # imprimimos el evento completo para debugging
    print(f"Evento completo: {json.dumps(event, indent=2)}")

    #Vamos a extraer informacion del intent de Lex
    intent_name = event['sessionState']['intent']['name'] # nombre del intent (ConsultaGeneral)
    slots = event['sessionState']['intent']['slots'] # slots del intent que detecto Lex
    
    user_query = None # Aca inicializamos la variable de la consulta del usuario
    if slots.get('query') and slots['query'].get('value'): # buscamos el slot 'query' y su valor
        user_query = slots['query']['value']['interpretedValue'] # Extraemos el valor del slot 'query'

    # informacion para debugging
    print(f"Intent detectado: {intent_name}")
    print(f"Consulta del usuario: {user_query}")
    
    if not user_query:
        response_message = "No se pudo procesar tu consulta. Por favor, intenta nuevamente."
    else:
        response_message = get_ai_response(user_query)
        
    # Construimos la respuesta para Lex
    response = {
        'sessionState': {
            'dialogAction': {
                'type': 'Close'
            },
            'intent': {
                'name': intent_name,
                'state': 'Fulfilled'
            }
        },
        'messages': [
            {
                'contentType': 'PlainText',
                'content': response_message
            }
        ]
    }
    
    return response

def get_ai_response(user_query):
    """
    Llama a Amazon Bedrock (Claude) para obtener una respuesta a la consulta del usuario
    """
    try:
        model_id = "anthropic.claude-3-haiku-20240307-v1:0"
        
        # prompt
        prompt = f"""Eres un asistente de IA útil. Responde la 
        siguiente pregunta en el MISMO idioma en que está escrita.
        Sé conciso y preciso.
        
        Pregunta: {user_query}
        
        Proporciona una respuesta clara y util."""
        
        # preparamos el body de la peticion a Bedrock
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 400,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7
        }
        
        print(f"Llamando a Bedrock con modelo: {model_id}")
        
        # invocamos el modelo de Bedrock
        response = bedrock_runtime.invoke_model(
            modelId=model_id,
            body=json.dumps(request_body)
        )
        
        # parseamos la respuesta de Bedrock
        response_body = json.loads(response['body'].read())
        
        # extraemos la respuesta del modelo
        ai_response = response_body['content'][0]['text']
        
        return ai_response
    
    except Exception as e:
        print(f"Error al llamar a Bedrock: {str(e)}")
        # En caso de error, devolver un mensaje
        return "Disculpa, encontré un error al procesar tu consulta. Por favor intenta de nuevo."