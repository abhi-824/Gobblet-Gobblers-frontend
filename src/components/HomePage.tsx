import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Title } from "./Title";
import { useCreateGame, useStartGame } from "../api/hooks";

type Difficulty = "easy" | "medium" | "hard";
type GridSize = "3x3" | "4x4" | "5x5";
type GameMode = "pvp" | "pvc";

export function HomePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gridSize, setGridSize] = useState<GridSize>("3x3");
  const [gameMode, setGameMode] = useState<GameMode>("pvc");
  const [timer, setTimer] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(()=>{
    console.log(gameMode, difficulty, gridSize)
  },[gameMode, difficulty, gridSize])
  const navigate = useNavigate();

  const createGame = useCreateGame();
  const startGame = useStartGame();

  const handleStartGame = async () => {
    console.log("Starting game with:", { gameMode, difficulty, gridSize, timer });
    setIsCreating(true);
    try {
      const gameData = await createGame.mutateAsync({
        mode: gameMode,
        difficulty: difficulty,
      });
      
      await startGame.mutateAsync(gameData.gameId);
      navigate(`/game/${gameData.gameId}`);
    } catch (error) {
      console.error("Failed to create game:", error);
      setIsCreating(false);
    }
  };

  const difficultyOptions = [
    { value: "easy", label: "Easy", description: "Perfect for beginners", emoji: "🌱", disabled: false },
    { value: "medium", label: "Medium", description: "Balanced challenge", emoji: "⚡", disabled: true },
    { value: "hard", label: "Hard", description: "AI mastermind", emoji: "🧠", disabled: false },
  ];

  const gridSizeOptions = [
    { value: "3x3", label: "3×3", description: "Classic Gobblet", emoji: "🎯" },
    { value: "4x4", label: "4×4", description: "Coming Soon", emoji: "🚧" },
    { value: "5x5", label: "5×5", description: "Coming Soon", emoji: "🚧" },
  ];

  const gameModeOptions = [
    { value: "pvc", label: "vs AI", description: "Challenge the computer", emoji: "🤖", disabled: false },
    { value: "pvp", label: "vs Player", description: "Play with a friend", emoji: "👥", disabled: true },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0D013D] via-[#1a0b4a] to-[#2d1b69] text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-48 h-48 bg-blue-500/20 rounded-full blur-xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-500/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Title />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl text-purple-200 mt-4 max-w-2xl"
          >
            Choose your cosmic battle settings and prepare for an epic showdown!
          </motion.p>
        </motion.div>

        {/* Game Options */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full max-w-4xl space-y-8"
        >
          {/* Game Mode Selection */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-center mb-6">Game Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameModeOptions.map((option) => {
                const isDisabled = option.disabled;
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => {
                      if (!isDisabled) {
                        console.log("Setting game mode to:", option.value);
                        setGameMode(option.value as GameMode);
                      }
                    }}
                    disabled={isDisabled}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 relative ${
                      gameMode === option.value && !isDisabled
                        ? "border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/25"
                        : isDisabled
                        ? "border-gray-500/30 bg-gray-500/5 cursor-not-allowed opacity-50"
                        : "border-purple-200/30 bg-purple-500/5 hover:border-purple-300/50 hover:bg-purple-500/10"
                    }`}
                    style={{
                      borderColor: gameMode === option.value && !isDisabled ? '#a855f7' : undefined,
                      backgroundColor: gameMode === option.value && !isDisabled ? 'rgba(168, 85, 247, 0.2)' : undefined,
                    }}
                    whileHover={!isDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    title={isDisabled ? "Coming Soon!" : ""}
                  >
                    <div className="text-4xl mb-2">{option.emoji}</div>
                    <div className="text-xl font-semibold mb-1">{option.label}</div>
                    <div className="text-purple-200 text-sm">{option.description}</div>
                    {isDisabled && (
                      <div className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                        Soon
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-center mb-6">Difficulty</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficultyOptions.map((option) => {
                const isDisabled = option.disabled;
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => {
                      if (!isDisabled) {
                        console.log("Setting difficulty to:", option.value);
                        setDifficulty(option.value as Difficulty);
                      }
                    }}
                    disabled={isDisabled}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 relative ${
                      difficulty === option.value && !isDisabled
                        ? "border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/25"
                        : isDisabled
                        ? "border-gray-500/30 bg-gray-500/5 cursor-not-allowed opacity-50"
                        : "border-purple-200/30 bg-purple-500/5 hover:border-purple-300/50 hover:bg-purple-500/10"
                    }`}
                    style={{
                      borderColor: difficulty === option.value && !isDisabled ? '#a855f7' : undefined,
                      backgroundColor: difficulty === option.value && !isDisabled ? 'rgba(168, 85, 247, 0.2)' : undefined,
                    }}
                    whileHover={!isDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    title={isDisabled ? "Coming Soon!" : ""}
                  >
                    <div className="text-4xl mb-2">{option.emoji}</div>
                    <div className="text-xl font-semibold mb-1">{option.label}</div>
                    <div className="text-purple-200 text-sm">{option.description}</div>
                    {isDisabled && (
                      <div className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                        Soon
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Grid Size Selection */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-center mb-6">Board Size</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gridSizeOptions.map((option) => {
                const isDisabled = option.value !== "3x3";
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => !isDisabled && setGridSize(option.value as GridSize)}
                    disabled={isDisabled}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 relative ${
                      gridSize === option.value && !isDisabled
                        ? "border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/25"
                        : isDisabled
                        ? "border-gray-500/30 bg-gray-500/5 cursor-not-allowed opacity-50"
                        : "border-purple-200/30 bg-purple-500/5 hover:border-purple-300/50 hover:bg-purple-500/10"
                    }`}
                    style={{
                      borderColor: gridSize === option.value && !isDisabled ? '#a855f7' : undefined,
                      backgroundColor: gridSize === option.value && !isDisabled ? 'rgba(168, 85, 247, 0.2)' : undefined,
                    }}
                    whileHover={!isDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    title={isDisabled ? "Coming Soon!" : ""}
                  >
                    <div className="text-4xl mb-2">{option.emoji}</div>
                    <div className="text-xl font-semibold mb-1">{option.label}</div>
                    <div className="text-purple-200 text-sm">{option.description}</div>
                    {isDisabled && (
                      <div className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                        Soon
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Timer Option */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-center mb-6">Timer</h3>
            <div className="flex justify-center">
              <motion.button
                onClick={() => setTimer(!timer)}
                disabled={true}
                className="p-6 rounded-2xl border-2 border-gray-500/30 bg-gray-500/5 cursor-not-allowed opacity-50 relative"
                title="Coming Soon!"
              >
                <div className="text-4xl mb-2">⏱️</div>
                <div className="text-xl font-semibold mb-1">Timer</div>
                <div className="text-purple-200 text-sm">Coming Soon!</div>
                <div className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                  Soon
                </div>
              </motion.button>
            </div>
          </div>

          {/* Start Game Button */}
          <motion.div
            className="flex justify-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.button
              onClick={handleStartGame}
              disabled={isCreating}
              className={`px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 ${
                isCreating
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-2xl hover:shadow-purple-500/25"
              }`}
              whileHover={!isCreating ? { scale: 1.05 } : {}}
              whileTap={!isCreating ? { scale: 0.95 } : {}}
            >
              {isCreating ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Game...
                </div>
              ) : (
                "🚀 Start Cosmic Battle"
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
