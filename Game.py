from random import *
import math
import numpy as np
from scipy.stats import norm
# Black-Scholes:



class Game():
    def __init__(self, numKs = 5, width = [50, 100], moveType = "uniform"):
        # self.startS = (randint(width[0], width[1])+random())//.01/100
        self.startS = 75
        self.centerK = 5*round(self.startS/5)
        self.Ks = [self.centerK + 5*i for i in range(-numKs//2+1, numKs//2+1)]
        if moveType == "uniform":
            self.moves =  [0.01*x if x <6 else -0.01*(x-5) for x in range(1, 11)]
        else:
            self.moves = [0.01, -0.01]
        self.vol = .40
        self.dte = 28/365
        self.intRate = 0.05
        self.calls = [blackScholes("c", self.startS, strike, self.intRate, self.dte, self.vol) for strike in self.Ks]
        self.puts = [blackScholes("p", self.startS, strike, self.intRate, self.dte, self.vol) for strike in self.Ks]

            
            


    def __repr__(self):
        return str(self.startS)+", "+str(self.Ks)+"\n"+str(self.calls)+"\n"+str(self.puts)

    def movement(self):
        return choice(self.moves)


def blackScholes(optType, s, k, r, t, v):
    d1 = (math.log(s/k) + (r+(v**2)/2)*t)/(v*(t**0.5))
    d2 = d1 - v*(t**0.5)
    if optType == "c":
        return s*norm.cdf(d1)-k*math.exp(-r*t)*norm.cdf(d2)
    else:
        return -s*norm.cdf(-d1)+k*math.exp(-r*t)*norm.cdf(-d2)


# def CND(x):
#   if (x < 0):
#     return 1 - CND(-x);
#   else:
#     k = 1 / (1 + .2316419 * x);
#     return 1 - math.exp(-x * x / 2) / math.sqrt(2 * math.pi) * k * (.31938153 + k * (-.356563782 + k * (1.781477937 + k * (-1.821255978 + k * 1.330274429))));

def play(numKs, width):
    pass



g1 = Game()
# print(g1.moves)
print(blackScholes("c", g1.startS, g1.centerK, g1.intRate, g1.dte, g1.vol))
