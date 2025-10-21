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
    
    # ifnormacion para debugging
    print(f"Intent detectado: {intent_name}")
    print(f"Consulta del usuario: {user_query}")