import { Title } from "./Title";
import { GamePiece } from "./GamePiece";
import type { GamePieceType, GamePieceSize } from "./GamePiece";
import {
  GameStartLoader,
  MoveLoader,
  OpponentMoveLoader,
  PieceAnimationLoader,
  PulsingGlow,
} from "./Loaders";
import {
  DndContext,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  useStartGame,
  useGameState,
  useMakeMove,
} from "../api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ResultDialog } from "./ResultDialog";
import { useParams, useNavigate } from "react-router-dom";
import { GuideOverlay } from "./GuideOverlay";

export function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [isGameStarting, setIsGameStarting] = useState(true);
  const [isMakingMove, setIsMakingMove] = useState(false);
  const [moveMessage, setMoveMessage] = useState("");
  const [animatingPiece, setAnimatingPiece] = useState<{
    pieceId: string;
    pieceType: "alien" | "robot";
    size: "lg" | "md" | "sm";
    position: { x: number; y: number };
  } | null>(null);
  const [showPlayAgainButton, setShowPlayAgainButton] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const queryClient = useQueryClient();

  const startGame = useStartGame();
  const { data: game } = useGameState(gameId ?? "", {
    refetchInterval: 2000, // auto-polling for computer moves
  });
  const makeMove = useMakeMove();
  const [isOpponentThinking, setIsOpponentThinking] = useState(false);
  const hasStartedGame = useRef(false);

  // Start the game when component mounts
  useEffect(() => {
    if (!gameId) {
      navigate("/");
      return;
    }

    // Only start if we haven't already started and game is not already in progress
    if (game?.status === "in_progress") {
      setIsGameStarting(false);
      return;
    }

    if (!hasStartedGame.current) {
      hasStartedGame.current = true;
      startGame.mutate(gameId, {
        onSuccess: () => {
          // Hide game start loader after a delay for better UX
          setTimeout(() => {
            setIsGameStarting(false);
            // Show guide if not skipped previously
            const skipped = localStorage.getItem("avr:guide:skip") === "1";
            if (!skipped) setShowGuide(true);
          }, 2000);
        },
        onError: () => {
          setIsGameStarting(false);
        }
      });
    }
  }, [gameId, navigate, game?.status]);

  // Watch backend status for win/lose/draw
  useEffect(() => {
    if (!game) return;
    if (game.status === "in_progress") return;

    if (game.status === "win") {
      // Check if human player won
      const humanPlayer = game.players.find(p => p.type === "human");
      if (game.winner && game.winner.id === humanPlayer?.id) {
        setResult("win");
      } else {
        setResult("lose");
      }
    }
    else if (game.status === "draw") setResult("draw");
    else setResult("lose");
  }, [game]);

  // Helper: draggable piece
  function DraggablePiece({
    id,
    type,
    size,
  }: {
    id: string;
    type: GamePieceType;
    size: GamePieceSize;
  }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id,
    });
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`cursor-grab ${
          isDragging ? "opacity-50" : "hover:scale-110 transition-transform"
        }`}
        style={{ touchAction: "none" }}
      >
        <GamePiece type={type} size={size} />
      </div>
    );
  }

  // Helper: droppable board cell
  function DroppableCell({
    row,
    col,
    children,
  }: {
    row: number;
    col: number;
    children?: React.ReactNode;
  }) {
    const id = `cell-${row}-${col}`;
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
      <div
        ref={setNodeRef}
        className={`flex border-2 border-white items-center justify-center rounded-[18px] transition-colors duration-150 ${
          isOver ? "ring-4 ring-yellow-300" : ""
        }`}
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </div>
    );
  }

  // Handle drag drop → backend move with optimistic updates
  function handleDragEnd(event: DragEndEvent) {
    if (!gameId || !game) return;
    const { over, active } = event;
    if (!over) return;
    if (!over.id.toString().startsWith("cell-")) return; // only allow dropping inside board

    const [, row, col] = over.id.toString().split("-").map(Number);

    let pieceId: string | null = null;
    let fromPosition: [number, number] | null = null;
    let pieceType: "alien" | "robot" = "alien";
    let pieceSize: "lg" | "md" | "sm" = "md";

    // Case 1: piece from side panel
    if (active.id.toString().startsWith("alien:") || active.id.toString().startsWith("robot:")) {
      const [type, pid] = active.id.toString().split(":");
      pieceId = pid;
      pieceType = type as "alien" | "robot";
      
      // Find piece details
      const player = game.players.find(p => p.type === (type === "alien" ? "human" : "computer"));
      const piece = player?.pieces.find(p => p.id === pid);
      if (piece) {
        pieceSize = piece.size.toLowerCase() as "lg" | "md" | "sm";
        // For pieces from side panel, they don't have a position yet
        fromPosition = null;
      }
    }
    // Case 2: piece from board
    else if (active.id.toString().startsWith("board:")) {
      const [, pid] = active.id.toString().split(":");
      pieceId = pid;
      
      // Find piece on board
      for (let r = 0; r < game.board.length; r++) {
        for (let c = 0; c < game.board[r].length; c++) {
          const cell = game.board[r][c];
          if (cell && cell.pieceId === pid) {
            fromPosition = [r, c];
            pieceType = cell.ownerId === game.players.find(p => p.type === "human")?.id ? "alien" : "robot";
            pieceSize = cell.size.toLowerCase() as "lg" | "md" | "sm";
            break;
          }
        }
      }
    }

    if (!pieceId) return;

    // Calculate position for animated piece
    if (!boardRef.current) return;
    
    const boardRect = boardRef.current.getBoundingClientRect();
    const cellSize = 296 / 3; // Board size / 3 cells
    const cellGap = 10;
    const actualCellSize = cellSize - cellGap;
    
    const x = boardRect.left + 6 + (col * (cellSize + cellGap)) + actualCellSize / 2;
    const y = boardRect.top + 6 + (row * (cellSize + cellGap)) + actualCellSize / 2;

    // Show animated piece
    setAnimatingPiece({
      pieceId,
      pieceType,
      size: pieceSize,
      position: { x, y }
    });

    // Show move loading state
    setIsMakingMove(true);
    setMoveMessage("Executing your cosmic strategy...");

    // Make the actual API call
    makeMove.mutate(
      {
        gameId,
        move: {
          playerId: game.currentPlayer,
          pieceId,
          to: [row, col],
        },
      },
      {
        onSuccess: () => {
          // Hide animated piece and refresh data
          setAnimatingPiece(null);
          queryClient.invalidateQueries({ queryKey: ["game", gameId] });
          setIsMakingMove(false);
          
          // Show opponent thinking state
          setIsOpponentThinking(true);
          setTimeout(() => {
            setIsOpponentThinking(false);
          }, 2000);
        },
        onError: () => {
          // Hide animated piece on error
          setAnimatingPiece(null);
          setIsMakingMove(false);
        },
      }
    );
  }

  const boardRef = useRef<HTMLDivElement>(null);

  // Show game start loader
  if (isGameStarting) {
    return <GameStartLoader />;
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D013D] text-white">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-transparent border-t-[#B57BFE] rounded-full animate-spin"></div>
          <p className="text-lg">Loading game...</p>
        </motion.div>
      </div>
    );
  }
  console.log(game)
  const human = game.players.find((p) => p.type === "human");
  const computer = game.players.find((p) => p.type === "computer");

  return (
    <>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="min-h-screen min-w-screen w-full flex flex-col bg-[#0D013D] text-white relative">
        {/* Title */}
        <div className="w-full flex justify-center pt-8 pb-4">
          <Title />
        </div>

        {/* Game UI */}
        <div className="flex-1 flex flex-row items-center justify-center w-full max-w-6xl mx-auto gap-2 md:gap-12">
          {/* Human pieces */}
          <div className="flex flex-col items-center justify-center gap-2 md:gap-4">
            {human?.pieces.map((p) => (
              <DraggablePiece
                key={p.id}
                id={`alien:${p.id}`}
                type="alien"
                size={p.size.toLowerCase() as GamePieceSize}
              />
            ))}
          </div>

          {/* Board */}
          <div className="flex items-center justify-center mx-2 md:mx-8 relative" ref={boardRef}>
            <PulsingGlow isActive={isOpponentThinking}>
              <div className="w-[320px] h-[320px] rounded-[28px] p-[6px] bg-[#B57BFE] shadow-xl">
                <div className="w-[296px] h-[296px] rounded-[24px] bg-[#4653AE] grid grid-cols-3 grid-rows-3 gap-[10px] p-[10px]">
                  {game.board.map((row, r) =>
                    row.map((cell, c) => (
                      <DroppableCell key={`${r}-${c}`} row={r} col={c}>
                        {cell ? (
                          <DraggablePiece
                            id={`board:${cell.pieceId}`}
                            type={cell.ownerId === human?.id ? "alien" : "robot"}
                            size={cell.size.toLowerCase() as GamePieceSize}
                          />
                        ) : null}
                      </DroppableCell>
                    ))
                  )}
                </div>
              </div>
            </PulsingGlow>
          </div>

          {/* Computer pieces */}
          <div className="flex flex-col items-center justify-center gap-2 md:gap-4">
            {computer?.pieces.map((p) => (
              <DraggablePiece
                key={p.id}
                id={`robot:${p.id}`}
                type="robot"
                size={p.size.toLowerCase() as GamePieceSize}
              />
            ))}
          </div>
        </div>

        {/* Loading States */}
        <AnimatePresence>
          {isMakingMove && (
            <MoveLoader message={moveMessage} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpponentThinking && (
            <OpponentMoveLoader />
          )}
        </AnimatePresence>

        {/* Animated Piece */}
        <AnimatePresence>
          {animatingPiece && (
            <PieceAnimationLoader
              key={animatingPiece.pieceId}
              pieceType={animatingPiece.pieceType}
              size={animatingPiece.size}
              position={animatingPiece.position}
            />
          )}
        </AnimatePresence>

        {/* Play Again Button */}
        <AnimatePresence>
          {showPlayAgainButton && (
            <motion.div
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.button
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-200"
                onClick={() => navigate("/")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 Play Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        </div>
      </DndContext>
      
      {/* Dialog - Outside of main container to ensure proper positioning */}
      <AnimatePresence>
        <ResultDialog 
          setResult={setResult} 
          result={result} 
          setShowPlayAgainButton={setShowPlayAgainButton}
          winner={game?.winner}
        />
      </AnimatePresence>

      {/* Guide Overlay (only in game view) */}
      {showGuide && (
        <GuideOverlay
          onClose={() => setShowGuide(false)}
          onSkipForever={() => {
            localStorage.setItem("avr:guide:skip", "1");
            setShowGuide(false);
          }}
        />
      )}
    </>
  );
}
