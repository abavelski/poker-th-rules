
var Player = function(name, amount) {
	this.name = name;
	this.amount = amount;
};


var Deck = function() {

	var cards = ['As', 'Ks', 'Qs', 'Vs', 'Ts', '9s','8s', '7s', '6s', '5s', '4s', '3s', '2s',
				 'Ac', 'Kc', 'Qc', 'Vc', 'Tc', '9c','8c', '7c', '6c', '5c', '4c', '3c', '2c',
				 'Ah', 'Kh', 'Qh', 'Vh', 'Th', '9h','8h', '7h', '6h', '5h', '4h', '3h', '2h',
				 'Ad', 'Kd', 'Qd', 'Vd', 'Td', '9d','8d', '7d', '6d', '5d', '4d', '3d', '2d'];

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

	this.getBettingRound = function() {
		return currentRound.name;
	}


};

var Game = function() {
	var self = this,
		dealer,
		round = 0,
		smBlind=10,
		evaluate,
		gameRound,
		roundPlayers;

	var findWinner = function(cards, players) {

	};

	this.withPlayers = function(players) {
		this.players = players;
		return this;
	};

	this.withHandEvaluator = function(e) {
		evaluate = e;
		return this;
	};

	this.withSmallBlind = function(s) {
		smBlind = s;
		return this;
	};

	this.newRound = function() {
		roundPlayers = self.players.slice(0);
		if(dealer===0) {
			dealer= (dealer+1) % self.players.length;
		} else {
			dealer =0;
		};
		round++;
		gameRound = new GameRound()
			.withPlayers(roundPlayers)
			.withDealer(dealer)
			.withSmallBlind(smBlind);
		gameRound.preFlop();
		return {
			dealer: dealer,
			round : round,
			bettingRound: gameRound.getBettingRound(),
			status : 'hands-dealt',
			nextToMove : gameRound.nextToMove(),
			players : roundPlayers
		}
	};

	this.move = function(obj) {
		var newRound = function(pot) {
			return {
				pot : pot,
				currentRound: gameRound.getBettingRound(),
				communityCards : gameRound.getCommunityCards(),
				nextToMove : gameRound.nextToMove(),
				status : 'new-betting-round'
			};
		};

		var res = gameRound.move(obj);
		if (res.status==='round-done' && res.currentRound==='preflop') {
			gameRound.flop();
			res = newRound(res.pot);
		} else if (res.status==='round-done' && res.currentRound==='flop') {
			gameRound.turn();
			res = newRound(res.pot);
		} else if (res.status==='round-done' && res.currentRound==='turn') {
			gameRound.river();
			res = newRound(res.pot);
		} else if (res.status==='round-done' && res.currentRound==='river') {
			var winner = findWinner(gameRound.getCommunityCards(), roundPlayers);
			winner.amount+=res.pot;
			res = {
				status : 'showing-down',
				communityCards : gameRound.getCommunityCards(),
				players : roundPlayers,
				winner : winner.name
			}

		} else if (res.status === 'winner-found'){
			var winner = roundPlayers[0];
			winner.amount+=res.pot;
			res.winner = winner.name;
		};
		res.round = round;
		return res;

	};

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



