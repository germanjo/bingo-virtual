import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBingoGame } from '../hooks/useBingoGame';

const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

export default function BingoBoard() {
  const game = useBingoGame();
  const calledSet = useMemo(() => new Set(game.called), [game.called]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-pink-100 p-8">
      <h1 className="mb-6 text-4xl font-bold text-rose-700">🎉 Bingo 🎉</h1>

      <AnimatePresence>
        {game.restartMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 rounded bg-yellow-200 px-6 py-3 font-semibold text-yellow-800 shadow"
          >
            ¡Nuevo juego iniciado!
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={game.current}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-white text-4xl font-extrabold text-rose-600 shadow-lg"
      >
        {game.current ?? '🎲'}
      </motion.div>

      <div className="mb-4 flex flex-wrap justify-center gap-4">
        <button
          onClick={game.drawNumber}
          disabled={game.remaining.length === 0 || game.isAutoDraw}
          className="cursor-pointer rounded-xl bg-rose-600 px-6 py-2 text-lg text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {game.remaining.length === 0 ? '¡Fin del juego!' : 'Sacar número'}
        </button>

        <button
          onClick={game.toggleAutoDraw}
          disabled={game.remaining.length === 0}
          className={`cursor-pointer rounded-xl px-6 py-2 text-lg ${game.isAutoDraw ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white`}
        >
          {game.isAutoDraw ? 'Detener' : 'Auto'}
        </button>

        <button
          onClick={game.resetGame}
          className="cursor-pointer rounded-xl bg-yellow-500 px-6 py-2 text-lg text-black hover:bg-yellow-600"
        >
          Reiniciar
        </button>
      </div>

      <div className="mb-6">
        <label className="mr-2 font-medium text-rose-700">
          Intervalo (segundos):
        </label>
        <input
          type="number"
          value={game.intervalSeconds}
          onChange={(e) => game.setIntervalSeconds(Number(e.target.value))}
          className="w-24 rounded border border-gray-300 px-3 py-1 text-center"
          min={1}
          step={1}
        />
      </div>

      <div className="mt-4 grid grid-cols-10 gap-2">
        {allNumbers.map((num) => (
          <div
            key={num}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-300 sm:h-10 sm:w-10 sm:text-sm ${
              num === game.current
                ? 'scale-110 bg-yellow-400 text-black shadow'
                : calledSet.has(num)
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-600'
            }`}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
