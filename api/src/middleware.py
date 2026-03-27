from slowapi import Limiter
from slowapi.util import get_remote_address

# In-memory rate limiter — sufficient for single-instance Railway deployment.
# Key function uses remote IP address for per-client limiting.
# Applied as decorator on individual routes (e.g., @limiter.limit("5/minute")).
limiter = Limiter(key_func=get_remote_address)
