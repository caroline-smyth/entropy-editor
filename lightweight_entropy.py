import sys
import re

def simple_analysis(text):
    """Simple text analysis without heavy ML models"""
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Simple entropy approximation based on word frequency
    word_freq = {}
    for word in words:
        word_lower = word.lower().strip('.,!?;:"')
        word_freq[word_lower] = word_freq.get(word_lower, 0) + 1
    
    # Calculate simple entropy score
    total_words = len(words)
    if total_words == 0:
        return 0, 0, 0, 0
    
    entropy_score = 0
    for freq in word_freq.values():
        prob = freq / total_words
        if prob > 0:
            entropy_score -= prob * (prob ** 0.5)  # Simplified entropy calc
    
    return len(words), len(sentences), len(set(words)), entropy_score

if __name__ == "__main__":
    # Read from stdin if available, otherwise use sample
    if not sys.stdin.isatty():
        text = sys.stdin.read().strip()
    else:
        text = "This is a sample sentence for testing our entropy analysis system."
    
    if not text:
        print("Error: No input text provided")
        sys.exit(1)
    
    try:
        word_count, sentence_count, unique_words, entropy_score = simple_analysis(text)
        
        print(f"Text: {text}")
        print(f"Word count: {word_count}")
        print(f"Sentence count: {sentence_count}")
        print(f"Unique words: {unique_words}")
        print(f"Entropy score: {entropy_score:.2f}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)