import { create } from 'zustand';
import { Card, GameState, Zone } from '../types/game';

const makeCard = (
  id: string,
  name: string,
  cost: number,
  power: number,
  position: Card['position']
): Card => ({ id, name, cost, power, position });

const STARTER_DECK: Card[] = [
  // Defenders
  makeCard('d1', 'Rock Defender', 1, 2, 'Defender'),
  makeCard('d2', 'Wall Backer', 1, 1, 'Defender'),
  makeCard('d3', 'Iron Stopper', 2, 3, 'Defender'),
  makeCard('d4', 'Sweeper', 1, 2, 'Defender'),
  // Midfielders
  makeCard('m1', 'Box-to-Box', 1, 2, 'Midfielder'),
  makeCard('m2', 'Playmaker', 2, 3, 'Midfielder'),
  makeCard('m3', 'Engine Room', 1, 1, 'Midfielder'),
  makeCard('m4', 'Press Machine', 2, 2, 'Midfielder'),
  // Strikers
  makeCard('s1', 'Poacher', 1, 2, 'Striker'),
  makeCard('s2', 'Target Man', 2, 3, 'Striker'),
  makeCard('s3', 'Speed Merchant', 1, 1, 'Striker'),
  makeCard('s4', 'Clinical Finisher', 2, 3, 'Striker'),
];

const ENEMY_DECK: Card[] = [
  makeCard('e1', 'Rival Keeper', 1, 2, 'Defender'),
  makeCard('e2', 'Brutal Tackler', 1, 1, 'Defender'),
  makeCard('e3', 'Counter Rusher', 2, 3, 'Midfielder'),
  makeCard('e4', 'Dirty Winger', 1, 2, 'Midfielder'),
  makeCard('e5', 'Loan Striker', 2, 3, 'Striker'),
  makeCard('e6', 'Offside Trapper', 1, 1, 'Striker'),
];

const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const makeZone = (id: string, name: string, requiredPosition: string): Zone => ({
  id,
  name,
  requiredPosition,
  playerCards: [],
  enemyCards: [],
});

const ZONE_IDS = ['ZoneDefense', 'ZoneMidfield', 'ZoneAttack'] as const;

const initialState = () => {
  const deck = shuffle(STARTER_DECK);
  const enemyDeck = shuffle(ENEMY_DECK);
  return {
    turn: 1,
    maxTurns: 6,
    maxEnergy: 3,
    currentEnergy: 3,
    playerDeck: deck.slice(4),
    playerHand: deck.slice(0, 4),
    enemyDeck: enemyDeck.slice(3),
    enemyHand: enemyDeck.slice(0, 3),
    zones: {
      ZoneDefense: makeZone('ZoneDefense', 'Defense', 'Defender'),
      ZoneMidfield: makeZone('ZoneMidfield', 'Midfield', 'Midfielder'),
      ZoneAttack: makeZone('ZoneAttack', 'Attack', 'Striker'),
    },
  };
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState(),

  drawCard: () => {
    const { playerDeck, playerHand } = get();
    if (playerDeck.length === 0) return;
    const [drawn, ...rest] = playerDeck;
    set({ playerHand: [...playerHand, drawn], playerDeck: rest });
  },

  playCard: (cardId, zoneId) => {
    const { playerHand, zones, currentEnergy } = get();
    const card = playerHand.find((c) => c.id === cardId);
    if (!card) return;
    if (currentEnergy < card.cost) return;

    const zone = zones[zoneId as keyof typeof zones];
    if (!zone) return;

    set({
      playerHand: playerHand.filter((c) => c.id !== cardId),
      currentEnergy: currentEnergy - card.cost,
      zones: {
        ...zones,
        [zoneId]: { ...zone, playerCards: [...zone.playerCards, card] },
      },
    });
  },

  endTurn: () => {
    const { turn, maxTurns, zones, enemyHand, enemyDeck, maxEnergy } = get();
    if (turn >= maxTurns) return;

    // AI: play a random enemy card into a random zone
    let newEnemyHand = [...enemyHand];
    let newEnemyDeck = [...enemyDeck];
    let newZones = { ...zones };

    if (newEnemyHand.length > 0) {
      const idx = Math.floor(Math.random() * newEnemyHand.length);
      const card = newEnemyHand[idx];
      newEnemyHand = newEnemyHand.filter((_, i) => i !== idx);

      const zoneId = ZONE_IDS[Math.floor(Math.random() * ZONE_IDS.length)];
      const targetZone = newZones[zoneId];
      newZones = {
        ...newZones,
        [zoneId]: { ...targetZone, enemyCards: [...targetZone.enemyCards, card] },
      };
    }

    // Draw an enemy card for next turn
    if (newEnemyDeck.length > 0) {
      newEnemyHand = [...newEnemyHand, newEnemyDeck[0]];
      newEnemyDeck = newEnemyDeck.slice(1);
    }

    // Draw a player card and reset energy
    const { playerDeck, playerHand } = get();
    const newPlayerHand = [...playerHand];
    const newPlayerDeck = [...playerDeck];
    if (newPlayerDeck.length > 0) {
      newPlayerHand.push(newPlayerDeck.shift()!);
    }

    const newMaxEnergy = Math.min(maxEnergy + 1, 8);

    set({
      turn: turn + 1,
      maxEnergy: newMaxEnergy,
      currentEnergy: newMaxEnergy,
      playerHand: newPlayerHand,
      playerDeck: newPlayerDeck,
      enemyHand: newEnemyHand,
      enemyDeck: newEnemyDeck,
      zones: newZones,
    });
  },
}));
