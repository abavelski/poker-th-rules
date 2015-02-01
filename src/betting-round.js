var smBlindAmount, players, dealer, currentBet, pot, move;

var initPlayer = function(player) {
	player.bet = 0;
	player.said = false;
};

var checkStatus = function() {
	var i, notAllIn =0;
	if (players.length===1) {
		return 'winner-found';	
	}
	for (i=0; i<players.length; i++) {
		if (!players[i].allIn) {
			notAllIn++;
		}
	}
	if (notAllIn<=1) {
		return 'betting-done';
	}
	for (i=0; i<players.length; i++) {
		if ((players[i].bet!==currentBet && !players[i].allIn) || !players[i].said) {
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


var checkMove = function() {
	var tmp = move;
	if (players[move].allIn) {
		move= (move+1) % players.length;
	}
	while (players[move].allIn && tmp!==move) {
		move= (move+1) % players.length;
	}
	return move;
};

var getResponse = function() {
	return {
		status : checkStatus(),
		next : checkMove(),
		pot : pot,
		players : players
	}
};

var BettingRound = function() {
	this.withSmallBlind = function(_smBlindAmount) {
		smBlindAmount = _smBlindAmount;
		return this;
	};

	this.withPlayers = function(_players) {
		players = _players;
		return this;
	};

	this.withDealer = function(_dealer) {
		dealer = _dealer;
		return this;
	};
};

BettingRound.prototype.start = function() {
		currentBet = 0;
		pot = 0;
		move =	(dealer+3) % players.length;
		players.map(initPlayer);
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

BettingRound.prototype.call = function(i) {
	if (i!==move) {
		return getError('wrong-player');
	};
	var callAmount = currentBet-players[i].bet;
	if (callAmount>players[i].amount) {
		pot+=players[i].amount;
		players[i].bet+=players[i].amount;;
		players[i].amount=0;
		players[i].allIn=true;
		players[i].said = true;
	} else {
		pot+=callAmount;
		players[i].amount-=callAmount;
		players[i].bet+=callAmount;
		players[i].said = true;
	}

	move= (move+1) % players.length;
	return getResponse();
};

BettingRound.prototype.fold = function(i) {
	if (i!==move) {
		return getError('wrong-player');
	};
	players.splice(i, 1);
	move= move % players.length;
	return getResponse();
};

BettingRound.prototype.check = function(i) {
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

BettingRound.prototype.raise = function(i, raiseAmount) {
	if (i!==move) {
		return getError('wrong-player');
	};
	if(players[i].bet+raiseAmount<=currentBet) {
		return getError('wrong-amount');
	};
	if (players[i].amount<raiseAmount) {
		return getError('not-enough-money');
	}
	players[i].said = true;
	players[i].amount-=raiseAmount;
	if  (players[i].amount===0) {
		players[i].allIn = true;
	}
	players[i].bet+=raiseAmount;
	currentBet=players[i].bet;
	pot+=raiseAmount;
	move= (move+1) % players.length;
	return getResponse();
};

BettingRound.prototype.nextToMove = function() {
	return move;
};

BettingRound.prototype.getPot = function() {
	return pot;
};


module.exports = function() {
	return new BettingRound();
};