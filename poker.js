

var Player = function(name, amount) {
	this.name = name;
	this.amount = amount;
};


var Deck = function() {
	var cards = [1,2,3,4,5,6,7,8,9,10,11,12,13,
		14,15,16,17,18,19,20,21,22,23,24,25,26,
		27,28,29,30,31,32,33,34,35,36,37,38,39,
		40,41,42,43,44,45,46,47,48,49,50,51,52];

	this.shuffleCards = function() {
		var i = cards.length;
		if ( i == 0 ) return false;
		while ( --i ) {
			var j = Math.floor( Math.random() * ( i + 1 ) );
			var tempi = cards[i];
			var tempj = cards[j];
			cards[i] = tempj;
			cards[j] = tempi;
		}
	};

	this.dealPlayers = function(players) {
		for (var i=0; i<players.length; i++) {
			var player = players[i];
			player.hand = [cards.shift(), cards.shift()];
		}
	};

	this.dealCard = function() {
		return cards.shift();
	}
};

var BettingRound = function(smBlindAmount, players, dealer) {
	var currentBet = 0,
		pot = 0,
		move =	(dealer+3) % players.length,
		initPlayer = function(player) {
			player.bet = 0;
			player.said = false;
		};
		players.map(initPlayer);

	var checkStatus = function() {
		if (players.length===1) {
			return 'winner-found';	
		}
		for (var i=0; i<players.length; i++) {
			if (players[i].bet!==currentBet || !players[i].said) {
				return 'betting';
			}
		}
		return 'round-done';
	};

	var getError = function(errCode) {
		return {
			status : 'error',
			errorCode : errCode
		}
	};

	var getResponse = function() {
		return {
			status : checkStatus(),
			next : move,
			pot : pot,
			players : players
		}
	};

	this.start = function() {
		var i;

		i = (dealer+1) % players.length;
		players[i].amount-=smBlindAmount;
		players[i].bet = smBlindAmount;

		i=(dealer+2) % players.length;
		players[i].amount-=smBlindAmount*2;
		players[i].bet = smBlindAmount*2;

		currentBet = smBlindAmount*2;

		pot+=smBlindAmount*3;
		return {
			status : 'betting',
			next : move
		};
	};

	this.nextToMove = function() {
		return move;
	};

	this.getPot = function() {
		return pot;
	};

	this.call = function(i) {
		if (i!==move) {
			return getError('wrong-player');
		};
		var callAmount = currentBet-players[i].bet;
		pot+=callAmount;
		players[i].amount-=callAmount;
		players[i].bet+=callAmount;
		players[i].said = true;
		move= (move+1) % players.length;
		return getResponse();
	};


	this.check = function(i) {
		if (i!==move) {
			return getError('wrong-player');
		};
		if(currentBet!==players[i].bet) {
			return getError('call-or-fold');
		};
		players[i].said = true;
		move= (move+1) % players.length;
		return getResponse();
	};

	this.raise = function(i, raiseAmount) {
		if (i!==move) {
			return getError('wrong-player');
		};
		if(players[i].bet+raiseAmount<=currentBet) {
			return getError('wrong-amount');
		};
		players[i].said = true;
		players[i].amount-=raiseAmount;
		players[i].bet+=raiseAmount;
		currentBet=players[i].bet;
		pot+=raiseAmount;
		move= (move+1) % players.length;
		return getResponse();
	};

	this.fold = function(i) {
		if (i!==move) {
			return getError('wrong-player');
		};
		players.splice(i, 1);
		move= move % players.length;
		return getResponse();
	}
};

var GameRound = function() {
	var self = this,
		deck = new Deck(),
		dealer,
		smBlind,
		communityCards,
		currentRound,
		pot=0;

	this.nextToMove = function() {
		return self.players[currentRound.nextToMove()].name;
	};
	this.move = function(obj) {
		var playerIndex=-1;
		var response = {
			currentRound : currentRound.name
		};
		for (var i=0;i<this.players.length;i++) {
			if (this.players[i].name===obj.name) {
				playerIndex = i;
				break;
			}
		}
		if (playerIndex===-1) {
			response.error = 'unknown-player';
			return response;
		}

		var result = currentRound[obj.action](playerIndex, obj.amount);
		response.status = result.status;
		if (result.status==='betting' || result.status==='error') {
			response.next = self.players[currentRound.nextToMove()].name;
		}
		if (result.status==='winner-found' || result.status==='round-done') {
			pot+=currentRound.getPot();
			response.pot = pot;
		}
		if (result.errorCode) {
			response.error = result.errorCode;
		}
		return response;
	};

	this.withPlayers = function(players) {
		this.players = players;
		return this;
	};

	this.withDealer = function(i) {
		dealer = i;
		return this;
	};

	this.withSmallBlind = function(s) {
		smBlind = s;
		return this;
	};

	this.preFlop = function() {
		deck.shuffleCards();
		deck.dealPlayers(this.players);
		currentRound = new BettingRound(smBlind, self.players, dealer);
		currentRound.name = 'preflop';
		currentRound.start();
        return currentRound;
	};

	var dealFlop = function() {
		communityCards=[deck.dealCard(), deck.dealCard(), deck.dealCard()];
		return communityCards;
	};

	this.getCommunityCards = function() {
		return communityCards;
	};

	var dealCard = function() {
		var card = deck.dealCard();
		communityCards.push(card);
		return card;
	};


	this.flop = function(){
		dealFlop();
		currentRound = new BettingRound(smBlind, self.players, dealer);
		currentRound.name = 'flop';
        return currentRound;
	};

	var newRound = function(name) {
		dealCard();
		currentRound = new BettingRound(smBlind, self.players, dealer);
		currentRound.name = name;
		return currentRound;
	};

	this.turn = function() {
		return newRound('turn');
	};
	this.river = function() {
		return newRound('river');
	};


};

var Game = function() {
	var self = this,
		dealer= 0,
		round = 1,
		smBlind=10,
		gameRound;

	this.withPlayers = function(players) {
		this.players = players;
		return this;
	};

	this.withSmallBlind = function(s) {
		smBlind = s;
		return this;
	};

	this.start = function() {
		gameRound = new GameRound();
		gameRound.preFlop();

	}

};

module.exports = {
	newPlayer : function(name, amount) {
		return new Player(name, amount);
	},
	newBettingRound : function(smBlindAmount, players, dealer) {
		return new BettingRound(smBlindAmount, players, dealer);
	},
	newGameRound : function() {
		return new GameRound();
	},
	newGame : function() {
		return new Game();
	}
};



