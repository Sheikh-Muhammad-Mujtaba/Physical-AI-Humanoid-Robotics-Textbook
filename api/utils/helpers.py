import google.generativeai as genai
from typing import List

class GeminiHelper:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self.embedding_model = 'models/embedding-001'

    def embed_text(self, texts: List[str]) -> List[List[float]]:
        """Embeds a list of texts using the Gemini embedding model."""
        if not texts:
            return []
        
        # The embedding API can take a list of texts
        response = genai.embed_content(
            model=self.embedding_model,
            content=texts,
            task_type="RETRIEVAL_DOCUMENT"
        )
        return [embedding.tolist() for embedding in response['embedding']]

    def generate_response(self, prompt: str) -> str:
        """Generates a text response using the Gemini generative model."""
        response = self.model.generate_content(prompt)
        return response.text
