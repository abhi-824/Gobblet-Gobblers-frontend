import { Title } from "./components/Title";
import { GamePiece } from "./components/GamePiece";
import type { GamePieceType, GamePieceSize } from "./components/GamePiece";
import {
  DndContext,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import React, { useEffect, useState } from "react";
import {
  useCreateGame,
  useStartGame,
  useGameState,
  useMakeMove,
} from "./api/hooks";
import { useQueryClient } from "@tanstack/react-query";

export default function App() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const queryClient = useQueryClient();

  const createGame = useCreateGame();
  const startGame = useStartGame();
  const { data: game } = useGameState(gameId ?? "", {
    refetchInterval: 2000, // auto-polling for computer moves
  });
  const makeMove = useMakeMove();

  // Create and start a new game on mount
  useEffect(() => {
    createGame.mutate(
      { mode: "pvc", difficulty: "easy" },
      {
        onSuccess: (data) => {
          setGameId(data.gameId);
          startGame.mutate(data.gameId);
        },
      }
    );
  }, []);

  // Watch backend status for win/lose/draw
  useEffect(() => {
    if (!game) return;
    if (game.status === "in_progress") return;

    if (game.status === "win") setResult("win");
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

  // Handle drag drop → backend move
  function handleDragEnd(event: DragEndEvent) {
    if (!gameId || !game) return;
    const { over, active } = event;
    if (!over) return;
    if (!over.id.toString().startsWith("cell-")) return; // only allow dropping inside board

    const [, row, col] = over.id.toString().split("-").map(Number);

    let pieceId: string | null = null;

    // Case 1: piece from side panel
    if (active.id.toString().startsWith("alien:") || active.id.toString().startsWith("robot:") || active.id.toString().startsWith("board:")) {
      const [, pid] = active.id.toString().split(":");
      pieceId = pid;
    }

    if (!pieceId) return;

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
          queryClient.invalidateQueries({ queryKey: ["game", gameId] });
        },
      }
    );
  }

  // Result dialog
  function ResultDialog() {
    if (!result) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
        <div className="bg-white text-black p-6 rounded-2xl shadow-xl text-center w-72">
          <h2 className="text-2xl font-bold mb-4">
            {result === "win" && "🎉 You Win!"}
            {result === "lose" && "😢 You Lose!"}
            {result === "draw" && "🤝 It's a Draw!"}
          </h2>
          <button
            className="mt-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => window.location.reload()}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D013D] text-white">
        Loading game...
      </div>
    );
  }

  const human = game.players.find((p) => p.type === "human");
  const computer = game.players.find((p) => p.type === "computer");

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen min-w-screen w-full flex flex-col bg-[#0D013D] text-white">
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
          <div className="flex items-center justify-center mx-2 md:mx-8">
            <div className="w-[320px] h-[320px] rounded-[28px] p-[6px] bg-[#B57BFE] shadow-xl">
              <div className="w-[296px] h-[296px] rounded-[24px] bg-[#4653AE] grid grid-cols-3 grid-rows-3 gap-[10px] p-[10px]">
                {game.board.map((row, r) =>
                  row.map((cell, c) => (
                    <DroppableCell key={`${r}-${c}`} row={r} col={c}>
                      {cell ? (
                        <DraggablePiece
                          id={`board:${cell.pieceId}`} // 👈 needs pieceId from backend
                          type={cell.ownerId === human?.id ? "alien" : "robot"}
                          size={cell.size.toLowerCase() as GamePieceSize}
                        />
                      ) : null}
                    </DroppableCell>
                  ))
                )}
              </div>
            </div>
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

        {/* Dialog */}
        <ResultDialog />
      </div>
    </DndContext>
  );
}
