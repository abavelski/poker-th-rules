var newGameRound = require('../src/game-round.js'),
    newPlayer = require('../src/player.js');

describe("Game round test suite", function () {

    it("preflop", function () {
        var player1 = newPlayer('player1', 100);
        var player2 = newPlayer('player2', 100);
        var players = [player1, player2];

        var gameRound = newGameRound()
            .withPlayers(players)
            .withDealer(0)
            .withSmallBlind(10);

        var preFlop = gameRound.preFlop();
        expect(players[0].hand.length).toEqual(2);
        expect(players[1].hand.length).toEqual(2);
        expect(players[0].amount).toEqual(80);
        expect(players[1].amount).toEqual(90);
        expect(preFlop.nextToMove()).toEqual(1);
        
    });




    it("2 players, one game round", function () {
        var player1 = newPlayer('player1', 100);
        var player2 = newPlayer('player2', 100);
        var players = [player1, player2];

        var gameRound = newGameRound()
            .withPlayers(players)
            .withDealer(0)
            .withSmallBlind(10);

        var preFlop = gameRound.preFlop();
        expect(players[0].hand.length).toEqual(2);
        expect(players[1].hand.length).toEqual(2);
        expect(players[0].amount).toEqual(80);
        expect(players[1].amount).toEqual(90);
        expect(preFlop.nextToMove()).toEqual(1);
        preFlop.call(1);
        var res = preFlop.check(0);
        expect(res.status).toEqual('round-done');
        expect(res.pot).toEqual(40);
        expect(players[0].amount).toEqual(80);
        expect(players[1].amount).toEqual(80);

        var flop = gameRound.flop();
        expect(gameRound.getCommunityCards().length).toEqual(3);
        expect(flop.nextToMove()).toEqual(1);
        flop.check(1);
        flop.check(0);

        var turn = gameRound.turn();
        expect(gameRound.getCommunityCards().length).toEqual(4);
        turn.raise(1, 20);
        expect(turn.call(0).status).toEqual('round-done');

        var river = gameRound.river();
        river.raise(1, 20);
        expect(river.fold(0).status).toEqual('winner-found');
    });

    it("game round test", function () {
        var players = [newPlayer('player1', 100),
                        newPlayer('player2', 100)];

        var gameRound = newGameRound()
            .withPlayers(players)
            .withDealer(0)
            .withSmallBlind(10);
        gameRound.preFlop();
        expect(gameRound.move({name : 'player5'}).error).toEqual('unknown-player');
        expect(gameRound.move({name: 'player1', action: 'call'}).error).toEqual('wrong-player');
        expect(gameRound.move({name: 'player2', action: 'check'}).error).toEqual('call-or-fold');
        gameRound.move({name: 'player2', action: 'call'});
        expect(gameRound.move({name: 'player1', action: 'check'}))
            .toEqual({ currentRound: 'preflop', status: 'round-done', pot: 40 });
        expect(players[0].amount).toEqual(80);
        expect(players[1].amount).toEqual(80);

        gameRound.flop();
        expect(gameRound.nextToMove()).toEqual('player2');
        expect(players[0].amount).toEqual(80);
        expect(players[1].amount).toEqual(80);

        console.log(gameRound.move({name: 'player2', action: 'check'}));
        //expect(gameRound.move({name: 'player2', action: 'check'})).toEqual({ currentRound: 'flop', status: 'betting', next: 'player1' });
        //expect(gameRound.move({name: 'player1', action: 'check'})).toEqual({ currentRound: 'flop', status: 'round-done', pot: 40 });

        //gameRound.turn();
        //expect(gameRound.move({name: 'player2', action: 'raise', amount: 20})).toEqual({ currentRound: 'turn', status: 'betting', next: 'player1' });
        //expect(gameRound.move({name: 'player1', action: 'call'})).toEqual({ currentRound: 'turn', status: 'round-done', pot: 80 });

        //gameRound.river();
        //expect(gameRound.move({name: 'player2', action: 'raise', amount: 20})).toEqual({ currentRound: 'river', status: 'betting', next: 'player1' });
        //expect(gameRound.move({name: 'player1', action: 'call'})).toEqual({ currentRound: 'river', status: 'round-done', pot: 120 });
    });

});