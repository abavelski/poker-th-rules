

var Player = function(name, amount) {
	this.name = name;
	this.amount = amount;
	this.bet = 0;
};


var Deck = function() {
	var cards = [1,2,3,4,5,6,7,8,9,10,11,12,13,
		14,15,16,17,18,19,20,21,22,23,24,25,26,
		27,28,29,30,31,32,33,34,35,36,37,38,39,
		40,41,42,43,44,45,46,47,48,49,50,51,52];

	this.shuffleDeck = function() {
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

	this.deal = function(players) {
		for (var i=0; i<players.length; i++) {
			var player = players[i];
			player.hand = [cards.shift(), cards.shift()];
		}

	};

	this.flop = function(table) {
		table.communityCards = [cards.shift(), cards.shift(), cards.shift()];
	};

	this.turn = function(table) {
		table.communityCards.push(cards.shift());
	};

	this.river = function(table) {
		table.communityCards.push(cards.shift());
	};

}

var BettingRound = function(smBlindAmount, players, dealer) {
	var currentBet = 0;
	var pot = 0;
	var move;

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

	this.start = function() {
		var i;

		i = (dealer+1) % players.length;
		players[i].amount-=smBlindAmount;
		players[i].bet = smBlindAmount;

		i=(dealer+2) % players.length;
		players[i].amount-=smBlindAmount*2;
		players[i].bet = smBlindAmount*2;

		currentBet = smBlindAmount*2;

		move =	3 % players.length;
		return {
			status : 'betting',
			next : move
		};
	};

	this.getDealer = function() {
		return dealer;
	};

	this.call = function(i) {
		if (i!==move) {
			return getError('wrong-player');
		};
		var callAmount = currentBet-players[i].bet;
		players[i].amount-=callAmount;
		players[i].bet+=callAmount;
		players[i].said = true;
		move= (move+1) % players.length;
		return {
			status : checkStatus(),
			next : move
		};
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
		return {
			status : checkStatus(),
			next : move
		};
	};

	this.raise = function(i, raiseAmount) {
		if (i!==move) {
			return getError('wrong-player');
		};
		if(currentBet<=players[i].bet+raiseAmount) {
			return getError('wrong-amount');
		};
		players[i].said = true;
		players[i].amount-=raiseAmount;
		players[i].bet+=raiseAmount;
		move= (move+1) % players.length;
		return {
			status : checkStatus(),
			next : move
		};
	};

	this.fold = function(i) {
		if (i!==move) {
			return getError('wrong-player');
		};
		pot+=players[i].bet;
		players.splice(i, 1);
		move= move % players.length;
		return {
			status : checkStatus(),
			next : move
		};
	}
};

module.exports = {
	newDeck : function() {
		return new Deck();
	},
	newPlayer : function(name, amount) {
		return new Player(name, amount);
	},
	newBettingRound : function(smBlindAmount, players, dealer) {
		return new BettingRound(smBlindAmount, players, dealer);
	}
};



