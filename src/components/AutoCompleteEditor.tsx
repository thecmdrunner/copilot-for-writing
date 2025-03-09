"use client";

import { type CompletionResponse } from "@/app/api/completion/route";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

export function AutoCompleteEditor() {
  const [input, setInput] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [context, setContext] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<HTMLTextAreaElement>(null);

  const { mutateAsync: fetchCompletion } = useMutation({
    mutationFn: async (text: string) => {
      if (!text.trim() || isComposing) {
        setAiSuggestion("");
        return null;
      }

      const response = await fetch("/api/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          context: context.trim(), // Include the context in the API request
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch completion");

      const data = (await response.json()) as CompletionResponse;
      return data;
    },
  });

  // Add a more robust function to detect if we're at a position where suggestions are appropriate
  const shouldShowSuggestion = useCallback(
    (text: string, cursorPosition: number): boolean => {
      if (cursorPosition !== text.length) return false;

      // Don't show suggestions for empty text
      if (text.trim().length === 0) return false;

      // Check if we're at the end of the last line
      const lines = text.split("\n");
      if (lines.length === 0) return false;

      const lastLine = lines[lines.length - 1];
      if (!lastLine) return false;
      const lastLineLength = lastLine.length;

      // Calculate position in the last line
      const positionInLastLine =
        cursorPosition - (text.length - lastLineLength);
      if (positionInLastLine !== lastLineLength) return false;

      // Check if we're in the middle of a word
      // We want to show suggestions only after a space or at the beginning of a line
      const words = lastLine.trim().split(/\s+/);
      if (words.length === 0) return true;

      const lastWord = words[words.length - 1];

      // If the last character is a space, we're at a word boundary
      if (lastLine.endsWith(" ")) return true;

      // If the last word is a complete word (like a name), don't show suggestion
      // This is a heuristic - we consider a complete word if it's longer than 3 characters
      // and doesn't end with a punctuation mark
      const punctuation = [".", ",", "!", "?", ":", ";"];
      const lastChar = lastLine.charAt(lastLine.length - 1);

      if (lastWord && lastWord.length > 3 && !punctuation.includes(lastChar)) {
        // Check if the last word looks like a name (starts with uppercase)
        if (/^[A-Z][a-z]+$/.test(lastWord)) {
          return false; // Don't suggest after what looks like a complete name
        }
      }

      return true;
    },
    [],
  );

  // Update the debounced fetch completion to use the new function
  const debouncedFetchCompletion = useDebounceCallback(async (text: string) => {
    try {
      // Check if we should show a suggestion at the current position
      if (
        !inputRef.current ||
        !shouldShowSuggestion(text, inputRef.current.selectionStart)
      ) {
        setAiSuggestion("");
        return;
      }

      const result = await fetchCompletion(text);
      if (result?.text) {
        // Check if we need to add a space before the suggestion
        let suggestionText = result.text;

        // If the input doesn't end with a space and the suggestion doesn't start with a space,
        // and the input isn't empty, and the last character isn't a punctuation mark that doesn't need a space
        const lastChar = text.charAt(text.length - 1);
        const noSpaceNeededAfter = [
          ".",
          ",",
          "!",
          "?",
          ":",
          ";",
          "-",
          "(",
          "[",
          "{",
          '"',
          "'",
          "\n",
          " ",
        ];

        if (
          text.length > 0 &&
          !suggestionText.startsWith(" ") &&
          !noSpaceNeededAfter.includes(lastChar)
        ) {
          suggestionText = " " + suggestionText;
        }

        setAiSuggestion(suggestionText);
      } else {
        setAiSuggestion("");
      }
    } catch (error) {
      console.error("Error fetching completion:", error);
      setAiSuggestion("");
    }
  }, 500);

  // Update the input change handler to use the new function
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const oldValue = input;
      setInput(newValue);

      // Reset suggestion if user goes to a new line
      if (newValue.split("\n").length > oldValue.split("\n").length) {
        setAiSuggestion("");
        return;
      }

      // Handle when user types characters
      if (aiSuggestion && newValue.length > oldValue.length) {
        // Only consider the case where a single character was added at the end
        if (
          newValue.length === oldValue.length + 1 &&
          newValue.startsWith(oldValue) &&
          inputRef.current?.selectionStart === newValue.length
        ) {
          const addedChar = newValue.slice(oldValue.length);
          const expectedChar = aiSuggestion.charAt(0);

          if (addedChar !== expectedChar) {
            // User typed something different than the suggestion
            setAiSuggestion("");
          } else {
            // User typed the first character of the suggestion, so remove it from the suggestion
            setAiSuggestion(aiSuggestion.slice(1));
            return; // Skip fetching new completion
          }
        } else {
          // Multiple characters added or not at the end
          setAiSuggestion("");
        }
      }

      // Don't fetch suggestions if we're composing
      if (!isComposing) {
        // Check if we should show a suggestion at the current position
        const cursorPosition = e.target.selectionStart;
        if (shouldShowSuggestion(newValue, cursorPosition)) {
          void debouncedFetchCompletion(newValue);
        } else {
          setAiSuggestion("");
        }
      }
    },
    [
      debouncedFetchCompletion,
      isComposing,
      input,
      aiSuggestion,
      shouldShowSuggestion,
    ],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle Tab key to accept suggestion
      if (e.key === "Tab" && aiSuggestion) {
        e.preventDefault();
        setInput((prev) => prev + aiSuggestion);
        setAiSuggestion("");

        // Set cursor at the end of the input
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.selectionStart = inputRef.current.value.length;
            inputRef.current.selectionEnd = inputRef.current.value.length;
          }
        }, 0);
        return;
      }

      // Reset suggestion on Enter key
      if (e.key === "Enter") {
        setAiSuggestion("");
        return;
      }

      // Reset suggestion on arrow keys if they would move the cursor away from the end
      if (["ArrowLeft", "ArrowUp", "ArrowDown", "Home"].includes(e.key)) {
        setAiSuggestion("");
        return;
      }

      // Reset suggestion on Backspace if at the end of text
      if (e.key === "Backspace" && inputRef.current) {
        const cursorAtEnd = inputRef.current.selectionStart === input.length;
        if (cursorAtEnd && aiSuggestion) {
          // Only reset if we're at the end, otherwise let the selection change handler deal with it
          setAiSuggestion("");
        }
      }
    },
    [aiSuggestion, input],
  );

  // Handle IME composition events (for languages like Chinese, Japanese, etc.)
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
    void debouncedFetchCompletion(input);
  }, [debouncedFetchCompletion, input]);

  // Adjust textarea height automatically
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input, aiSuggestion]);

  // Update the selection change handler to use the new function
  const handleSelectionChange = useCallback(() => {
    if (!inputRef.current) return;

    // Get the current cursor position
    const cursorPosition = inputRef.current.selectionStart;

    // Check if we should show a suggestion at the current position
    if (!shouldShowSuggestion(input, cursorPosition)) {
      setAiSuggestion("");
    }
  }, [input, shouldShowSuggestion]);

  // Add event listener for selection change
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const handleSelectionEvent = () => handleSelectionChange();

    textarea.addEventListener("click", handleSelectionEvent);
    textarea.addEventListener("keyup", handleSelectionEvent);

    return () => {
      textarea.removeEventListener("click", handleSelectionEvent);
      textarea.removeEventListener("keyup", handleSelectionEvent);
    };
  }, [handleSelectionChange]);

  // Add a handler for context changes
  const handleContextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContext(e.target.value);

      // Adjust textarea height
      if (contextRef.current) {
        contextRef.current.style.height = "auto";
        contextRef.current.style.height = `${contextRef.current.scrollHeight}px`;
      }
    },
    [],
  );

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {/* Context input */}
      <div className="mb-4">
        <label
          htmlFor="context"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Writing Context (optional)
        </label>
        <div className="relative rounded-lg bg-gray-100/50">
          <textarea
            ref={contextRef}
            id="context"
            value={context}
            onChange={handleContextChange}
            placeholder="Describe your intent, e.g., 'I'm writing an email to a client about a project update...'"
            className={cn(
              "w-full resize-none rounded-lg border-0 bg-transparent p-3 focus:ring-0",
              "min-h-[60px] text-sm outline-none",
            )}
            rows={2}
          />
        </div>
      </div>

      {/* Main editor */}
      <div className="relative rounded-lg bg-gray-100/50">
        <div className="relative">
          {/* Input textarea with suggestion overlay */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="Start typing..."
            className={cn(
              "w-full resize-none rounded-lg border-0 bg-transparent p-4 focus:ring-0",
              "min-h-[100px] outline-none",
            )}
            rows={1}
          />

          {/* Suggestion overlay */}
          {aiSuggestion && (
            <div
              ref={suggestionRef}
              className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words p-4"
              aria-hidden="true"
            >
              <span>{input}</span>
              <span className="text-muted-foreground">{aiSuggestion}</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-muted-foreground mt-2 text-xs">
        Press Tab to accept the suggestion
      </p>
    </div>
  );
}
