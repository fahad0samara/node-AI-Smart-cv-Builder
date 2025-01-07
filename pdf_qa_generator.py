import PyPDF2
import re
from typing import List, Dict
import spacy
import random
from enum import Enum

class QuestionType(Enum):
    MULTIPLE_CHOICE = "Multiple Choice"
    OPEN_ENDED = "Open Ended"
    TRUE_FALSE = "True/False"

class DifficultyLevel(Enum):
    BASIC = "Basic"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

class QAPair:
    def __init__(self, question: str, answer: str, source: str, 
                 difficulty: DifficultyLevel, q_type: QuestionType):
        self.question = question
        self.answer = answer
        self.source = source
        self.difficulty = difficulty
        self.type = q_type

    def __str__(self):
        return f"""Q: {self.question}
A: {self.answer}
Source: {self.source}
Difficulty: {self.difficulty.value}
Type: {self.type.value}
"""

class PDFQAGenerator:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Downloading spacy model...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")

    def extract_text_from_pdf(self, pdf_path: str) -> Dict[int, str]:
        """Extract text from PDF with page numbers."""
        text_by_page = {}
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num in range(len(pdf_reader.pages)):
                    text = pdf_reader.pages[page_num].extract_text()
                    text_by_page[page_num + 1] = text
            return text_by_page
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return {}

    def generate_questions(self, text_by_page: Dict[int, str], questions_per_page: int = 3) -> List[QAPair]:
        qa_pairs = []
        
        for page_num, text in text_by_page.items():
            doc = self.nlp(text)
            
            # Generate different types of questions for each page
            for _ in range(questions_per_page):
                # Randomly select question type and difficulty
                q_type = random.choice(list(QuestionType))
                difficulty = random.choice(list(DifficultyLevel))
                
                # Generate question based on the content
                sentences = [sent.text.strip() for sent in doc.sents]
                if not sentences:
                    continue
                    
                sentence = random.choice(sentences)
                
                if q_type == QuestionType.TRUE_FALSE:
                    qa_pair = self._generate_true_false(sentence, page_num, difficulty)
                elif q_type == QuestionType.MULTIPLE_CHOICE:
                    qa_pair = self._generate_multiple_choice(sentence, sentences, page_num, difficulty)
                else:
                    qa_pair = self._generate_open_ended(sentence, page_num, difficulty)
                
                if qa_pair:
                    qa_pairs.append(qa_pair)
                    
        return qa_pairs

    def _generate_true_false(self, sentence: str, page_num: int, difficulty: DifficultyLevel) -> QAPair:
        """Generate a true/false question from a sentence."""
        is_true = random.choice([True, False])
        if is_true:
            question = f"True or False: {sentence}"
            answer = "True"
        else:
            # Modify the sentence to make it false
            doc = self.nlp(sentence)
            modified = sentence
            for token in doc:
                if token.pos_ in ["VERB", "ADJ", "NUM"]:
                    modified = sentence.replace(token.text, f"not {token.text}")
                    break
            question = f"True or False: {modified}"
            answer = "False"
        
        return QAPair(question, answer, f"Page {page_num}", difficulty, QuestionType.TRUE_FALSE)

    def _generate_multiple_choice(self, sentence: str, sentences: List[str], 
                                page_num: int, difficulty: DifficultyLevel) -> QAPair:
        """Generate a multiple choice question from a sentence."""
        doc = self.nlp(sentence)
        
        # Find a named entity or important noun to ask about
        target_word = None
        for ent in doc.ents:
            target_word = ent.text
            break
        
        if not target_word:
            for token in doc:
                if token.pos_ == "NOUN":
                    target_word = token.text
                    break
        
        if not target_word:
            return None
            
        # Create question
        question = sentence.replace(target_word, "___")
        question = f"Which of the following correctly fills in the blank? {question}"
        
        # Generate options
        options = [target_word]  # Correct answer
        other_sentences = [s for s in sentences if s != sentence]
        for _ in range(3):  # Generate 3 wrong options
            if other_sentences:
                other_sent = random.choice(other_sentences)
                other_doc = self.nlp(other_sent)
                for token in other_doc:
                    if token.pos_ == "NOUN" and token.text not in options:
                        options.append(token.text)
                        break
        
        # Shuffle options
        random.shuffle(options)
        
        # Format question and answer
        question += f"\nOptions: {', '.join(options)}"
        answer = f"The correct answer is: {target_word}"
        
        return QAPair(question, answer, f"Page {page_num}", difficulty, QuestionType.MULTIPLE_CHOICE)

    def _generate_open_ended(self, sentence: str, page_num: int, difficulty: DifficultyLevel) -> QAPair:
        """Generate an open-ended question from a sentence."""
        doc = self.nlp(sentence)
        
        # Create a question based on the sentence structure
        question_words = ["What", "How", "Why", "Explain"]
        question = f"{random.choice(question_words)} {sentence.lower()}?"
        answer = f"Based on the text: {sentence}"
        
        return QAPair(question, answer, f"Page {page_num}", difficulty, QuestionType.OPEN_ENDED)

def main(pdf_path: str, questions_per_page: int = 3):
    generator = PDFQAGenerator()
    text_by_page = generator.extract_text_from_pdf(pdf_path)
    
    if not text_by_page:
        print("No text could be extracted from the PDF.")
        return
    
    qa_pairs = generator.generate_questions(text_by_page, questions_per_page)
    
    # Print all generated Q&A pairs
    for qa_pair in qa_pairs:
        print(qa_pair)
        print("-" * 50)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python pdf_qa_generator.py <pdf_path> [questions_per_page]")
    else:
        pdf_path = sys.argv[1]
        questions_per_page = int(sys.argv[2]) if len(sys.argv) > 2 else 3
        main(pdf_path, questions_per_page)
