from random import *
import math

# Black-Scholes:



class Game():
    def __init__(self, numKs = 5, width = [50, 100], moveType = "uniform"):
        self.startS = (randint(width[0], width[1])+random())//.01/100
        self.centerK = 5*round(self.startS/5)
        self.Ks = [self.centerK + 5*i for i in range(-numKs//2+1, numKs//2+1)]
        if moveType == "uniform":
            self.moves =  [0.01*x if x <6 else -0.01*(x-5) for x in range(1, 11)]
        else:
            self.moves = [0.01, -0.01]
        self.vol = 40
        self.dte = 28/365
        self.intRate = 0.05
        for k in self.Ks:           #calls
            intrin = self.startS - k
            


    def __repr__(self):
        return str(self.startS)+", "+str(self.Ks)

    def movement(self):
        return choice(self.moves)


def blackScholes(s, k, r, t, v):
    d1 = (math.log(s/k) + (r+(v**2)/2)*t)/(v*(t**0.5))
    d2 = d1 - v*(t**0.5)
    

def play(numKs, width):
    pass







g1 = Game()
# print(g1.moves)
print(blackScholes(g1.startS, g1.centerK, g1.intRate, g1.dte, g1.vol))