import { useMemo, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBingoGame } from '../hooks/useBingoGame';
import { useStoredState } from '../hooks/useStoredState';
import { useDrawSound } from '../hooks/useDrawSound';
import {
  allNumbers,
  contrastColor,
  defaultPreferences,
  isPreferences,
} from '../lib/bingoStorage';

export default function BingoBoard() {
  const game = useBingoGame();
  const calledSet = useMemo(() => new Set(game.called), [game.called]);
  const preferences = useStoredState(
    'bingo-preferences',
    defaultPreferences,
    isPreferences,
  );
  const { primaryColor, soundEnabled } = preferences.value;
  const unlockAudio = useDrawSound(game.current, soundEnabled);
  const ready = game.ready && preferences.ready;
  const finished = game.remaining.length === 0;
  const contrast = contrastColor(primaryColor);
  const theme = {
    '--bingo-primary': primaryColor,
    '--bingo-contrast': contrast,
    '--bingo-text': contrast === '#ffffff' ? primaryColor : '#111827',
    backgroundColor: `${primaryColor}12`,
  } as CSSProperties;

  return (
    <div
      style={theme}
      className="bingo-board flex min-h-screen flex-col items-center px-3 py-8 sm:p-8"
    >
      <h1 className="bingo-text mb-6 text-4xl font-bold">🎉 Bingo 🎉</h1>

      {(game.storageError || preferences.storageError) && (
        <p
          role="alert"
          className="mb-4 max-w-md rounded bg-amber-100 p-3 text-amber-950"
        >
          No se pudo guardar en este navegador. Puedes seguir jugando, pero los
          cambios podrían perderse al cerrar.
        </p>
      )}

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
        className="bingo-primary mb-6 flex h-32 w-32 items-center justify-center rounded-full text-4xl font-extrabold shadow-lg"
      >
        {game.current ?? '🎲'}
      </motion.div>

      <div className="mb-4 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => {
            unlockAudio();
            game.drawNumber();
          }}
          disabled={!ready || finished || game.isAutoDraw}
          className="bingo-primary cursor-pointer rounded-xl px-6 py-2 text-lg hover:brightness-90 disabled:opacity-50"
        >
          {game.remaining.length === 0 ? '¡Fin del juego!' : 'Sacar número'}
        </button>

        <button
          onClick={() => {
            unlockAudio();
            game.toggleAutoDraw();
          }}
          disabled={!ready || finished}
          className={`cursor-pointer rounded-xl px-6 py-2 text-lg ${game.isAutoDraw ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white`}
        >
          {game.isAutoDraw ? 'Detener' : 'Auto'}
        </button>

        <button
          onClick={game.resetGame}
          disabled={!ready}
          className="cursor-pointer rounded-xl bg-yellow-500 px-6 py-2 text-lg text-black hover:bg-yellow-600"
        >
          Reiniciar
        </button>
      </div>

      <div className="mb-6">
        <label
          htmlFor="interval-seconds"
          className="bingo-text mr-2 font-medium"
        >
          Intervalo (segundos):
        </label>
        <input
          id="interval-seconds"
          type="number"
          value={game.intervalSeconds}
          onChange={(e) => game.setIntervalSeconds(Number(e.target.value))}
          className="w-24 rounded border border-gray-300 px-3 py-1 text-center"
          min={1}
          step={1}
          disabled={!ready}
        />
      </div>

      <fieldset
        disabled={!ready}
        className="mb-6 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-gray-300 bg-white p-4 text-gray-900"
      >
        <legend className="px-2 text-sm font-semibold">Personalización</legend>
        <label htmlFor="primary-color">Color principal</label>
        <input
          id="primary-color"
          type="color"
          value={primaryColor}
          onChange={(event) =>
            preferences.setValue((prev) => ({
              ...prev,
              primaryColor: event.target.value,
            }))
          }
          className="h-9 w-12 cursor-pointer rounded border border-gray-300"
        />
        <div className="flex items-center gap-2">
          <input
            id="draw-sound"
            type="checkbox"
            checked={soundEnabled}
            onChange={(event) =>
              preferences.setValue((prev) => ({
                ...prev,
                soundEnabled: event.target.checked,
              }))
            }
          />
          <label htmlFor="draw-sound">Sonido al sortear</label>
        </div>
      </fieldset>

      <p className="mb-3 font-medium text-gray-800">
        {game.called.length} de 90 números sorteados
      </p>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="max-w-md text-center"
      >
        {finished && (
          <div className="mb-4 rounded-xl border-2 border-yellow-400 bg-yellow-50 p-5 text-gray-900">
            <h2 className="mb-2 text-2xl font-bold">🎉 ¡Partida finalizada!</h2>
            <p>Se sortearon los 90 números</p>
            <p className="mt-1 text-sm">
              Revisa el tablero y presiona Reiniciar para comenzar otra partida.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 grid w-full max-w-lg grid-cols-10 gap-1 sm:gap-2">
        {allNumbers.map((num) => (
          <div
            key={num}
            className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-300 sm:text-sm ${
              num === game.current
                ? 'scale-110 bg-yellow-400 text-black shadow'
                : calledSet.has(num)
                  ? 'bingo-primary'
                  : 'bg-white text-gray-800'
            }`}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
