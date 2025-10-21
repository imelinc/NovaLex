import json

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
    
    # Aca iria la logica para procesar la consulta del usuario con IA
    # Por ahora, solo vamos a responder con un mensaje de confirmacion
    response_message = f"Recibí tu consulta: '{user_query}'. Pronto te responderé con IA!"
    
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