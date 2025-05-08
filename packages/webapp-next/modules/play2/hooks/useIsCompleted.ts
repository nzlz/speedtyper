import { useEffect, useState } from "react";
import { useCodeStore } from "../state/code-store";

export const useIsCompleted = () => {
  // Track changes to correctIndex to trigger re-renders
  const correctIndex = useCodeStore((state) => state.correctIndex);
  // Store the completion state in local state to ensure proper rendering
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Update the completion state whenever code state changes
  useEffect(() => {
    const completed = useCodeStore.getState().isCompleted();
    setIsCompleted(completed);
  }, [correctIndex]);
  
  return isCompleted;
};
