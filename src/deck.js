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

exports function() { return new Deck };