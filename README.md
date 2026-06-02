# MAB Pirates — Tournament Platform

A pirate-themed Multi-Armed Bandit tournament platform designed for Reinforcement Learning mentorship programs.

## Features

- **8 Treasure Chests** — Each with a distinct reward distribution (Gaussian, uniform, bimodal).
- **1000-Pull Horizon** — Fixed random seed for fair comparison across submissions.
- **Leaderboard** — Ranked by best total gold per student.
- **Run Analytics** — Cumulative reward charts, per-chest pull distributions, regret tracking.
- **Mentor Dashboard** — Password-protected view of all submissions and code.
- **Auto-Evaluation** — Code runs in a subprocess with a 60-second timeout.

---

## Setup

### 1. Install Dependencies

```bash
cd mab-pirates
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)

You can set the mentor password via environment variable:

```bash
export MENTOR_PASSWORD="your_secret_password"
```
*(Default: `pirates2025`)*

### 3. Start the Server

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Access the platform:**
- Student site: [http://localhost:8000](http://localhost:8000)
- Mentor dashboard: [http://localhost:8000/mentor](http://localhost:8000/mentor)

---

## Student Interface

The agent file must define a class `BanditAgent` with the following structure:

```python
class BanditAgent:
    def __init__(self, n_arms: int): ...
    
    def select_arm(self) -> int: ...      # returns arm in [0, n_arms-1]
    
    def update(self, arm: int, reward: float): ...
```

See `example_agent.py` (ε-greedy) and `example_ucb_agent.py` (UCB1) for reference.

---

## The 8 Chests

| # | Name | Distribution | True Mean |
|---|------|-------------|-----------|
| 0 | Davy Jones' Chest | Gaussian(35, 25) | 35 |
| 1 | Barnacle Bill's Hoard | Gaussian(42, 8) | 42 |
| 2 | Siren's Cache | Bimodal (75% low, 25% high) | ~26 |
| 3 | The Kraken's Keep | Gaussian(55, 30) | 55 |
| 4 | Polly's Piggybank | Gaussian(38, 6) | 38 |
| 5 | The Golden Galleon | Gaussian(70, 12) | 70 ← optimal |
| 6 | Rum Runner's Reserve | Uniform(10, 80) | 45 |
| 7 | Buried Bones | Gaussian(20, 5) | 20 |

Regret is computed as `T × μ* − Σ rewards` where `μ* = 70`.

---

## Deployment

For a real deployment, consider:

- Running behind **nginx** as a reverse proxy.
- Using **systemd** or **Docker** to manage the process.
- Setting a strong `MENTOR_PASSWORD` environment variable.
- Backing up `pirates.db` regularly.

### Docker (Optional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Scoring

- Only **successful** runs appear on the leaderboard.
- Each student's **best run** (highest total gold) is shown.
- Regret is displayed alongside gold — a good algorithm maximizes gold and minimizes regret.
- Students may submit as many times as they like.
