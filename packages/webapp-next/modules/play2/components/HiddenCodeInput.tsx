import {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useState,
  useCallback,
} from "react";

import { isSkippable, useCodeStore } from "../state/code-store";
import { useCanType, useGameStore } from "../state/game-store";

interface HiddenCodeInputProps {
  hide: boolean; // Used for debugging the input
  disabled: boolean;
  inputRef: (node: HTMLTextAreaElement) => void;
}

const useAutoTyper = (
  handleOnChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
) => {
  const isAutoTyperEnabled = false;
  const code = useCodeStore.getState().code;
  
  useEffect(() => {
    if (code && isAutoTyperEnabled) {
      const current = useCodeStore.getState().currentChar();
      const untyped = useCodeStore
        .getState()
        .untypedChars()
        .split("\n")
        .map((st) => st.trimStart())
        .join("\n");
      const value = current + untyped;
      
      // Use setTimeout to avoid updating state during render
      setTimeout(() => {
        handleOnChange({
          target: {
            value,
          },
        } as unknown as ChangeEvent<HTMLTextAreaElement>);
      }, 0);
    }
  }, [isAutoTyperEnabled, code, handleOnChange]);
};

export const HiddenCodeInput = ({
  disabled,
  hide,
  inputRef,
}: HiddenCodeInputProps) => {
  const game = useGameStore((s) => s.game);
  const handleBackspace = useCodeStore((state) => state.handleBackspace);
  const handleKeyPress = useCodeStore((state) => state.handleKeyPress);
  const keyPressFactory = useCodeStore((state) => state.keyPressFactory);
  const canType = useCanType();

  // TODO: remove input and setInput
  // instead introduc getTypedInput method in the store
  // which gets code.substr(0, correctIndex)
  const [input, setInput] = useState("");
  
  // Memoize the onChange handler to avoid recreating it on every render
  const handleOnChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    // TODO: use e.isTrusted
    if (!canType) return;
    if (!game) return;
    const backspaces = input.length - e.target.value.length;
    // send backspaces
    if (backspaces > 0) {
      for (let i = 1; i <= backspaces; i++) {
        handleBackspace();
      }
    } else {
      // send regular characters
      const typed = e.target.value.substring(input.length);
      for (const char of typed) {
        if (isSkippable(char)) continue;
        const keyPress = keyPressFactory(char);
        handleKeyPress(keyPress);
        game.sendKeyStroke(keyPress);
      }
    }
    setInput(e.target.value);
  }, [canType, game, handleBackspace, handleKeyPress, input, keyPressFactory]);
  
  // Use the memoized handler for autoTyper
  useAutoTyper(handleOnChange);

  return (
    <textarea
      className="text-black"
      ref={inputRef}
      value={input}
      autoFocus
      disabled={disabled}
      onChange={handleOnChange}
      onKeyDown={preventArrowKeys}
      onClick={preventClick}
      onPaste={preventPaste}
      style={{
        ...(hide
          ? {
              position: "absolute",
              left: "-10000000px",
            }
          : {}),
      }}
    />
  );
};

function preventClick(e: MouseEvent<HTMLTextAreaElement>) {
  e.preventDefault();
}

function preventPaste(e: ClipboardEvent<HTMLTextAreaElement>) {
  e.preventDefault();
}

function preventArrowKeys(e: KeyboardEvent<HTMLTextAreaElement>) {
  switch (e.key) {
    case ArrowKey.Up:
    case ArrowKey.Down:
    case ArrowKey.Left:
    case ArrowKey.Right:
      e.preventDefault();
  }
}

enum ArrowKey {
  Up = "ArrowUp",
  Down = "ArrowDown",
  Left = "ArrowLeft",
  Right = "ArrowRight",
}
