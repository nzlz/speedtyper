import { useEffect, useState } from "react";
import SocketLatest from "../../../common/services/Socket";
import { formatCodeWithMaxLineLength } from "../../../common/utils/code-formatter";
import { useCodeStore } from "../state/code-store";
import { useConnectionStore } from "../state/connection-store";

export interface ChallengeInfo {
  code: string;
  filePath: string;
  language: string;
  url: string;
  projectName: string;
  license: string;
}

export function useChallenge(): ChallengeInfo {
  const initialize = useCodeStore((state) => state.initialize);
  const [challenge, setChallenge] = useState({
    loaded: false,
    code: "",
    filePath: "",
    language: "",
    url: "",
    projectName: "",
    license: "",
  });

  const socket = useConnectionStore((s) => s.socket);

  useEffect(() => {
    socket?.subscribe("challenge_selected", (_, challenge) => {
      // Format the code for maximum line length before displaying
      const formattedCode = formatCodeWithMaxLineLength(challenge.content);
      
      setChallenge({
        loaded: true,
        projectName: challenge.project.fullName,
        url: challenge.url,
        code: formattedCode,
        language: challenge.project.language,
        filePath: challenge.path,
        license: challenge.project.licenseName,
      });
      
      // Replace tabs with spaces and initialize
      initialize(formattedCode.replaceAll("\t", "  "));
    });
    
    socket?.subscribe("race_joined", (_, raceData) => {
      const { challenge } = raceData;
      
      // Format the code for maximum line length before displaying
      const formattedCode = formatCodeWithMaxLineLength(challenge.content);
      
      setChallenge({
        loaded: true,
        projectName: challenge.project.fullName,
        url: challenge.url,
        code: formattedCode,
        language: challenge.project.language,
        filePath: challenge.path,
        license: challenge.project.licenseName,
      });
      
      // Replace tabs with spaces and initialize
      initialize(formattedCode.replaceAll("\t", "  "));
    });
  }, [socket, initialize]);

  return challenge;
}
