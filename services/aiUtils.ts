/**
 * Utilitário para retry com backoff exponencial para chamadas de IA.
 * Útil para lidar com erros 503 (Model Overloaded).
 */
export async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Verificando status code 503 ou mensagem de overload
    // A estrutura do erro pode variar dependendo da biblioteca cliente
    const isOverloaded = 
        error.status === 503 || 
        error.code === 503 ||
        (error.message && (
            error.message.toLowerCase().includes('overloaded') || 
            error.message.includes('503') ||
            error.message.toLowerCase().includes('unavailable')
        ));

    if (retries > 0 && isOverloaded) {
      console.warn(`⚠️ Modelo AI sobrecarregado (503). Tentando novamente em ${delay}ms... Restam ${retries} tentativas.`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    
    // Se não for erro de overload ou acabaram as tentativas, lança o erro original
    throw error;
  }
}