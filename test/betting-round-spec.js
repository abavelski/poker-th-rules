var newBettingRound = require('../src/betting-round.js');


describe("BettingRound test suite", function () {
    var player1, player2, player3, player4;
    var newPlayer = function(name, amount) {
        return {
            name : name,
            amount : amount
        }
    }

    beforeEach(function() {
        player1 = newPlayer('player1', 100);
        player2 = newPlayer('player2', 100);
        player3 = newPlayer('player3', 100);
        player4 = newPlayer('player4', 300);
    });

    it("2 players bet", function () {
        var players = [player1, player2];
        
        var round = newBettingRound(10, players, 0);

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

    it("cannot raise more than amount", function () {
        var players = [player1, player2];        
        var round = newBettingRound(10, players, 0);
        round.start();
        expect(round.raise(1, 100)).toEqual({status: 'error', errorCode: 'not-enough-money'});        
    });    

    it("call on a bigger amount result in allIn", function () {
        var players = [player1, newPlayer('player2', 300)];        
        var round = newBettingRound(10, players, 0);
        round.start();
        round.raise(1,200);
        round.call(0);
        expect(player1.amount).toEqual(0);
        expect(player1.allIn).toBe(true);
    });

    it("raise on all money results in allIn", function () {
        var players = [player1, player4];        
        var round = newBettingRound(10, players, 0);
        round.start();
        round.raise(1,290);
        expect(player4.amount).toEqual(0);
        expect(player4.allIn).toBe(true);
    });

    it("betting-done when one of the players allIn and the other calls", function () {
        var players = [player1, player4];        
        var round = newBettingRound(10, players, 1);
        round.start();
        console.log(round.raise(0, 90));
        console.log(round.call(1));
        //expect(player4.amount).toEqual(0);
        //expect(player4.allIn).toBe(true);
    });



    it("3 players, raise, call, call", function () {
        var players = [player1, player2, player3];

        var round = newBettingRound(10, players, 0);
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
        var players = [player1, player2, player3];

        var round = newBettingRound(10, players, 0);
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