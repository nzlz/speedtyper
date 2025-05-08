import { useFocusRef } from "../hooks/useFocusRef";
import { useCodeStore } from "../state/code-store";
import { CodeArea } from "../components/CodeArea";
import { HiddenCodeInput } from "../components/HiddenCodeInput";
import { TypedChars } from "../components/TypedChars";
import { NextChar } from "../components/NextChar";
import { IncorrectChars } from "../components/IncorrectChars";
import { UntypedChars } from "../components/UntypedChars";
import { useEffect, useState, useCallback, MouseEvent, useMemo } from "react";
import { useIsPlaying } from "../../../common/hooks/useIsPlaying";
import { useKeyMap, triggerKeys } from "../../../hooks/useKeyMap";
import { useHasOpenModal } from "../state/settings-store";

interface CodeTypingContainerProps {
  filePath: string;
  language: string;
}

const CODE_INPUT_BLUR_DEBOUNCE_MS = 1000;

export function CodeTypingContainer({
  filePath,
  language,
}: CodeTypingContainerProps) {
  const code = useCodeStore((state) => state.code);
  const start = useCodeStore((state) => state.start);
  const index = useCodeStore((state) => state.index);
  const isPlaying = useIsPlaying();
  const hasOpenModal = useHasOpenModal();
  const [inputRef, triggerFocus] = useFocusRef<HTMLTextAreaElement>();
  const [focused, setFocused] = useState(true);
  const [trulyFocused, setTrulyFocused] = useState(true);

  const onFocus = useCallback(() => {
    setTrulyFocused(true);
    setFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setTrulyFocused(false);
    const timer = setTimeout(() => {
      if (!trulyFocused) {
        setFocused(false);
      }
    }, CODE_INPUT_BLUR_DEBOUNCE_MS);
    
    return () => clearTimeout(timer);
  }, [trulyFocused]);

  const onMouseDownPreventBlur = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  useKeyMap(!hasOpenModal && !focused, triggerKeys, () => {
    triggerFocus();
    setFocused(true);
  });

  useEffect(() => {
    if (code) {
      triggerFocus();
    }
  }, [code, triggerFocus]);

  useEffect(() => {
    if (!isPlaying && index > 0) {
      start();
    }
  }, [index, isPlaying, start]);

  const hiddenInput = useMemo(() => (
    <HiddenCodeInput hide={true} disabled={false} inputRef={inputRef} />
  ), [inputRef]);

  return (
    <div className="w-full relative" onClick={triggerFocus}>
      <div
        className="flex flex-col w-full"
        onFocus={onFocus}
        onBlur={onBlur}
        onMouseDown={onMouseDownPreventBlur}
      >
        {hiddenInput}
        <CodeArea staticHeigh={true} filePath={filePath.replace(/^\/app\/repos\/?/, "")} focused={focused}>
          <TypedChars language={language} />
          <IncorrectChars />
          <NextChar focused={focused} />
          <UntypedChars />
        </CodeArea>
      </div>
    </div>
  );
}
