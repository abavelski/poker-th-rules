var poker = require("./poker");



describe("Deck test suite", function() {
    var deck;
    beforeEach(function () {
        deck = poker.newDeck();
    });

    it("player gets 2 cards", function() {
        var player = poker.newPlayer('player1', 100);
        deck.deal([player]);
        expect(player.hand.length).toEqual(2);
    });

    it("flop deals 3 cards", function () {
        var game = poker.newGame();
        deck.flop(game);
        expect(game.communityCards.length).toEqual(3);
        expect(game.communityCards[0]).toEqual(1);
        expect(game.communityCards[2]).toEqual(3);
    });
});


describe("Game betting suite", function () {

    it("2 players bet", function () {
        var player1 = poker.newPlayer('player1', 100);
        var player2 = poker.newPlayer('player2', 100);
        var players = [player1, player2];
        var game = poker.newGame(10, players);

        expect(game.start().next).toEqual(1);
        expect(game.getDealer()).toEqual(0);
        expect(player1.amount).toEqual(80);
        expect(player2.amount).toEqual(90);

        expect(game.call(0)).toEqual('wrong player');
        expect(game.check(1)).toEqual('call or fold');

        var res1 = game.call(1);
        expect(res1.next).toEqual(0);
        expect(res1.status).toEqual('betting');
        expect(player2.amount).toEqual(80);

        expect(game.check(1)).toEqual('wrong player');
        var res2 = game.check(0);
        expect(res2.status).toEqual('done');
        expect(res2.next).toEqual(1);
    });



});