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

exports function(smBlindAmount, players, dealer) {
		return new BettingRound(smBlindAmount, players, dealer);
	};