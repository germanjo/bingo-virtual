import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

export default function BingoBoard() {
  const [remaining, setRemaining] = useState([...allNumbers]);
  const [called, setCalled] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [autoDraw, setAutoDraw] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState(3);
  const [showRestartMessage, setShowRestartMessage] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function drawNumber() {
    if (remaining.length === 0) return;
    const index = Math.floor(Math.random() * remaining.length);
    const number = remaining[index];
    setCurrent(number);
    setCalled((prev) => [...prev, number]);
    setRemaining((prev) => prev.filter((n) => n !== number));
  }

  function resetGame() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining([...allNumbers]);
    setCalled([]);
    setCurrent(null);
    setAutoDraw(false);
    setShowRestartMessage(true);
    setTimeout(() => setShowRestartMessage(false), 3000);
  }

  useEffect(() => {
    if (autoDraw && remaining.length > 0) {
      intervalRef.current = setInterval(drawNumber, intervalSeconds * 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoDraw, intervalSeconds, remaining]);

  return (
    <div className="min-h-screen bg-pink-100 flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-6 text-rose-700">🎉 Bingo 🎉</h1>

      <AnimatePresence>
        {showRestartMessage && (
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
        key={current}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white rounded-full w-32 h-32 flex items-center justify-center shadow-lg mb-6 text-4xl font-extrabold text-rose-600"
      >
        {current ?? "🎲"}
      </motion.div>

      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <button
          onClick={drawNumber}
          disabled={remaining.length === 0 || autoDraw}
          className="cursor-pointer bg-rose-600 text-white py-2 px-6 rounded-xl text-lg hover:bg-rose-700 disabled:opacity-50"
        >
          {remaining.length === 0 ? "¡Fin del juego!" : "Sacar número"}
        </button>

        <button
          onClick={() => setAutoDraw(!autoDraw)}
          disabled={remaining.length === 0}
          className={`cursor-pointer py-2 px-6 rounded-xl text-lg ${autoDraw ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"} text-white`}
        >
          {autoDraw ? "Detener" : "Auto"}
        </button>

        <button
          onClick={resetGame}
          className="cursor-pointer py-2 px-6 rounded-xl text-lg bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          Reiniciar
        </button>
      </div>

      <div className="mb-6">
        <label className="mr-2 text-rose-700 font-medium">Intervalo (segundos):</label>
        <input
          type="number"
          value={intervalSeconds}
          onChange={(e) => setIntervalSeconds(Number(e.target.value))}
          className="px-3 py-1 rounded border border-gray-300 text-center w-24"
          min={1}
          step={1}
        />
      </div>

      <div className="mt-4 grid grid-cols-10 gap-2">
        {allNumbers.map((num) => (
          <div
            key={num}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold border transition-all duration-300
              ${num === current ? "bg-yellow-400 text-black scale-110 shadow" :
                called.includes(num)
                  ? "bg-rose-600 text-white"
                  : "bg-white text-rose-600"}`}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
