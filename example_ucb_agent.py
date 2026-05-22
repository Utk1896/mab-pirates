"""
Example submission — UCB1 (Upper Confidence Bound) Agent.
Generally stronger than epsilon-greedy on stationary bandits.
"""

import numpy as np
import math


class BanditAgent:
    """
    UCB1: balance exploration and exploitation using confidence bounds.
    
    Formula: Q(a) + sqrt(2 * ln(t) / N(a))
    Pulls each arm once first (initialization phase).
    """

    def __init__(self, n_arms: int):
        self.n_arms = n_arms
        self.counts = np.zeros(n_arms)      # N(a)
        self.values = np.zeros(n_arms)      # Q(a): sample mean reward
        self.t = 0                           # total steps

    def select_arm(self) -> int:
        # Initialization: pull each arm once
        for a in range(self.n_arms):
            if self.counts[a] == 0:
                return a

        # UCB1 selection
        ucb_values = np.zeros(self.n_arms)
        for a in range(self.n_arms):
            bonus = math.sqrt(2 * math.log(self.t) / self.counts[a])
            ucb_values[a] = self.values[a] + bonus

        return int(np.argmax(ucb_values))

    def update(self, arm: int, reward: float):
        self.t += 1
        self.counts[arm] += 1
        n = self.counts[arm]
        self.values[arm] += (reward - self.values[arm]) / n
