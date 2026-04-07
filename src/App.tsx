import { useGameStore } from './store/useGameStore';
import { Card, Zone } from './types/game';
import { Zap, Shield, Swords, User } from 'lucide-react';

const POSITION_COLORS: Record<string, string> = {
  Defender: 'border-blue-500 bg-blue-900/40',
  Midfielder: 'border-green-500 bg-green-900/40',
  Striker: 'border-red-500 bg-red-900/40',
  Any: 'border-yellow-500 bg-yellow-900/40',
};

const POSITION_TEXT: Record<string, string> = {
  Defender: 'text-blue-400',
  Midfielder: 'text-green-400',
  Striker: 'text-red-400',
  Any: 'text-yellow-400',
};

const ZONE_ICONS: Record<string, React.ReactNode> = {
  ZoneDefense: <Shield size={14} className="inline mr-1" />,
  ZoneMidfield: <User size={14} className="inline mr-1" />,
  ZoneAttack: <Swords size={14} className="inline mr-1" />,
};

function CardChip({ card, enemy = false }: { card: Card; enemy?: boolean }) {
  const border = POSITION_COLORS[card.position] ?? 'border-gray-500 bg-gray-800';
  const posText = POSITION_TEXT[card.position] ?? 'text-gray-400';
  return (
    <div
      className={`border ${border} rounded-lg p-2 text-xs flex flex-col gap-0.5 ${
        enemy ? 'opacity-90' : ''
      }`}
    >
      <span className="font-bold text-white truncate">{card.name}</span>
      <span className={`${posText} text-[10px]`}>{card.position}</span>
      <div className="flex justify-between text-gray-300 mt-1">
        <span>⚡{card.cost}</span>
        <span>⚽{card.power}</span>
      </div>
    </div>
  );
}

function HandCard({
  card,
  onPlay,
  disabled,
}: {
  card: Card;
  onPlay: () => void;
  disabled: boolean;
}) {
  const border = POSITION_COLORS[card.position] ?? 'border-gray-500 bg-gray-800';
  const posText = POSITION_TEXT[card.position] ?? 'text-gray-400';
  return (
    <button
      onClick={onPlay}
      disabled={disabled}
      className={`border-2 ${border} rounded-xl p-3 text-left flex flex-col gap-1 min-w-[90px] max-w-[110px] shrink-0 transition-all duration-150 ${
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:scale-105 hover:brightness-125 cursor-pointer'
      }`}
    >
      <span className="font-bold text-white text-xs leading-tight">{card.name}</span>
      <span className={`${posText} text-[10px]`}>{card.position}</span>
      <div className="flex justify-between text-gray-300 text-xs mt-1">
        <span>⚡{card.cost}</span>
        <span>⚽{card.power}</span>
      </div>
    </button>
  );
}

function ZoneColumn({ zone, zoneId }: { zone: Zone; zoneId: string }) {
  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Enemy cards (top half) */}
      <div className="flex-1 p-2 flex flex-col gap-1 justify-end">
        {zone.enemyCards.length === 0 ? (
          <div className="text-gray-600 text-xs text-center italic">— empty —</div>
        ) : (
          zone.enemyCards.map((c) => <CardChip key={c.id} card={c} enemy />)
        )}
      </div>

      {/* Zone label */}
      <div className="py-2 px-1 text-center text-xs font-semibold tracking-wider uppercase border-y border-gray-600 bg-gray-700/60 text-gray-300">
        {ZONE_ICONS[zoneId]}
        {zone.name}
      </div>

      {/* Player cards (bottom half) */}
      <div className="flex-1 p-2 flex flex-col gap-1">
        {zone.playerCards.length === 0 ? (
          <div className="text-gray-600 text-xs text-center italic mt-2">— empty —</div>
        ) : (
          zone.playerCards.map((c) => <CardChip key={c.id} card={c} />)
        )}
      </div>
    </div>
  );
}

export default function App() {
  const turn = useGameStore((s) => s.turn);
  const maxTurns = useGameStore((s) => s.maxTurns);
  const currentEnergy = useGameStore((s) => s.currentEnergy);
  const maxEnergy = useGameStore((s) => s.maxEnergy);
  const playerHand = useGameStore((s) => s.playerHand);
  const enemyHand = useGameStore((s) => s.enemyHand);
  const zones = useGameStore((s) => s.zones);
  const playCard = useGameStore((s) => s.playCard);
  const endTurn = useGameStore((s) => s.endTurn);

  const zoneEntries: [string, Zone][] = [
    ['ZoneDefense', zones.ZoneDefense],
    ['ZoneMidfield', zones.ZoneMidfield],
    ['ZoneAttack', zones.ZoneAttack],
  ];

  const handlePlayCard = (cardId: string) => {
    const card = playerHand.find((c) => c.id === cardId);
    if (!card) return;
    const zoneMap: Record<string, string> = {
      Defender: 'ZoneDefense',
      Midfielder: 'ZoneMidfield',
      Striker: 'ZoneAttack',
      Any: 'ZoneMidfield',
    };
    playCard(cardId, zoneMap[card.position] ?? 'ZoneMidfield');
  };

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border-b border-gray-700 shrink-0">
        <div className="text-sm font-bold text-yellow-400 tracking-wide">
          Turn {turn} / {maxTurns}
        </div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Slay the Manager
        </div>
        <div className="text-xs text-red-400 font-semibold">
          Enemy: {enemyHand.length} cards
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 grid grid-cols-3 gap-2 p-2 min-h-0">
        {zoneEntries.map(([zoneId, zone]) => (
          <ZoneColumn key={zoneId} zone={zone} zoneId={zoneId} />
        ))}
      </div>

      {/* HUD */}
      <div className="shrink-0 bg-gray-950 border-t border-gray-700 px-3 py-2 flex flex-col gap-2">
        {/* Energy bar */}
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <div className="flex gap-1">
            {Array.from({ length: maxEnergy }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full border-2 ${
                  i < currentEnergy
                    ? 'bg-yellow-400 border-yellow-300'
                    : 'bg-gray-700 border-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-1">
            {currentEnergy}/{maxEnergy}
          </span>
        </div>

        {/* Hand + End Turn button */}
        <div className="flex items-stretch gap-2">
          <div className="flex-1 flex gap-2 overflow-x-auto pb-1">
            {playerHand.length === 0 ? (
              <span className="text-gray-500 text-xs italic self-center">No cards in hand</span>
            ) : (
              playerHand.map((card) => (
                <HandCard
                  key={card.id}
                  card={card}
                  onPlay={() => handlePlayCard(card.id)}
                  disabled={currentEnergy < card.cost}
                />
              ))
            )}
          </div>

          <button
            onClick={endTurn}
            disabled={turn >= maxTurns}
            className="shrink-0 px-4 py-3 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl text-sm font-bold tracking-wide transition-colors whitespace-pre-line"
          >
            {turn >= maxTurns ? 'Game\nOver' : 'End\nTurn'}
          </button>
        </div>
      </div>
    </div>
  );
}
