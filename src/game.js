var newGameRound = require('game-round');
var Game = function() {
	var self = this,
		dealer,
		round = 0,
		smBlind=10,
		evaluate,
		gameRound,
		roundPlayers;

	this.findWinner = function(cards, players) {
		var res, max = 0;
		for (var i =0; i<players.length; i++) {
			var hand = cards.slice(0).concat(players[i].hand);
			var playerRes = evaluate(hand);
				if (max<playerRes.score) {
					res = playerRes;
					res.winner = players[i];
					max = playerRes.score;
				}
		}
		return res;
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
		gameRound = newGameRound()
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
			var winner = this.findWinner(gameRound.getCommunityCards(), roundPlayers).winner;
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

exports function() {
		return new Game();
	};