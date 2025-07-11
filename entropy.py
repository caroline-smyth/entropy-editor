import math
import torch
import sys
import os
from transformers import GPT2LMHeadModel, GPT2TokenizerFast
import json

# disable tokenizer warnings
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# initialize only GPT-2 (lightest model)
tokenizer = GPT2TokenizerFast.from_pretrained('gpt2')
model = GPT2LMHeadModel.from_pretrained('gpt2')
model.eval()

@torch.no_grad()
def q_prob(token_id: int, history_ids: torch.Tensor) -> float:
    """Compute the probability of the next token given the history"""
    outputs = model(history_ids)
    logits = outputs.logits
    last_logits = logits[0, -1, :]
    log_probs = torch.log_softmax(last_logits, dim=-1)
    return float(torch.exp(log_probs[token_id]))

def info_content(text: str):
    """Compute the bits of information content using GPT-2"""
    enc = tokenizer(text, return_tensors='pt')
    ids = enc.input_ids[0]
    
    total_bits = 0.0
    for i in range(1, len(ids)):
        history_ids = ids[:i].unsqueeze(0)
        p_next = q_prob(int(ids[i]), history_ids)
        if p_next <= 0:
            raise ValueError(f"Invalid probability: {tokenizer.decode(ids[i])}")
        total_bits += -math.log2(p_next)
    
    avg_bits = total_bits / (len(ids) - 1) if len(ids) > 1 else 0
    return total_bits, avg_bits

def normalize_text(text: str) -> str:
    """Normalize text to match the original hardcoded string exactly"""
    text = text.strip()
    text = text.replace('-', '—')
    text = ' '.join(text.split())
    
    return text

if __name__ == "__main__":
    # Force stdin to be read as UTF-8
    sys.stdin.reconfigure(encoding='utf-8', errors='replace')
    
    # Check if we have stdin input
    if not sys.stdin.isatty():
        # Read all stdin content
        try:
            sample = sys.stdin.read()
            # Debug: print what we received to stderr so it doesn't interfere with output
            print(f"DEBUG: Received {len(sample)} characters from stdin", file=sys.stderr)
            print(f"DEBUG: First 50 chars: {repr(sample[:50])}", file=sys.stderr)
            
            sample = normalize_text(sample)
            print(f"DEBUG: After normalization: {len(sample)} characters", file=sys.stderr)
            print(f"DEBUG: First 50 chars after norm: {repr(sample[:50])}", file=sys.stderr)
            
        except Exception as e:
            print(f"DEBUG: Error reading stdin: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # Default sample text for testing
        sample = ( 
            "There is currently a lively, ongoing controversy among many sociologists and other professionals who study human nature : theories are being spun and arguments are being conducted among them about what it means that so many young people—and older people, for that matter—who live in our society today are so very interested in stories about zombies.?"
        )
    
    if not sample:
        print("Error: No input text provided")
        sys.exit(1)
    
    try:
        total_bits, per_token_bits = info_content(sample)
        
        # Print debug info to stderr
        print(f"DEBUG: Processing text with {len(sample)} characters", file=sys.stderr)
        print(f"DEBUG: Total bits: {total_bits}, Per token bits: {per_token_bits}", file=sys.stderr)
        
        # Print results to stdout (this is what your Node.js will read)
        print(sample)
        print(f"Character count: {len(sample)}")
        print(f"Total tokens: {total_bits / per_token_bits if per_token_bits > 0 else 0}")
        print(f"Total bits: {total_bits:.2f}")
        print(f"Bits per token: {per_token_bits:.2f}")
        
        # Also output JSON for easier parsing
        result = {
            "text": sample,
            "character_count": len(sample),
            "total_tokens": total_bits / per_token_bits if per_token_bits > 0 else 0,
            "total_bits": total_bits,
            "bits_per_token": per_token_bits
        }
        print(f"JSON_RESULT: {json.dumps(result)}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

"""

if __name__ == "__main__":
    import sys
    
    # read from stdin if available, otherwise use sample
    if not sys.stdin.isatty():
        sample = sys.stdin.read()
        sample = normalize_text(sample)
        
    else:
        sample = ( 
            "There is currently a lively, ongoing controversy among many sociologists and other professionals who study human nature : theories are being spun and arguments are being conducted among them about what it means that so many young people—and older people, for that matter—who live in our society today are so very interested in stories about zombies.?"
        )
    
    if not sample:
        print("Error: No input text provided")
        sys.exit(1)
    
    try:
        total_bits, per_token_bits = info_content(sample)
        print(sample)
        print(f"Character count: {len(sample)}")
        print(f"Total tokens: {total_bits / per_token_bits}")
        print(f"Total bits: {total_bits:.2f}")
        print(f"Bits per token: {per_token_bits:.2f}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)"""