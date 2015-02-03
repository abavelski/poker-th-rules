var newDeck = require('./deck');
var newBettingRound = require('./betting-round');

var GameRound = function() {
	var self = this,
		deck = newDeck(),
		dealer,
		smBlind,
		communityCards,
		currentRound,
		pot=0,
		pots = [];


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
		if (result.status==='winner-found' || result.status==='round-done' ) {
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

		currentRound = newBettingRound().withSmallBlind(smBlind).withPlayers(self.players).withDealer(dealer).init();
		currentRound.name = 'preflop';
		currentRound.start();
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
		currentRound = newBettingRound().withSmallBlind(smBlind).withPlayers(self.players).withDealer(dealer).init();
		currentRound.name = 'flop';
        return currentRound;
	};

	var newRound = function(name) {
		dealCard();
		currentRound = newBettingRound().withSmallBlind(smBlind).withPlayers(self.players).withDealer(dealer).init();
		currentRound.name = name;
	};

	this.turn = function() {
		newRound('turn');
	};
	this.river = function() {
		newRound('river');
	};

	this.getBettingRound = function() {
		return currentRound.name;
	}


};

module.exports = function() {
		return new GameRound();
	};