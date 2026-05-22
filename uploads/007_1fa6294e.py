import numpy as np

class BanditAgent:
    def __init__(self, n_arms):
        self.n_arms  = n_arms
        self.counts  = np.zeros(n_arms)
        self.values  = np.zeros(n_arms)
        self.epsilon = 0.1

    def select_arm(self):
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_arms)
        return int(np.argmax(self.values))

    def update(self, arm, reward):
        self.counts[arm] += 1
        n = self.counts[arm]
        self.values[arm] += (reward - self.values[arm]) / n