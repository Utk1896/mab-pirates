"""
Treasure Island Environment — the multi-armed bandit.

8 treasure chests, each with a distinct reward distribution.
Rewards are integers (gold coins), sampled per pull.
"""

import numpy as np
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class Chest:
    name: str
    description: str
    dist: str          # "gaussian" | "bernoulli_scaled" | "uniform" | "bimodal"
    params: dict       # distribution-specific params
    true_mean: float   # for regret calculation


CHESTS = [
    Chest(
        name="Davy Jones' Chest",
        description="Cursed gold — high variance, mediocre return",
        dist="gaussian",
        params={"mu": 35, "sigma": 25},
        true_mean=35,
    ),
    Chest(
        name="Barnacle Bill's Hoard",
        description="Modest but reliable",
        dist="gaussian",
        params={"mu": 42, "sigma": 8},
        true_mean=42,
    ),
    Chest(
        name="Siren's Cache",
        description="Tempting but deceptive — mostly empty, occasionally glorious",
        dist="bimodal",
        params={"mu1": 5, "sigma1": 3, "mu2": 90, "sigma2": 10, "p1": 0.75},
        true_mean=0.75 * 5 + 0.25 * 90,  # ≈ 26.25
    ),
    Chest(
        name="The Kraken's Keep",
        description="Dangerous waters — high risk, high reward",
        dist="gaussian",
        params={"mu": 55, "sigma": 30},
        true_mean=55,
    ),
    Chest(
        name="Polly's Piggybank",
        description="Parrot approved — steady modest income",
        dist="gaussian",
        params={"mu": 38, "sigma": 6},
        true_mean=38,
    ),
    Chest(
        name="The Golden Galleon",
        description="The legendary chest — best expected return",
        dist="gaussian",
        params={"mu": 70, "sigma": 12},
        true_mean=70,
    ),
    Chest(
        name="Rum Runner's Reserve",
        description="Random like a drunken sailor",
        dist="uniform",
        params={"low": 10, "high": 80},
        true_mean=45,
    ),
    Chest(
        name="Buried Bones",
        description="Someone buried this for a reason — mostly rocks",
        dist="gaussian",
        params={"mu": 20, "sigma": 5},
        true_mean=20,
    ),
]


class TreasureIslandEnv:
    """
    Multi-armed bandit environment.

    Interface for student bots:
        env.n_chests  → int
        env.pull(arm) → float  (gold collected)
        env.reset()   → None
    """

    def __init__(self, seed: int = None):
        self.n_chests = len(CHESTS)
        self.chests = CHESTS
        self.chest_names = [c.name for c in CHESTS]
        self.chest_descriptions = [c.description for c in CHESTS]
        self._rng = np.random.default_rng(seed)
        self._step = 0

    def reset(self):
        self._step = 0
        self._rng = np.random.default_rng(None)

    def pull(self, arm: int) -> float:
        if not (0 <= arm < self.n_chests):
            raise ValueError(f"arm must be in [0, {self.n_chests - 1}]")
        chest = self.chests[arm]
        reward = self._sample(chest)
        reward = max(0.0, reward)  # no negative gold
        self._step += 1
        return round(reward, 2)

    def _sample(self, chest: Chest) -> float:
        p = chest.params
        if chest.dist == "gaussian":
            return self._rng.normal(p["mu"], p["sigma"])
        elif chest.dist == "uniform":
            return self._rng.uniform(p["low"], p["high"])
        elif chest.dist == "bimodal":
            if self._rng.random() < p["p1"]:
                return self._rng.normal(p["mu1"], p["sigma1"])
            else:
                return self._rng.normal(p["mu2"], p["sigma2"])
        else:
            raise ValueError(f"Unknown dist: {chest.dist}")

    @property
    def optimal_mean(self) -> float:
        return max(c.true_mean for c in self.chests)

    def compute_regret(self, choices: list, rewards: list) -> float:
        """Expected regret = T * mu* - sum(rewards)"""
        T = len(rewards)
        return round(self.optimal_mean * T - sum(rewards), 2)
