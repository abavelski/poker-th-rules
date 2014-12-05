

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

var Game = function(smBlindAmount, pl) {
	var smBlindAmount = smBlindAmount;
	var players = pl;
	var dealer = 0;
	var currentBet = 0;
	var move;

	var checkStatus = function() {
		for (var i=0; i<players.length; i++) {
			if (players[i].bet!==currentBet || !players[i].said) {
				return 'betting';
			}
		}
		return 'done';
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
			return 'wrong player';
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
			return 'wrong player';
		};
		if(currentBet!==players[i].bet) {
			return 'call or fold';
		};
		players[i].said = true;
		move= (move+1) % players.length;
		return {
			status : checkStatus(),
			next : move
		};
	};



};






module.exports = {
	newDeck : function() {
		return new Deck();
	},
	newPlayer : function(name, amount) {
		return new Player(name, amount);
	},
	newGame : function(smBlindAmount, players) {
		return new Game(smBlindAmount, players);
	}
};



