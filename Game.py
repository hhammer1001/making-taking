from random import *
import math
import numpy as np
from scipy.stats import norm
import tkinter as tk
from colored import Style
# Black-Scholes:



class Game():
    def __init__(self, numKs = 5, width = [50, 100], moveType = "uniform"):
        # self.startS = (randint(width[0], width[1])+random())//.01/100
        # self.vol = .40
        # self.dte = 28/365
        # self.intRate = 0.05
        self.startS = 52
        self.vol = .6
        self.dte = round(1/12, 2)
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
        self.PNL = 0
        self.delta = 0
        self.optionTypes = {"c":"call", "p":"put"}
        self.underline = Style.underline_color('Black')



    def __repr__(self):
        return str(self.startS)+", "+str(self.Ks)+"\n"+str(self.calls)+"\n"+str(self.puts)+"\n"+str(self.callDelts)

    def movement(self):
        return choice(self.moves)

    def randomMove(self):
        self.curS*=(1+gauss(0, 1)*self.vol*(1 / (253 * 6.5 * 60 * 60))**0.5+self.intRate*(1 / (253 * 6.5 * 60 * 60)))
        self.curS = round(self.curS, 2)
        return self.curS

    def printBoard(self):
        board = f"Starting Price: {self.startS} Vol: {self.vol}\n"
        board += f"Current Price: {self.curS} PNL: {self.PNL} Delta: {self.delta}\n\n"
        board += "_________________________________________________________________________\n"
        board += "|  Delta |   Bid  |  Call  |  Offer | Strike |   Bid  |   Put |   Offer |\n"
        board += "―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――\n"
        opts = []
        for strike in self.Ks:
            opts = [round(blackScholes("d", self.startS, strike, self.intRate, self.dte, self.vol),2), 0, round(blackScholes("c", self.startS, strike, self.intRate, self.dte, self.vol), 2),0, strike, 0, round(blackScholes("p", self.startS, strike, self.intRate, self.dte, self.vol),2), 0]
            rowVals = [str(x)+"0" if (x == round(x,1) and x != round(x, 0)) else str(x) for x in opts]
            boxes = ("|" + ("{: ^8}|")*len(rowVals)).format(*rowVals)
            board += boxes+"\n"
        board += "―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――\n"
        print(board)
        return
    
    def tkBoard(self, wind):
        wind.rowconfigure([0, 1, 2, 3, 4, 5, 6, 7, 8], minsize = 50, weight=1)
        wind.columnconfigure([0,1,2,3,4,5,6,7,8], minsize = 50, weight=1)
        lbl_value = tk.Label(master=wind, text=f"""Starting Price: {self.startS}     Vol: {self.vol*100}
        Current Price: {self.curS}     PNL: {self.PNL}     Delta: {self.delta}""")
        lbl_value.grid(row=0, column = 0)
        cols = ["Delta", 'Bid', 'Call', 'Offer', 'Strike', 'Bid', 'Put', 'Offer']
        for i in range(8):
            frame = tk.Frame(master=wind, relief=tk.SUNKEN, borderwidth=1)
            frame.grid(row=0, column=i+1, padx=5, pady=5)
            label = tk.Label(master=frame, text=cols[i])
            label.pack(padx=5, pady=5)
        opts = []
        r = 0
        for strike in self.Ks:
            r += 1
            opts = [round(blackScholes("d", self.startS, strike, self.intRate, self.dte, self.vol),2), 0, round(blackScholes("c", self.startS, strike, self.intRate, self.dte, self.vol), 2),0, strike, 0, round(blackScholes("p", self.startS, strike, self.intRate, self.dte, self.vol),2), 0]
            rowVals = [str(x)+"0" if (x == round(x,1) and x != round(x, 0)) else str(x) for x in opts]
            for i in range(8):
                frame = tk.Frame(master=wind, borderwidth=1)
                frame.grid(row=r, column=i+1, padx=5, pady=5)
                label = tk.Label(master=frame, text=rowVals[i])
                label.pack(padx=5, pady=5)


    def generateOrder(self, optType, orderType, strike):
        theo = round(blackScholes(optType, self.curS, strike, self.intRate, self.dte, self.vol),2)
        alpha = gauss(0,0.1)
        price = round(theo + alpha, 2)
        q = round(random(), 2)*1000
        if orderType == "b":
            return f"{price} bid for {q} {strike} {self.optionTypes[optType]}s"
        if orderType == "o":
            return f"offer {q} {strike} {self.optionTypes[optType]}s for {price}"
        

    def tick(self):
        temp = self.randomMove()
        self.printBoard()
        if random() < 0.25:
            opTp = "c"
            orTp = "b"
            if random()<0.5:
                opTp = "p"
            if random()<0.5:
                orTp = "o"
            print(self.generateOrder(opTp, orTp, choice(self.Ks)))



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
# for i in range(10):
#     g1.tick()
window = tk.Tk()
g1.tkBoard(window)
window.mainloop()
