export type Suit = '♠' | '♥' | '♣' | '♦';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface HandResult {
  hasBull: boolean;
  bullValue: number; // 0 for No Bull, 1-9 for Bull 1-9, 10 for Bull Bull
  highlightIndices: number[]; // Indices of the 3 cards that sum to multiple of 10
  highestCardRank: number;
}

export function createDeck(): Card[] {
  const suits: Suit[] = ['♠', '♥', '♣', '♦'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (let rank = 1; rank <= 10; rank++) {
      deck.push({ suit, rank: rank as Rank });
    }
  }
  return deck;
}

export function shuffle(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function evaluateHand(hand: Card[]): HandResult {
  let highestCardRank = Math.max(...hand.map(c => c.rank));
  let bestResult: HandResult = {
    hasBull: false,
    bullValue: 0,
    highlightIndices: [],
    highestCardRank
  };

  for (let i = 0; i < hand.length - 2; i++) {
    for (let j = i + 1; j < hand.length - 1; j++) {
      for (let k = j + 1; k < hand.length; k++) {
        const sum3 = hand[i].rank + hand[j].rank + hand[k].rank;
        if (sum3 % 10 === 0) {
          const remaining = hand.filter((_, index) => index !== i && index !== j && index !== k);
          const sum2 = remaining[0].rank + remaining[1].rank;
          let bullValue = sum2 % 10;
          if (bullValue === 0) bullValue = 10; // Bull Bull
          
          if (bullValue > bestResult.bullValue) {
            bestResult = {
              hasBull: true,
              bullValue,
              highlightIndices: [i, j, k],
              highestCardRank
            };
          }
        }
      }
    }
  }
  
  return bestResult;
}

export function compareResults(a: HandResult, b: HandResult): number {
  if (a.bullValue !== b.bullValue) return a.bullValue - b.bullValue;
  return a.highestCardRank - b.highestCardRank;
}

export function getBullName(bullValue: number): string {
  if (bullValue === 0) return '没牛';
  if (bullValue === 10) return '牛牛';
  return `牛${bullValue}`;
}
