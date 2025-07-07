import sys
import re
import math
from collections import Counter

def simple_entropy_analysis(text):
    """
    Calculate text entropy using character and word frequency distributions
    This is a simplified version that doesn't require ML models
    """
    # Character-level entropy
    char_counts = Counter(text.lower())
    total_chars = len(text)
    char_entropy = 0
    for count in char_counts.values():
        prob = count / total_chars
        if prob > 0:
            char_entropy -= prob * math.log2(prob)
    
    # Word-level analysis
    words = re.findall(r'\b\w+\b', text.lower())
    word_counts = Counter(words)
    total_words = len(words)
    
    word_entropy = 0
    if total_words > 0:
        for count in word_counts.values():
            prob = count / total_words
            if prob > 0:
                word_entropy -= prob * math.log2(prob)
    
    # Estimate "bits per token" based on word complexity
    avg_word_length = sum(len(word) for word in words) / max(total_words, 1)
    estimated_bits_per_token = char_entropy * avg_word_length / max(total_words, 1)
    
    return {
        'char_entropy': char_entropy,
        'word_entropy': word_entropy,
        'total_words': total_words,
        'unique_words': len(word_counts),
        'estimated_bits_per_token': estimated_bits_per_token,
        'total_estimated_bits': estimated_bits_per_token * total_words
    }

if __name__ == "__main__":
    # Read from stdin if available, otherwise use sample
    if not sys.stdin.isatty():
        text = sys.stdin.read().strip()
    else:
        text = "There is currently a lively, ongoing controversy among many sociologists and other professionals who study human nature."
    
    if not text:
        print("Error: No input text provided")
        sys.exit(1)
    
    try:
        analysis = simple_entropy_analysis(text)
        
        print(text)
        print(f"Character count: {len(text)}")
        print(f"Total tokens: {analysis['total_words']}")
        print(f"Total bits: {analysis['total_estimated_bits']:.2f}")
        print(f"Bits per token: {analysis['estimated_bits_per_token']:.2f}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)