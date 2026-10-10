/**
 * This provider deliberately accepts no image: the chosen scenario alone
 * determines its prewritten output. It performs no model inference or requests.
 */
export type SimulationScenario = "anemia" | "normal" | "disagreement";
export type BinaryClass = "Anemia" | "Normal";

export interface AnalyzerInput {
  readonly scenario: SimulationScenario;
}

export interface AnalyzerOutput {
  readonly mode: "simulated";
  readonly scenario: SimulationScenario;
  readonly predictions: {
    readonly yolo: BinaryClass;
    readonly rgbHsv: BinaryClass;
  };
}

export interface AnalyzerOptions {
  readonly signal?: AbortSignal;
  readonly delayMs?: number;
}

/** Implement this generic contract for a future verified inference service. */
export interface AnalyzerProvider<Input = AnalyzerInput, Output = AnalyzerOutput> {
  analyze(input: Input, options?: AnalyzerOptions): Promise<Output>;
}

export interface ModelAnalyzerInput {
  readonly image: File;
}

export interface ModelAnalyzerOutput {
  readonly mode: "model";
  readonly predictions: AnalyzerOutput["predictions"];
}

const predefinedPredictions: Record<SimulationScenario, AnalyzerOutput["predictions"]> = {
  anemia: { yolo: "Anemia", rgbHsv: "Anemia" },
  normal: { yolo: "Normal", rgbHsv: "Normal" },
  disagreement: { yolo: "Anemia", rgbHsv: "Normal" },
};

function abortError() {
  return new DOMException("The simulated analysis was cancelled.", "AbortError");
}

export const simulatedAnalyzer: AnalyzerProvider = {
  analyze({ scenario }, { signal, delayMs = 1400 } = {}) {
    if (signal?.aborted) return Promise.reject(abortError());

    return new Promise<AnalyzerOutput>((resolve, reject) => {
      const onAbort = () => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
        reject(abortError());
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener("abort", onAbort);
        resolve({
          mode: "simulated",
          scenario,
          predictions: { ...predefinedPredictions[scenario] },
        });
      }, Math.max(0, delayMs));

      signal?.addEventListener("abort", onAbort, { once: true });
    });
  },
};
