"""
runner.py — executed as a subprocess to isolate student code.

Usage: python runner.py <filepath> <horizon>

Prints a JSON result to stdout.
The student's file must define a class called BanditAgent with:
    def __init__(self, n_arms): ...
    def select_arm(self) -> int: ...
    def update(self, arm: int, reward: float): ...
"""

import importlib.util
import json
import os
import sys
import uuid
from pathlib import Path

# Add backend dir to path so we can import environment
sys.path.insert(0, str(Path(__file__).parent))

from environment import TreasureIslandEnv


def load_agent_class(filepath: str):
    spec = importlib.util.spec_from_file_location("student_module", filepath)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    if not hasattr(module, "BanditAgent"):
        raise AttributeError("Your file must define a class named 'BanditAgent'")
    return module.BanditAgent


def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: runner.py <filepath> <horizon>"}))
        sys.exit(1)

    filepath = sys.argv[1]
    horizon = int(sys.argv[2])

    env = TreasureIslandEnv(seed=42)  # fixed seed for fairness

    try:
        AgentClass = load_agent_class(filepath)
        agent = AgentClass(n_arms=env.n_chests)
    except Exception as e:
        print(json.dumps({"error": f"Failed to load agent: {e}"}), file=sys.stderr)
        sys.exit(1)

    choices = []
    rewards = []

    try:
        for t in range(horizon):
            arm = agent.select_arm()
            if not isinstance(arm, int) or not (0 <= arm < env.n_chests):
                raise ValueError(f"select_arm() returned invalid arm: {arm!r}")
            reward = env.pull(arm)
            agent.update(arm, reward)
            choices.append(arm)
            rewards.append(reward)
    except Exception as e:
        print(json.dumps({"error": f"Runtime error at step {len(choices)}: {e}"}), file=sys.stderr)
        sys.exit(1)

    total_gold = round(sum(rewards), 2)
    regret = env.compute_regret(choices, rewards)

    result = {
        "run_id": str(uuid.uuid4()),
        "total_gold": total_gold,
        "regret": regret,
        "choices": choices,
        "rewards": [round(r, 2) for r in rewards],
        "horizon": horizon,
    }

    print(json.dumps(result))


if __name__ == "__main__":
    main()
