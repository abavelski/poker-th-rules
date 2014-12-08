var poker = require("./poker");

describe("BettingRound test suite", function () {

    it("2 players bet", function () {
        var player1 = poker.newPlayer('player1', 100);
        var player2 = poker.newPlayer('player2', 100);
        var players = [player1, player2];
        
        var round = poker.newBettingRound(10, players, 0);

        expect(round.start().next).toEqual(1);
        expect(player1.amount).toEqual(80);
        expect(player2.amount).toEqual(90);

        expect(round.call(0)).toEqual({status: 'error', errorCode: 'wrong-player'});
        expect(round.check(1)).toEqual({status: 'error', errorCode: 'call-or-fold'});

        var res1 = round.call(1);
        expect(res1.next).toEqual(0);
        expect(res1.status).toEqual('betting');
        expect(player2.amount).toEqual(80);

        expect(round.check(1)).toEqual({status: 'error', errorCode: 'wrong-player'});
        var res2 = round.check(0);
        expect(res2.status).toEqual('round-done');
        expect(res2.next).toEqual(1);
    });

    it("3 players, raise, call, call", function () {
        var player1 = poker.newPlayer('player1', 100);
        var player2 = poker.newPlayer('player2', 100);
        var player3 = poker.newPlayer('player2', 100);
        var players = [player1, player2, player3];

        var round = poker.newBettingRound(10, players, 0);
        expect(round.start().next).toEqual(0);
        expect(player1.amount).toEqual(100);
        expect(player2.amount).toEqual(90);
        expect(player3.amount).toEqual(80);

        var res = round.raise(0, 40);
        expect(res.status).toEqual('betting');
        expect(player1.amount).toEqual(60);
        round.call(1);
        res = round.call(2);
        expect(res.status).toEqual('round-done');
        expect(res.pot).toEqual(120);
        expect(player1.amount).toEqual(60);
        expect(player2.amount).toEqual(60);
        expect(player3.amount).toEqual(60);
    });

    it("3 players, raise, fold, fold", function () {
        var player1 = poker.newPlayer('player1', 100);
        var player2 = poker.newPlayer('player2', 100);
        var player3 = poker.newPlayer('player2', 100);
        var players = [player1, player2, player3];

        var round = poker.newBettingRound(10, players, 0);
        expect(round.start().next).toEqual(0);
        expect(player1.amount).toEqual(100);
        expect(player2.amount).toEqual(90);
        expect(player3.amount).toEqual(80);

        var res = round.raise(0, 40);
        expect(res.status).toEqual('betting');
        expect(player1.amount).toEqual(60);
        round.fold(1);
        res = round.fold(1);
        expect(res.status).toEqual('winner-found');
        expect(res.players.length).toEqual(1);
        expect(res.players[0].name).toEqual('player1');

        expect(res.pot).toEqual(70);
        expect(player1.amount).toEqual(60);
        expect(player2.amount).toEqual(90);
        expect(player3.amount).toEqual(80);
    });

});

describe("Game round test suite", function () {
    it("2 players, one game round", function () {
        var player1 = poker.newPlayer('player1', 100);
        var player2 = poker.newPlayer('player2', 100);
        var players = [player1, player2];

        var gameRound = poker.newGameRound()
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
        var players = [poker.newPlayer('player1', 100),
                        poker.newPlayer('player2', 100)];

        var gameRound = poker.newGameRound()
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

        expect(gameRound.move({name: 'player2', action: 'check'}))
            .toEqual({ currentRound: 'flop', status: 'betting', next: 'player1' });
        expect(gameRound.move({name: 'player1', action: 'check'}))
            .toEqual({ currentRound: 'flop', status: 'round-done', pot: 40 });

        gameRound.turn();
        expect(gameRound.move({name: 'player2', action: 'raise', amount: 20}))
            .toEqual({ currentRound: 'turn', status: 'betting', next: 'player1' });
        expect(gameRound.move({name: 'player1', action: 'call'}))
            .toEqual({ currentRound: 'turn', status: 'round-done', pot: 80 });

        gameRound.river();
        expect(gameRound.move({name: 'player2', action: 'raise', amount: 20}))
            .toEqual({ currentRound: 'river', status: 'betting', next: 'player1' });
        expect(gameRound.move({name: 'player1', action: 'call'}))
            .toEqual({ currentRound: 'river', status: 'round-done', pot: 120 });
    });

});


describe("Game suite", function () {
    it("2 players game", function () {
        var players = [poker.newPlayer('player1', 100),
            poker.newPlayer('player2', 100)];

        var game = poker.newGame()
                    .withPlayers(players)
                    .withSmallBlind(10)
                    .withHandEvaluator(function(cards, players){
                                            return players[0];
                                        });

        console.log(game.start());
        console.log(game.move({name :'player2', action:'call'}));
        console.log(game.move({name :'player1', action:'check'}));
        console.log(game.move({name :'player2', action:'check'}));
        console.log(game.move({name :'player1', action:'check'}));
        console.log(game.move({name :'player2', action:'check'}));
        console.log(game.move({name :'player1', action:'check'}));
        console.log(game.move({name :'player2', action:'check'}));
        console.log(game.move({name :'player1', action:'check'}));

        console.log(game.start());
        console.log(game.move({name :'player1', action:'call'}));
        console.log(game.move({name :'player2', action:'check'}));
        console.log(game.move({name :'player1', action:'check'}));
        console.log(game.move({name :'player2', action:'check'}));
        console.log(game.move({name :'player1', action:'raise', amount: 20}));
        console.log(game.move({name :'player2', action:'call'}));
        console.log(game.move({name :'player1', action:'check'}));
        console.log(game.move({name :'player2', action:'check'}));

    });

});