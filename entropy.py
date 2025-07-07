import math
import torch
import sys
import os
from transformers import GPT2LMHeadModel, GPT2TokenizerFast

# Disable tokenizer warnings
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Initialize only GPT-2 (lightest model)
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

if __name__ == "__main__":
    import sys
    
    # Read from stdin if available, otherwise use sample
    if not sys.stdin.isatty():
        sample = sys.stdin.read().strip()
    # this actually never runs bc doesn't accept empty input
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
        print(f"Total tokens: {total_bits / per_token_bits:.0f}")
        print(f"Total bits: {total_bits:.2f}")
        print(f"Bits per token: {per_token_bits:.2f}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)