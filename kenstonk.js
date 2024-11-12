'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function round(num) {
  return +num.toFixed(2);
}

var price = 75;
var interest = 0.05;
var volatility = 0.40;
var timeStep = 1 / (253 * 6.5 * 60 * 60);
var spread = 0.02;
var timeToExpiry = 28/365;
var rc = 0.02;

var sizes = [25, 50, 100, 150, 200, 250, 300, 400, 500, 750, 1000];

function gaussian() {
  var u = 0,
      v = 0;
  while (u === 0) {
    u = Math.random();
  } //Converting [0,1) to (0,1)
  while (v === 0) {
    v = Math.random();
  }return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function BlackScholes(PutCallFlag, S, X, T, r, v) {
  var d1 = (Math.log(S / X) + (r + v * v / 2) * T) / (v * Math.sqrt(T));
  var d2 = d1 - v * Math.sqrt(T);
  if (PutCallFlag === "call") {
    return S * CND(d1) - X * Math.exp(-r * T) * CND(d2);
  } else {
    return X * Math.exp(-r * T) * CND(-d2) - S * CND(-d1);
  }
}

function delta(S, X, T, r, v) {
  var d1 = (Math.log(S / X) + (r + v * v / 2) * T) / (v * Math.sqrt(T));
  return CND(d1);
}

/* The cummulative Normal distribution function: */
function CND(x) {
  if (x < 0) {
    return 1 - CND(-x);
  } else {
    var k = 1 / (1 + .2316419 * x);
    return 1 - Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI) * k * (.31938153 + k * (-.356563782 + k * (1.781477937 + k * (-1.821255978 + k * 1.330274429))));
  }
}

var Ladder = function (_React$Component) {
  _inherits(Ladder, _React$Component);

  function Ladder(props) {
    _classCallCheck(this, Ladder);

    var _this = _possibleConstructorReturn(this, (Ladder.__proto__ || Object.getPrototypeOf(Ladder)).call(this, props));

    var initialPrice = 51 + Math.random() * 3;
    _this.state = {
      price: initialPrice,
      book: [],
      currentOrders: [],
      filledOrders: {}, // [type, price] : quantity
      marketOrders: [],
      filledMarketOrders: [],
      ref: initialPrice,
      deltaAdjust: false,
      stockSize: 100,
      paused: false
    };

    _this.handleInputChange = _this.handleInputChange.bind(_this);
    _this.onStockSizeChange = _this.onStockSizeChange.bind(_this);
    return _this;
  }

  _createClass(Ladder, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      this.timerInterval = setInterval(function () {
        return _this2.tick();
      }, 1000);
      this.orderInterval = setInterval(function () {
        return _this2.generateOrder();
      }, 100);
      this.generateMarketOrder();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      clearInterval(this.timerInterval);
      clearInterval(this.orderInterval);
    }
  }, {
    key: "tick",
    value: function tick() {

      this.setState(function (state, props) {
        var newPrice = state.price * (1 + (interest * timeStep + gaussian() * volatility * Math.pow(timeStep, 0.5)));
        var book = JSON.parse(JSON.stringify(state.book));
        var currentOrders = JSON.parse(JSON.stringify(state.currentOrders));
        var filledOrders = JSON.parse(JSON.stringify(state.filledOrders));
        var now = Date.now();
        var ref = state.deltaAdjust ? newPrice : state.ref;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = currentOrders[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var order = _step.value;

            if (order.type === "Buy" && order.price > newPrice || order.type === "Sell" && order.price < newPrice) {
              if ([order.type, order.price] in filledOrders) {
                filledOrders[[order.type, order.price]] += order.quantity;
              } else {
                filledOrders[[order.type, order.price]] = order.quantity;
              }
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return {
          price: newPrice,
          book: book.filter(function (x) {
            return !(x.type === "Buy" && x.price > newPrice || x.type === "Sell" && x.price < newPrice);
          }),
          currentOrders: currentOrders.filter(function (x) {
            return !(x.type === "Buy" && x.price > newPrice || x.type === "Sell" && x.price < newPrice);
          }),
          filledOrders: filledOrders,
          marketOrders: state.marketOrders.filter(function (x) {
            return now - x.time < 20000;
          }),
          ref: ref
        };
      });
    }

    //gets the quantity of a user's order at a given price and order type

  }, {
    key: "getQuantity",
    value: function getQuantity(orderType, orderPrice, currentOrders) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = currentOrders[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var order = _step2.value;

          if (order.type === orderType && order.price === orderPrice) {
            return order.quantity;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return 0;
    }
  }, {
    key: "addOrder",
    value: function addOrder(orderType, orderPrice, orderSize) {
      var _this3 = this;

      this.setState(function (state, props) {
        //deep copy book
        var book = JSON.parse(JSON.stringify(state.book));
        var currentOrders = JSON.parse(JSON.stringify(state.currentOrders));
        var filledOrders = JSON.parse(JSON.stringify(state.filledOrders));
        if (orderType === "Buy") {
          //orderPrice -= spread
          for (var i = 0; i < book.length; i++) {
            if (book[i].type === "Sell" && book[i].price <= orderPrice) {
              var amountToTrade = Math.round(orderSize * _this3.getQuantity("Sell", book[i].price, currentOrders) / book[i].quantity);
              console.log(amountToTrade);
              if (amountToTrade > 0) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                  for (var _iterator3 = currentOrders[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var order = _step3.value;

                    if (order.type === "Sell" && order.price === book[i].price) {
                      order.quantity -= amountToTrade;
                      orderSize -= amountToTrade;
                      if ([order.type, order.price] in filledOrders) {
                        filledOrders[[order.type, order.price]] += amountToTrade;
                      } else {
                        filledOrders[[order.type, order.price]] = amountToTrade;
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError3 = true;
                  _iteratorError3 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                      _iterator3.return();
                    }
                  } finally {
                    if (_didIteratorError3) {
                      throw _iteratorError3;
                    }
                  }
                }
              }
              amountToTrade = Math.min(book[i].quantity, orderSize);
              book[i].quantity -= amountToTrade;
              orderSize -= amountToTrade;
            }
          }
        } else {
          //orderPrice += spread
          for (var _i = book.length - 1; _i >= 0; _i--) {
            if (book[_i].type === "Buy" && book[_i].price >= orderPrice) {
              var _amountToTrade = Math.round(orderSize * _this3.getQuantity("Buy", book[_i].price, currentOrders) / book[_i].quantity);
              console.log(_amountToTrade);
              if (_amountToTrade > 0) {
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                  for (var _iterator4 = currentOrders[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _order = _step4.value;

                    if (_order.type === "Buy" && _order.price === book[_i].price) {
                      _order.quantity -= _amountToTrade;
                      orderSize -= _amountToTrade;
                      if ([_order.type, _order.price] in filledOrders) {
                        filledOrders[[_order.type, _order.price]] += _amountToTrade;
                      } else {
                        filledOrders[[_order.type, _order.price]] = _amountToTrade;
                      }
                    }
                  }
                } catch (err) {
                  _didIteratorError4 = true;
                  _iteratorError4 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                      _iterator4.return();
                    }
                  } finally {
                    if (_didIteratorError4) {
                      throw _iteratorError4;
                    }
                  }
                }
              }
              _amountToTrade = Math.min(book[_i].quantity, orderSize);
              book[_i].quantity -= _amountToTrade;
              orderSize -= _amountToTrade;
            }
          }
        }
        if (orderSize > 0) {

          //if no match, add to existing order or create new order
          for (var _i2 = 0; _i2 < book.length; _i2++) {
            if (book[_i2].price === orderPrice) {
              book[_i2].quantity += orderSize;
              return {
                book: book.filter(function (x) {
                  return x.quantity > 0;
                }),
                currentOrders: currentOrders.filter(function (x) {
                  return x.quantity > 0;
                }),
                filledOrders: filledOrders
              };
            }
            if (orderPrice < book[_i2].price) {
              book.splice(_i2, 0, {
                type: orderType,
                price: orderPrice,
                quantity: orderSize
              });
              return {
                book: book.filter(function (x) {
                  return x.quantity > 0;
                }),
                currentOrders: currentOrders.filter(function (x) {
                  return x.quantity > 0;
                }),
                filledOrders: filledOrders
              };
            }
          }
          book.push({
            type: orderType,
            price: orderPrice,
            quantity: orderSize
          });
        }
        return {
          book: book.filter(function (x) {
            return x.quantity > 0;
          }),
          currentOrders: currentOrders.filter(function (x) {
            return x.quantity > 0;
          }),
          filledOrders: filledOrders
        };
      });
    }
  }, {
    key: "generateOrder",
    value: function generateOrder() {
      var orderType = Math.random() > 0.5 ? "Buy" : "Sell";
      var orderPrice = this.state.price + gaussian() * 2 / 100;
      var orderSize = Math.floor(Math.random() * 15) * 100;
      if (orderType === "Buy") {
        orderPrice -= spread;
      } else {
        orderPrice += spread;
      }
      orderPrice = round(orderPrice);
      this.addOrder(orderType, orderPrice, orderSize);
    }
  }, {
    key: "generateMarketOrder",
    value: function generateMarketOrder() {
      var _this4 = this;

      var orderType = Math.random() > 0.5 ? "Buy" : "Sell";
      var rand = Math.random();
      var strike = Math.floor(Math.random() * 5) * 5 + 40;
      var tradeType = void 0,
          price = void 0;
      /*
      if (rand < 0.33){
        tradeType = "combo"
        price = Math.abs(this.state.price - strike + rc) 
      }
      */

      if (rand < 0.5) {
        tradeType = "call";
        price = BlackScholes("call", this.state.price, strike, timeToExpiry, interest, volatility);
      } else {
        tradeType = "put";
        price = BlackScholes("put", this.state.price, strike, timeToExpiry, interest, volatility);
      }
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.state.marketOrders[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _order2 = _step5.value;

          if (_order2.strike === strike && _order2.tradeType == tradeType) {
            //do not have another order of the same type 
            return this.generateMarketOrder();
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      price = round(price + gaussian() / 25);
      var orderSize = sizes[Math.floor(Math.random() * sizes.length)];

      var order = {
        type: orderType,
        tradeType: tradeType,
        strike: strike,
        price: price,
        size: orderSize,
        time: Date.now()
      };
      this.setState({
        marketOrders: [].concat(_toConsumableArray(this.state.marketOrders), [order])
      });
      this.marketTimeout = setTimeout(function () {
        return _this4.generateMarketOrder();
      }, 3000 + Math.random() * 7000);
    }
  }, {
    key: "createContent",
    value: function createContent(i) {
      var price = round(this.state.price + 0.07 - Math.floor(i / 3) / 100);
      if (i % 3 === 0) {
        var order = this.state.book.filter(function (x) {
          return x.type === "Buy" && x.price === price;
        });
        return order.length > 0 ? order[0].quantity.toString() : "";
      } else if (i % 3 === 1) {
        return price.toFixed(2);
      } else {
        var _order3 = this.state.book.filter(function (x) {
          return x.type === "Sell" && x.price === price;
        });
        return _order3.length > 0 ? _order3[0].quantity.toString() : "";
      }
    }
  }, {
    key: "createOption",
    value: function createOption(i) {
      if (i < 8) {
        if (i === 0) {
          return "Delta";
        }
        if (i === 1 || i === 5) {
          return "Bid";
        }
        if (i === 3 || i === 7) {
          return "Offer";
        }
        if (i === 2) {
          return "Call";
        }
        if (i === 4) {
          return "Strike";
        }
        if (i === 6) {
          return "Put";
        }
      }

      var strike = 35 + 5 * Math.floor(i / 8);
      if (i % 8 === 0) {
        return Math.round(100 * delta(this.state.ref, strike, timeToExpiry, interest, volatility));
      } else if (i % 8 === 2) {
        return BlackScholes("call", this.state.ref, strike, timeToExpiry, interest, volatility).toFixed(2);
      } else if (i % 8 === 4) {
        return strike;
      } else if (i % 8 === 6) {
        return BlackScholes("put", this.state.ref, strike, timeToExpiry, interest, volatility).toFixed(2);
      }
      var tradeType = void 0,
          orderType = void 0;
      if (i % 8 == 1 || i % 8 == 3) {
        tradeType = "call";
      } else {
        tradeType = "put";
      }
      if (i % 8 == 1 || i % 8 == 5) {
        orderType = "Buy";
      } else {
        orderType = "Sell";
      }
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.state.marketOrders[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var order = _step6.value;

          if (order.type === orderType && order.tradeType === tradeType && order.strike === strike) {
            return order.price.toFixed(2) + " / " + order.size + "x";
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }, {
    key: "displayOrder",
    value: function displayOrder(entry) {
      var _entry$0$split = entry[0].split(","),
          _entry$0$split2 = _slicedToArray(_entry$0$split, 2),
          type = _entry$0$split2[0],
          price = _entry$0$split2[1];

      var quantity = entry[1];
      return React.createElement(
        "div",
        { className: "alert alert-" + (type === "Buy" ? "success" : "danger"), role: "alert" },
        type + " " + quantity + (type === "Buy" ? " for " : " at ") + parseFloat(price).toFixed(2)
      );
    }
  }, {
    key: "displayMarketOrder",
    value: function displayMarketOrder(order) {
      return React.createElement(
        "div",
        { className: "alert alert-" + (order.type === "Buy" ? "success" : "danger"), role: "alert" },
        order.type + " " + order.strike + " " + order.tradeType + " " + (order.type === "Buy" ? " for " : " at ") + order.price.toFixed(2)
      );
    }
  }, {
    key: "determinePNL",
    value: function determinePNL() {
      var currentPrice = round(this.state.price);
      var sum = 0;
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = Object.entries(this.state.filledOrders)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var _ref = _step7.value;

          var _ref2 = _slicedToArray(_ref, 2);

          var entry = _ref2[0];
          var quantity = _ref2[1];

          var _entry$split = entry.split(","),
              _entry$split2 = _slicedToArray(_entry$split, 2),
              type = _entry$split2[0],
              _price = _entry$split2[1];

          _price = parseFloat(_price);
          quantity = parseFloat(quantity);
          if (type === "Buy") {
            sum += (currentPrice - _price) * quantity;
          } else {
            sum -= (currentPrice - _price) * quantity;
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this.state.filledMarketOrders[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var order = _step8.value;

          var sign = order.type === "Buy" ? 1 : -1;
          if (order.tradeType === "combo") {
            var theo = currentPrice - order.strike + rc;
            if (currentPrice > order.strike) {
              theo *= -1;
            }
            sum += 100 * sign * (Math.abs(theo) - order.price);
          } else if (order.tradeType === "call") {
            var _theo = BlackScholes("call", this.state.price, order.strike, timeToExpiry, interest, volatility);
            sum += round(100 * sign * (_theo - order.price)) * order.size;
          } else if (order.tradeType === "put") {
            var _theo2 = BlackScholes("put", this.state.price, order.strike, timeToExpiry, interest, volatility);
            sum += round(100 * sign * (_theo2 - order.price)) * order.size;
          }
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      return sum;
    }
  }, {
    key: "determineDelta",
    value: function determineDelta() {
      var sum = 0;
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = Object.entries(this.state.filledOrders)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var _ref3 = _step9.value;

          var _ref4 = _slicedToArray(_ref3, 2);

          var entry = _ref4[0];
          var quantity = _ref4[1];

          var _entry$split3 = entry.split(","),
              _entry$split4 = _slicedToArray(_entry$split3, 2),
              type = _entry$split4[0],
              _price2 = _entry$split4[1];

          quantity = parseFloat(quantity);
          if (type === "Buy") {
            sum += quantity;
          } else {
            sum -= quantity;
          }
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = this.state.filledMarketOrders[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var order = _step10.value;

          if (order.tradeType === "combo") {
            if (order.type === "Buy" && order.strike <= this.state.price || order.type === "Sell" && order.stike < this.state.price) {
              sum += 100;
            } else {
              sum -= 100;
            }
          } else if (order.tradeType === "call") {
            var d = 100 * round(delta(this.state.price, order.strike, timeToExpiry, interest, volatility));
            if (order.type === "Sell") {
              d *= -1;
            }
            sum += d * order.size;
          } else if (order.tradeType === "put") {
            var _d = 100 * round(delta(this.state.price, order.strike, timeToExpiry, interest, volatility) - 1);
            if (order.type === "Sell") {
              _d *= -1;
            }
            sum += _d * order.size;
          }
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      return Math.round(sum);
    }
  }, {
    key: "handleMarketOrder",
    value: function handleMarketOrder(i) {
      var _this5 = this;

      if (i >= 8 && i % 2 === 1) {
        var strike = 35 + 5 * Math.floor(i / 8);
        var tradeType = void 0,
            orderType = void 0;
        if (i % 8 == 1 || i % 8 == 3) {
          tradeType = "call";
        } else {
          tradeType = "put";
        }
        if (i % 8 == 1 || i % 8 == 5) {
          orderType = "Buy";
        } else {
          orderType = "Sell";
        }

        var _loop = function _loop(order) {
          if (order.type === orderType && order.strike === strike && order.tradeType === tradeType) {
            var newOrder = JSON.parse(JSON.stringify(order));
            if (order.type === "Buy") {
              newOrder.type = "Sell";
            } else {
              newOrder.type = "Buy";
            }
            _this5.setState({
              marketOrders: _this5.state.marketOrders.filter(function (x) {
                return x.time !== order.time;
              }),
              filledMarketOrders: [].concat(_toConsumableArray(_this5.state.filledMarketOrders), [newOrder])
            });
          }
        };

        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = this.state.marketOrders[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var order = _step11.value;

            _loop(order);
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11.return) {
              _iterator11.return();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }
      }
      /*
      let newOrder = JSON.parse(JSON.stringify(order))
      if (order.type === "Buy"){
        newOrder.type = "Sell"
      }
      else{
        newOrder.type = "Buy"
      }
      this.setState({
        marketOrders: this.state.marketOrders.filter(x => x.time !== order.time),
        filledMarketOrders: [...this.state.filledMarketOrders, newOrder]
      })
      */
    }
  }, {
    key: "deleteOrder",
    value: function deleteOrder(order) {
      var quantity = order.quantity;
      var book = JSON.parse(JSON.stringify(this.state.book));
      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = book[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          var order2 = _step12.value;

          if (order.type === order2.type && order.price === order2.price) {
            order2.quantity -= quantity;
          }
        }
      } catch (err) {
        _didIteratorError12 = true;
        _iteratorError12 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion12 && _iterator12.return) {
            _iterator12.return();
          }
        } finally {
          if (_didIteratorError12) {
            throw _iteratorError12;
          }
        }
      }

      this.setState({
        book: book.filter(function (x) {
          return x.quantity > 0;
        }),
        currentOrders: this.state.currentOrders.filter(function (x) {
          return x.type !== order.type || x.price !== order.price;
        })
      });
    }
  }, {
    key: "handleOrder",
    value: function handleOrder(i) {
      var _this6 = this;

      var orderPrice = round(this.state.price + 0.07 - Math.floor(i / 3) / 100);
      if (i % 3 === 1) {
        return;
      }
      var orderType = i % 3 === 0 ? "Buy" : "Sell";

      this.setState(function (state, props) {
        var currentOrders = JSON.parse(JSON.stringify(state.currentOrders));
        var orderSize = _this6.state.stockSize;

        //deep copy book
        console.log(currentOrders);
        var book = JSON.parse(JSON.stringify(state.book));
        var filledOrders = JSON.parse(JSON.stringify(state.filledOrders));
        if (orderType === "Buy") {
          //orderPrice -= spread
          for (var _i3 = 0; _i3 < book.length; _i3++) {
            if (book[_i3].type === "Sell" && book[_i3].price <= orderPrice) {

              var amountToTrade = Math.min(book[_i3].quantity, orderSize);
              if (amountToTrade > 0) {
                book[_i3].quantity -= amountToTrade;
                orderSize -= amountToTrade;
                if ([orderType, book[_i3].price] in filledOrders) {
                  filledOrders[[orderType, book[_i3].price]] += amountToTrade;
                } else {
                  filledOrders[[orderType, book[_i3].price]] = amountToTrade;
                }
              }
            }
          }
        } else {
          //orderPrice += spread
          for (var _i4 = book.length - 1; _i4 >= 0; _i4--) {
            if (book[_i4].type === "Buy" && book[_i4].price >= orderPrice) {

              var _amountToTrade2 = Math.min(book[_i4].quantity, orderSize);
              if (_amountToTrade2 > 0) {
                book[_i4].quantity -= _amountToTrade2;
                orderSize -= _amountToTrade2;
                if ([orderType, book[_i4].price] in filledOrders) {
                  filledOrders[[orderType, book[_i4].price]] += _amountToTrade2;
                } else {
                  filledOrders[[orderType, book[_i4].price]] = _amountToTrade2;
                }
              }
            }
          }
        }
        if (orderSize > 0) {
          var found = false;
          var _iteratorNormalCompletion13 = true;
          var _didIteratorError13 = false;
          var _iteratorError13 = undefined;

          try {
            for (var _iterator13 = currentOrders[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
              var order = _step13.value;

              if (order.type === orderType && order.price === orderPrice) {
                order.quantity += orderSize;
                found = true;
              }
            }
            //if no match, add to existing order or create new order
          } catch (err) {
            _didIteratorError13 = true;
            _iteratorError13 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion13 && _iterator13.return) {
                _iterator13.return();
              }
            } finally {
              if (_didIteratorError13) {
                throw _iteratorError13;
              }
            }
          }

          if (!found) {
            currentOrders.push({
              type: orderType,
              price: orderPrice,
              quantity: orderSize
            });
          }

          for (var _i5 = 0; _i5 < book.length; _i5++) {
            if (book[_i5].price === orderPrice) {
              console.log("add to book");
              book[_i5].quantity += orderSize;
              return {
                book: book.filter(function (x) {
                  return x.quantity > 0;
                }),
                currentOrders: currentOrders.filter(function (x) {
                  return x.quantity > 0;
                }),
                filledOrders: filledOrders
              };
            }
            if (orderPrice < book[_i5].price) {
              book.splice(_i5, 0, {
                type: orderType,
                price: orderPrice,
                quantity: orderSize
              });
              return {
                book: book.filter(function (x) {
                  return x.quantity > 0;
                }),
                currentOrders: currentOrders.filter(function (x) {
                  return x.quantity > 0;
                }),
                filledOrders: filledOrders
              };
            }
          }
          book.push({
            type: orderType,
            price: orderPrice,
            quantity: orderSize
          });
        }
        return {
          book: book.filter(function (x) {
            return x.quantity > 0;
          }),
          currentOrders: currentOrders.filter(function (x) {
            return x.quantity > 0;
          }),
          filledOrders: filledOrders
        };
      });
    }
  }, {
    key: "handleInputChange",
    value: function handleInputChange(event) {
      this.setState({
        deltaAdjust: event.target.checked
      });
    }
  }, {
    key: "handlePause",
    value: function handlePause(event) {
      var _this7 = this;

      if (this.state.paused) {
        this.timerInterval = setInterval(function () {
          return _this7.tick();
        }, 1000);
        this.orderInterval = setInterval(function () {
          return _this7.generateOrder();
        }, 100);
        this.generateMarketOrder();
        this.setState({ paused: false });
      } else {
        clearInterval(this.timerInterval);
        clearInterval(this.orderInterval);
        clearTimeout(this.marketTimeout);
        this.setState({ paused: true });
      }
    }
  }, {
    key: "onStockSizeChange",
    value: function onStockSizeChange(event) {
      this.setState({
        stockSize: parseInt(event.target.value)
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this8 = this;

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "div",
            { className: "col-1" },
            React.createElement(
              "h1",
              null,
              "Current Orders"
            ),
            this.state.currentOrders.map(function (x, i) {
              return React.createElement(
                "div",
                { className: "alert alert-" + (x.type === "Buy" ? "success" : "danger"), role: "alert", onClick: function onClick() {
                    return _this8.deleteOrder(x);
                  } },
                x.type === "Buy" ? x.price.toFixed(2) + " bid for " + x.quantity : "Offer " + x.quantity + " at " + x.price.toFixed(2)
              );
            })
          ),
          React.createElement(
            "div",
            { className: "col-1" },
            React.createElement(
              "h1",
              null,
              "Filled Orders"
            ),
            Object.entries(this.state.filledOrders).map(function (k) {
              return _this8.displayOrder(k);
            }),
            this.state.filledMarketOrders.map(function (order) {
              return _this8.displayMarketOrder(order);
            })
          ),
          React.createElement(
            "div",
            { className: "col-3" },
            React.createElement(
              "div",
              { className: "grid-container" },
              [].concat(_toConsumableArray(Array(45))).map(function (x, i) {
                return React.createElement(
                  "div",
                  { key: i, className: "grid-item", style: { color: i === 22 ? "red" : "black" }, onClick: function onClick() {
                      return _this8.handleOrder(i);
                    } },
                  _this8.createContent(i)
                );
              })
            ),
            React.createElement(
              "div",
              { onChange: this.onStockSizeChange },
              React.createElement(
                "div",
                { className: "form-check form-check-inline" },
                React.createElement("input", { type: "radio", className: "form-check-input", value: "100", id: "stockSize1", name: "stockSize", checked: this.state.stockSize === 100 }),
                React.createElement(
                  "label",
                  { className: "form-check-label", "for": "inlineRadio1" },
                  "100"
                )
              ),
              React.createElement(
                "div",
                { className: "form-check form-check-inline" },
                React.createElement("input", { type: "radio", className: "form-check-input", value: "1000", id: "stockSize2", checked: this.state.stockSize === 1000, name: "stockSize" }),
                React.createElement(
                  "label",
                  { className: "form-check-label", "for": "inlineRadio2" },
                  "1000"
                )
              ),
              React.createElement(
                "div",
                { className: "form-check form-check-inline" },
                React.createElement("input", { type: "radio", className: "form-check-input", value: "5000", id: "stockSize3", checked: this.state.stockSize === 5000, name: "stockSize" }),
                React.createElement(
                  "label",
                  { className: "form-check-label", "for": "inlineRadio3" },
                  "5000"
                )
              ),
              React.createElement(
                "div",
                { className: "form-check form-check-inline" },
                React.createElement("input", { type: "radio", className: "form-check-input", value: "25000", id: "stockSize4", checked: this.state.stockSize === 25000, name: "stockSize" }),
                React.createElement(
                  "label",
                  { className: "form-check-label", "for": "inlineRadio4" },
                  "25000"
                )
              )
            ),
            React.createElement(
              "button",
              { type: "button", className: this.state.paused ? "btn btn-success" : "btn btn-secondary", onClick: function onClick() {
                  return _this8.handlePause();
                } },
              React.createElement("i", { className: this.state.paused ? "bi bi-play" : "bi bi-pause" })
            )
          ),
          React.createElement(
            "div",
            { className: "col-6" },
            React.createElement(
              "h3",
              null,
              "PNL"
            ),
            React.createElement(
              "h5",
              null,
              "$",
              this.determinePNL().toFixed(2)
            ),
            React.createElement(
              "h3",
              null,
              "Delta"
            ),
            React.createElement(
              "h5",
              null,
              this.determineDelta()
            ),
            React.createElement(
              "h3",
              null,
              "Volatility"
            ),
            React.createElement(
              "h5",
              null,
              100 * volatility
            ),
            React.createElement(
              "h3",
              null,
              "Cost of Carry"
            ),
            React.createElement(
              "h5",
              null,
              rc
            ),
            React.createElement(
              "h3",
              null,
              "Days to Expiry"
            ),
            React.createElement(
              "h5",
              null,
              "30"
            ),
            React.createElement(
              "div",
              { className: "option-container" },
              [].concat(_toConsumableArray(Array(48))).map(function (x, i) {
                return React.createElement(
                  "div",
                  { key: i, className: "grid-item", onClick: function onClick() {
                      return _this8.handleMarketOrder(i);
                    } },
                  _this8.createOption(i)
                );
              })
            ),
            React.createElement(
              "h3",
              null,
              "Ref"
            ),
            React.createElement(
              "h5",
              null,
              this.state.ref.toFixed(2)
            ),
            React.createElement("input", {
              name: "deltaAdjust",
              type: "checkbox",
              checked: this.state.deltaAdjust,
              onChange: this.handleInputChange }),
            React.createElement(
              "label",
              null,
              "Delta Adjust"
            ),
            React.createElement("div", { style: { padding: 10 } }),
            React.createElement(
              "button",
              { type: "button", "class": "btn btn-primary", "data-bs-toggle": "modal", "data-bs-target": "#exampleModal" },
              "Help"
            )
          )
        )
      );
    }
  }]);

  return Ladder;
}(React.Component);

/*
<div className="col-2">
  <h1>Market Orders</h1>
  {this.state.marketOrders.map(order => 
    <div className={"alert alert-" + (order.type === "Buy" ? "success" : "danger")} role="alert" onClick={() => this.handleMarketOrder(order)}>
      {order.strike + " " + order.tradeType + " " + order.price.toFixed(2) + " " + (order.type === "Buy" ? "bid" : "offer")}
    </div>
  )}

</div>
*/

var domContainer = document.querySelector('#ladder_container');
ReactDOM.render(React.createElement(Ladder, null), domContainer);