export type Position = 'Defender' | 'Midfielder' | 'Striker' | 'Any';

export interface Card {
  id: string;
  name: string;
  cost: number;
  power: number;
  position: Position;
}

export interface Zone {
  id: string;
  name: string;
  requiredPosition: string;
  playerCards: Card[];
  enemyCards: Card[];
}

export interface GameState {
  turn: number;
  maxTurns: number;
  maxEnergy: number;
  currentEnergy: number;
  playerDeck: Card[];
  playerHand: Card[];
  enemyDeck: Card[];
  enemyHand: Card[];
  zones: {
    ZoneDefense: Zone;
    ZoneMidfield: Zone;
    ZoneAttack: Zone;
  };
  drawCard: () => void;
  playCard: (cardId: string, zoneId: string) => void;
  endTurn: () => void;
}
