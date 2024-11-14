from random import *
import math
import numpy as np
from scipy.stats import norm
# Black-Scholes:



class Game():
    def __init__(self, numKs = 5, width = [50, 100], moveType = "uniform"):
        # self.startS = (randint(width[0], width[1])+random())//.01/100
        # self.vol = .40
        # self.dte = 28/365
        # self.intRate = 0.05
        self.startS = 52
        self.vol = .6
        self.dte = 1/12
        self.intRate = .005
        self.centerK = 5*round(self.startS/5)
        self.Ks = [self.centerK + 5*i for i in range(-numKs//2+1, numKs//2+1)]
        if moveType == "uniform":
            self.moves =  [0.01*x if x <6 else -0.01*(x-5) for x in range(1, 11)]
        else:
            self.moves = [0.01, -0.01]
        self.calls = [blackScholes("c", self.startS, strike, self.intRate, self.dte, self.vol) for strike in self.Ks]
        self.puts = [blackScholes("p", self.startS, strike, self.intRate, self.dte, self.vol) for strike in self.Ks]
        self.callDelts = [round(100*blackScholes("d", self.startS, strike, self.intRate, self.dte, self.vol)) for strike in self.Ks]
        self.curS = self.startS

    def __repr__(self):
        return str(self.startS)+", "+str(self.Ks)+"\n"+str(self.calls)+"\n"+str(self.puts)+"\n"+str(self.callDelts)

    def movement(self):
        return choice(self.moves)

    def randomMove(self):
        self.curS*=(1+gauss(0, 1)*self.vol*(1 / (253 * 6.5 * 60 * 60))**0.5+self.intRate*(1 / (253 * 6.5 * 60 * 60)))
        return round(self.curS, 2)



def blackScholes(optType, s, k, r, t, v):
    d1 = (math.log(s/k) + (r+(v**2)/2)*t)/(v*(t**0.5))
    d2 = d1 - v*(t**0.5)
    if optType == "c":
        return s*norm.cdf(d1)-k*math.exp(-r*t)*norm.cdf(d2)
    elif optType == "d":
        return norm.cdf(d1)
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
for i in range(100):
    print(g1.randomMove())
