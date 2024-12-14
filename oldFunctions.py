def CND(x):
  if (x < 0):
    return 1 - CND(-x);
  else:
    k = 1 / (1 + .2316419 * x);
    return 1 - math.exp(-x * x / 2) / math.sqrt(2 * math.pi) * k * (.31938153 + k * (-.356563782 + k * (1.781477937 + k * (-1.821255978 + k * 1.330274429))));

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

