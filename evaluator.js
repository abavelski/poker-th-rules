// source: http://www.codeproject.com/Articles/569271/A-Poker-hand-analyzer-in-JavaScript-using-bit-math
var getCombinations = function (k,n) {
    var result = [], comb = [];
    function next_comb(comb, k, n ,i) {
        if (comb.length === 0) {for (i = 0; i < k; ++i) {comb[i] = i;} return true;}
        i = k - 1; ++comb[i];
        while ((i > 0) && (comb[i] >= n - k + 1 + i)) { --i; ++comb[i];}
        if (comb[0] > n - k) {return false;} // No more combinations can be generated
        for (i = i + 1; i < k; ++i) {comb[i] = comb[i-1] + 1;}
        return true;
    }
    while (next_comb(comb, k, n)) { result.push(comb.slice());}
    return result;
};

var allCombinations = getCombinations(5,7);

var get5cardScore = function(cs,ss){ //calculates the equivalence score of 5 cards
    var v, i, o, c, d={}, s = 1<<cs[0]|1<<cs[1]|1<<cs[2]|1<<cs[3]|1<<cs[4];
    for (i=v=o=0; i<5; i++) {o=Math.pow(2,cs[i]*4); v += o*(d[cs[i]] = (v/o&15)+1);}
    v = v%15-((s/(s&-s)==31)||(s==0x403c)?3:1)-(ss[0]==(ss[1]|ss[2]|ss[3]|ss[4]))*((s==0x7c00)?-5:1);
    c = (s==0x403c)?[5,4,3,2,1]:cs.slice().sort(function(a,b){return (d[a]<d[b])?1:(d[a]>d[b])?-1:(b-a);});
    return [7,8,4,5,0,1,2,9,3,6][v]<<20|c[0]<<16|c[1]<<12|c[2]<<8|c[3]<<4|c[4];
};

var getTypeDetail = function(x){
    var names = [0,0,2,3,4,5,6,7,8,9,10,"Jack","Queen","King","Ace"];
    var cat = x>>20, c1 = x>>16&15, c3 = x>>8&15, c4 = x>>4&15;

    switch(cat){
        case 0: return names[c1] + " high";
        case 1: return "Pair of "+names[c1]+"s";
        case 2: return "Two pair, "+names[c1]+"s and "+names[c3]+"s";
        case 3: return "Three of a kind, "+names[c1]+"s";
        case 4: return names[c1] +" high straight";
        case 5: return names[c1] +" high flush";
        case 6: return names[c1] + "s full of "+names[c4]+"s";
        case 7: return "Four of a kind, "+names[c1]+"s";
        case 8: return names[c1]+" high straight flush";
        case 9: return "Royal flush";
    }
};

var splitCards = function(cards) {
    var ranks = {'A': 14, 'K' :13, 'Q':12, 'J':11, 'T':10},
    suits = { 's':1, 'c':2, 'h':4, 'd':8 };

    var handRanks = [];
    var handSuits = [];

    for (var i = 0; i < cards.length; i += 1) {
        var rank = cards[i].substr(0, 1);
        handRanks[i] = isNaN(rank)?ranks[rank]:parseInt(rank);
        handSuits[i] = suits[cards[i].substr(1, 1)];
    }
    return[handRanks, handSuits];
};

var rank7cards = function(cards) {
    var max = 0;
    var rank, win;
    for (var i = 0; i < allCombinations.length; i++) {
        var c = allCombinations[i];
        var hand = [cards[c[0]], cards[c[1]], cards[c[2]], cards[c[3]], cards[c[4]]];
        var cc = splitCards(hand);
        var score = get5cardScore(cc[0],cc[1]);
        if (max<score) {
            max = score;
            rank = getTypeDetail(score);
            win = hand;
        }
    }
    return {
        score : max,
        text : rank,
        hand : win
    }
};

module.exports=rank7cards;

