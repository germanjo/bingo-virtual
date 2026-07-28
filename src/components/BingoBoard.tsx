import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBingoGame } from '../hooks/useBingoGame';

const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

export default function BingoBoard() {
  const game = useBingoGame();
  const calledSet = useMemo(() => new Set(game.called), [game.called]);

  return (
    <div className="min-h-screen bg-pink-100 flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-6 text-rose-700">🎉 Bingo 🎉</h1>

      <AnimatePresence>
        {game.restartMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 px-6 py-3 bg-yellow-200 text-yellow-800 font-semibold rounded shadow"
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
        className="bg-white rounded-full w-32 h-32 flex items-center justify-center shadow-lg mb-6 text-4xl font-extrabold text-rose-600"
      >
        {game.current ?? '🎲'}
      </motion.div>

      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <button
          onClick={game.drawNumber}
          disabled={game.remaining.length === 0 || game.isAutoDraw}
          className="cursor-pointer bg-rose-600 text-white py-2 px-6 rounded-xl text-lg hover:bg-rose-700 disabled:opacity-50"
        >
          {game.remaining.length === 0 ? '¡Fin del juego!' : 'Sacar número'}
        </button>

        <button
          onClick={game.toggleAutoDraw}
          disabled={game.remaining.length === 0}
          className={`cursor-pointer py-2 px-6 rounded-xl text-lg ${game.isAutoDraw ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white`}
        >
          {game.isAutoDraw ? 'Detener' : 'Auto'}
        </button>

        <button
          onClick={game.resetGame}
          className="cursor-pointer py-2 px-6 rounded-xl text-lg bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          Reiniciar
        </button>
      </div>

      <div className="mb-6">
        <label className="mr-2 text-rose-700 font-medium">Intervalo (segundos):</label>
        <input
          type="number"
          value={game.intervalSeconds}
          onChange={(e) => game.setIntervalSeconds(Number(e.target.value))}
          className="px-3 py-1 rounded border border-gray-300 text-center w-24"
          min={1}
          step={1}
        />
      </div>

      <div className="mt-4 grid grid-cols-10 gap-2">
        {allNumbers.map((num) => (
          <div
            key={num}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center 
              text-xs sm:text-sm font-semibold border transition-all duration-300
              ${num === game.current ? 'bg-yellow-400 text-black scale-110 shadow' :
                calledSet.has(num)
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-600'}`}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
