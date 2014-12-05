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

        expect(round.call(0)).toEqual('wrong-player');
        expect(round.check(1)).toEqual('call or fold');

        var res1 = round.call(1);
        expect(res1.next).toEqual(0);
        expect(res1.status).toEqual('betting');
        expect(player2.amount).toEqual(80);

        expect(round.check(1)).toEqual('wrong-player');
        var res2 = round.check(0);
        expect(res2.status).toEqual('round-done');
        expect(res2.next).toEqual(1);
    });



});