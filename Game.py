from random import *
import math
import numpy as np
from scipy.stats import norm
import tkinter as tk
from colored import Style
# Black-Scholes:

#TODO: implement queue to delete orders after time
#TODO: make orders only show for empty spaces
#TODO: make clicking orders do something


class Game():
    def __init__(self, numKs = 5, width = [50, 100], moveType = "uniform"):
        # self.startS = (randint(width[0], width[1])+random())//.01/100
        # self.vol = .40
        # self.dte = 28/365
        # self.intRate = 0.05
                
        #params
        self.orderTime = 5
        self.orderChance = 0.8
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

        #helperVariables
        self.calls = [blackScholes("c", self.startS, strike, self.intRate, self.dte, self.vol) for strike in self.Ks]
        self.puts = [blackScholes("p", self.startS, strike, self.intRate, self.dte, self.vol) for strike in self.Ks]
        self.callDelts = [round(100*blackScholes("d", self.startS, strike, self.intRate, self.dte, self.vol)) for strike in self.Ks]
        self.curS = self.startS
        self.PNL = 0
        self.delta = 0
        self.optionTypes = {"c":"call", "p":"put"}
        self.underline = Style.underline_color('Black')
        self.orderColumns = {"cb":2, "co":4, "pb":6, 'po':8}
        self.openOrders = [False]*20
        self.tick = 0

        #gameWindow
        self.wind = tk.Tk()
        self.frame = tk.Frame(master=self.wind, relief=tk.SUNKEN, borderwidth=1)
        self.frame.grid(row = 2, column = 0)
        self.startTicker = tk.Button(master=self.frame, text="start", command=self.startTick)
        self.startTicker.pack()
        self.wind.rowconfigure([0, 1, 2, 3, 4, 5, 6, 7, 8], minsize = 50, weight=1)
        self.wind.columnconfigure([0,1,2,3,4,5,6,7,8], minsize = 50, weight=1)
        self.lbl_value = tk.Label(master=self.wind, text=f"""Starting Price: {self.startS}     Vol: {self.vol*100}
        Current Price: {self.curS}     PNL: {self.PNL}
        Delta: {self.delta}""")
        self.lbl_value.grid(row=0, column = 0)
        self.cols = ["Delta", 'Bid', 'Call', 'Offer', 'Strike', 'Bid', 'Put', 'Offer']
        for i in range(8):
            frame = tk.Frame(master=self.wind, relief=tk.SUNKEN, borderwidth=1)
            frame.grid(row=0, column=i+1, padx=5, pady=5)
            label = tk.Label(master=frame, text=self.cols[i])
            label.pack(padx=5, pady=5)
        opts = []
        r = 0
        for strike in self.Ks:
            r += 1
            opts = [round(blackScholes("d", self.startS, strike, self.intRate, self.dte, self.vol),2), 0, round(blackScholes("c", self.startS, strike, self.intRate, self.dte, self.vol), 2),0, strike, 0, round(blackScholes("p", self.startS, strike, self.intRate, self.dte, self.vol),2), 0]
            rowVals = [str(x)+"0" if (x == round(x,1) and x != round(x, 0)) else str(x) for x in opts]
            for i in range(8):
                frame = tk.Frame(master=self.wind, borderwidth=1)
                frame.grid(row=r, column=i+1, padx=5, pady=5)
                label = tk.Label(master=frame, text=rowVals[i])
                label.pack(padx=5, pady=5)
        self.wind.mainloop()


    def __repr__(self):
        return str(self.startS)+", "+str(self.Ks)+"\n"+str(self.calls)+"\n"+str(self.puts)+"\n"+str(self.callDelts)

    def movement(self):
        return choice(self.moves)

    def randomMove(self):
        self.curS*=(1+gauss(0, 1)*self.vol*(1 / (253 * 6.5 * 60 * 60))**0.5+self.intRate*(1 / (253 * 6.5 * 60 * 60)))
        self.curS = round(self.curS, 2)
        return self.curS
        
    def startTick(self):
        frame = tk.Frame(master=self.wind, relief=tk.SUNKEN, borderwidth=1)
        frame.grid(row = 3, column = 0)
        self.ticker = tk.Label(master=frame, text = "0")
        self.ticker.pack()
        self.updateTick()

    def updateTick(self):
        self.ticker.config(text=f"{self.randomMove()}")
        self.tick = (self.tick + 1) % self.orderTime
        if self.tick == 0:
            self.dequeueOrder()
        if random() < 0.8:
            opTp = "c"
            orTp = "b"
            orderIndex = 0
            if random()<0.5:
                opTp = "p"
                orderIndex += 10
            if random()<0.5:
                orTp = "o"
                orderIndex += 5
            strike = choice(self.Ks)
            orderIndex += self.Ks.index(strike)
            if not self.openOrders[orderIndex]:
                self.generateOrderButton(opTp, orTp, strike)
                self.openOrders[orderIndex] = True
        self.ticker.after(1000, self.updateTick)
        
    def generateOrderButton(self, optType, orderType, strike):
        theo = round(blackScholes(optType, self.curS, strike, self.intRate, self.dte, self.vol),2)
        alpha = gauss(0,0.1)
        price = round(theo + alpha, 2)
        orderRow = self.Ks.index(strike) + 1
        frame = tk.Frame(master=self.wind, borderwidth=1)
        frame.grid(row = orderRow, column = self.orderColumns[optType+orderType])
        q = int(round(random(), 2)*1000)
        orderButton = tk.Button(master=frame, text=f"{price} / {q}x", command=lambda: self.placeOrder(optType, orderType, strike, price, q, theo))
        orderButton.pack()
        self.wind.update()

    def placeOrder(self, optType, orderType, strike, price, quantity, theo):
        pass
        #TODO
            #delta
            #position
            #PnL
            #order log
        strikeInd = self.Ks.index(strike)
        sDelt = self.callDelts[strikeInd]
        if optType == "p":
            sDelt = 1-sDelt
            if orderType == "o":
                sDelt *= -1
        elif orderType == "b":
            sDelt *= -1
        self.delta += sDelt*quantity
        alpha = price - theo
        if orderType == "o":
            alpha *= -1
        self.PNL = round(self.PNL + alpha * quantity, 0)


        self.lbl_value = tk.Label(master=self.wind, text=f"""Starting Price: {self.startS}     Vol: {self.vol*100}
        Current Price: {self.curS}     PNL: {self.PNL}
        Delta: {self.delta}""")
        self.lbl_value.grid(row=0, column = 0)
        self.wind.update()


    def dequeueOrder(self):
        pass
        #TODO   






def blackScholes(optType, s, k, r, t, v):
    d1 = (math.log(s/k) + (r+(v**2)/2)*t)/(v*(t**0.5))
    d2 = d1 - v*(t**0.5)
    if optType == "c":
        return s*norm.cdf(d1)-k*math.exp(-r*t)*norm.cdf(d2)
    elif optType == "d":
        return norm.cdf(d1)
    else:
        return -s*norm.cdf(-d1)+k*math.exp(-r*t)*norm.cdf(-d2)




def play(numKs, width):
    pass



g1 = Game()
# for i in range(10):
#     g1.tick()
# window = tk.Tk()
# g1.tkBoard(window)



# window.mainloop()
