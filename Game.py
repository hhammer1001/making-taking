from random import *

class Game():
    def __init__(self, numKs = 5, width = [50, 100]):
        self.startS = (randint(width[0], width[1])+random())//.01/100
        self.centerK = 5*round(self.startS/5)
        self.Ks = [self.centerK + 5*i for i in range(-numKs//2+1, numKs//2+1)]
        self.moves =  [0.01*x if x <6 else -0.01*(x-5) for x in range(1, 11)]
        for k in self.Ks:           #calls
            intrin = self.startS - k
            

    def __repr__(self):
        return str(self.startS)+", "+str(self.Ks)

    def movement(self):
        return choice(self.moves)





def play(numKs, width):
    pass







g1 = Game()
print(g1.moves)
