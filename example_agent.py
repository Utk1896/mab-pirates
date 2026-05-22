"""
Example submission for MAB Pirates Tournament.
Strategy: Epsilon-Greedy with decaying epsilon.

Your file MUST define a class called BanditAgent with:
  - __init__(self, n_arms: int)
  - select_arm(self) -> int
  - update(self, arm: int, reward: float)
"""

import numpy as np


class BanditAgent:
    """
    Epsilon-Greedy agent with linearly decaying exploration rate.
    Starts with epsilon=0.3, decays to 0.01 over the horizon.
    """

    def __init__(self, n_arms: int):
        self.n_arms = n_arms
        self.counts = np.zeros(n_arms)     # pulls per arm
        self.values = np.zeros(n_arms)     # running average reward per arm
        self.t = 0                          # total steps so far
        self.epsilon_start = 0.3
        self.epsilon_end = 0.01
        self.decay_steps = 800              # reach min epsilon by step 800

    @property
    def epsilon(self):
        """Linearly decay epsilon from start to end."""
        frac = min(self.t / self.decay_steps, 1.0)
        return self.epsilon_start + frac * (self.epsilon_end - self.epsilon_start)

    def select_arm(self) -> int:
        """Choose an arm — explore with probability epsilon, exploit otherwise."""
        if np.random.random() < self.epsilon:
            # Explore: pick a random arm
            return int(np.random.randint(self.n_arms))
        else:
            # Exploit: pick the arm with highest estimated value
            return int(np.argmax(self.values))

    def update(self, arm: int, reward: float):
        """Incremental mean update after observing reward from arm."""
        self.t += 1
        self.counts[arm] += 1
        n = self.counts[arm]
        # Running average: Q(a) <- Q(a) + (r - Q(a)) / n
        self.values[arm] += (reward - self.values[arm]) / n
