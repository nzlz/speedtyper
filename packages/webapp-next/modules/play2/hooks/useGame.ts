import { useEffect, useRef, useState } from "react";
import { Game } from "../services/Game";
import { useConnectionStore } from "../state/connection-store";
import { useInitialRaceIdQueryParam } from "./useGameIdQueryParam";

export const useGame = () => {
  const raceIdQueryParam = useInitialRaceIdQueryParam();
  const socket = useConnectionStore((s) => s.socket);
  const [game, setGame] = useState<Game | null>(null);
  const gameRef = useRef<Game | null>(null);
  
  // Create Game instance in an effect rather than during render
  useEffect(() => {
    if (socket && !gameRef.current) {
      const newGame = new Game(socket, raceIdQueryParam);
      gameRef.current = newGame;
      setGame(newGame);
    }
    
    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current = null;
      }
    };
  }, [socket, raceIdQueryParam]);
  
  return game;
};
