import { Title } from "./components/Title";
import { GamePiece } from "./components/GamePiece";
import type { GamePieceType, GamePieceSize } from "./components/GamePiece";
import {
  DndContext,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import React, { useState } from "react";

const initialAliens = ["lg", "md", "sm"] as GamePieceSize[];
const initialRobots = ["lg", "md", "sm"] as GamePieceSize[];

// Board state: 3x3 grid, each cell can have a piece or null
const emptyBoard = Array(3)
  .fill(null)
  .map(() => Array(3).fill(null));

export default function App() {
  const [aliens, setAliens] = useState(initialAliens);
  const [robots, setRobots] = useState(initialRobots);
  const [board, setBoard] = useState<any[][]>(emptyBoard);

  // Helper to render draggable piece
  function DraggablePiece({ id, type, size }: { id: string; type: GamePieceType; size: GamePieceSize }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`cursor-grab ${isDragging ? "opacity-50" : "hover:scale-110 transition-transform"}`}
        style={{ touchAction: "none" }}
      >
        <GamePiece type={type} size={size} />
      </div>
    );
  }

  // Helper to render droppable cell
  function DroppableCell({ row, col, children }: { row: number; col: number; children?: React.ReactNode }) {
    const id = `cell-${row}-${col}`;
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
      <div
        ref={setNodeRef}
        className={`flex border-2 border-white items-center justify-center rounded-[18px] transition-colors duration-150 ${isOver ? "ring-4 ring-yellow-300" : ""}`}
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </div>
    );
  }

  // Handle drop
  function handleDragEnd(event: DragEndEvent) {
    const { over, active } = event;
    if (!over) return;
    const [pieceType, pieceSize] = active.id.toString().split(":");
    if (!pieceType || !pieceSize) return;
    if (!over.id.toString().startsWith("cell-")) return;
    const [, row, col] = over.id.toString().split("-").map(Number);
    if (board[row][col]) return; // already occupied 
    // Place piece on board
    setBoard((prev) => {
      const newBoard = prev.map((r) => [...r]);
      newBoard[row][col] = { type: pieceType, size: pieceSize };
      return newBoard;
    });
    // Remove from side panel
    if (pieceType === "alien") setAliens((prev) => prev.filter((s) => s !== pieceSize));
    if (pieceType === "robot") setRobots((prev) => prev.filter((s) => s !== pieceSize));
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen min-w-screen w-full flex flex-col bg-[#0D013D]">
        {/* Title centered at the top */}
        <div className="w-full flex justify-center pt-8 pb-4">
          <Title />
        </div>
        {/* Main content: Aliens | Board | Robots */}
        <div className="flex-1 flex flex-row items-center justify-center w-full max-w-6xl mx-auto gap-2 md:gap-12">
          {/* Left: Aliens */}
          <div className="flex flex-col items-center justify-center gap-2 md:gap-4">
            {aliens.map((size) => (
              <DraggablePiece key={size} id={`alien:${size}`} type="alien" size={size} />
            ))}
          </div>
          {/* Center: Game Board */} 
          <div className="flex items-center justify-center mx-2 md:mx-8">
            <div className="w-[320px] h-[320px] rounded-[28px] p-[6px] bg-[#B57BFE] shadow-xl">
              <div className="w-[296px] h-[296px] rounded-[24px] bg-[#4653AE] grid grid-cols-3 grid-rows-3 gap-[10px] p-[10px]">
                {[0, 1, 2].map((row) =>
                  [0, 1, 2].map((col) => (
                    <DroppableCell key={`${row}-${col}`} row={row} col={col}>
                      {board[row][col] ? (
                        <GamePiece type={board[row][col].type} size={board[row][col].size} />
                      ) : null}
                    </DroppableCell>
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Right: Robots */}
          <div className="flex flex-col items-center justify-center gap-2 md:gap-4">
            {robots.map((size) => (
              <DraggablePiece key={size} id={`robot:${size}`} type="robot" size={size} />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
