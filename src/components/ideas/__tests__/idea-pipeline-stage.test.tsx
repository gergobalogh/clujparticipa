/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { IdeaPipelineStage } from "../idea-pipeline-stage";
import type { PipelineStage } from "../idea-pipeline";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

const reachedStage: PipelineStage = {
  status: "SUBMITTED",
  label: "Submitted",
  reached: true,
  current: false,
  date: "2025-03-15",
};

const completedStage: PipelineStage = {
  status: "COMPLETED",
  label: "Completed",
  reached: true,
  current: false,
  date: "2025-06-10",
};

const currentStage: PipelineStage = {
  status: "IN_VOTING",
  label: "In voting",
  reached: true,
  current: true,
  date: "2025-04-01",
};

const futureStage: PipelineStage = {
  status: "SELECTED",
  label: "Selected",
  reached: false,
  current: false,
  date: null,
};

describe("IdeaPipelineStage", () => {
  it("renders reached stage with filled circle and date text", () => {
    render(<IdeaPipelineStage stage={reachedStage} />);

    const marker = screen.getByTestId("stage-marker");
    expect(marker).toHaveClass("bg-civic-orange");
    expect(screen.getByText("2025-03-15")).toBeInTheDocument();
    expect(screen.getByText("Statuses.SUBMITTED")).toBeInTheDocument();
  });

  it("renders current stage with filled circle and pulsing indicator", () => {
    render(<IdeaPipelineStage stage={currentStage} />);

    const marker = screen.getByTestId("stage-marker");
    expect(marker).toHaveClass("bg-purple-700");
    const pulse = screen.getByTestId("pulse-ring");
    expect(pulse).toHaveClass("animate-pulse");
    expect(screen.getByText("Statuses.IN_VOTING")).toBeInTheDocument();
  });

  it("renders future stage with outlined gray circle and no date", () => {
    render(<IdeaPipelineStage stage={futureStage} />);

    const marker = screen.getByTestId("stage-marker");
    expect(marker).toHaveClass("border-gray-300");
    expect(marker).not.toHaveClass("bg-civic-teal");
    expect(screen.queryByText(/20/)).not.toBeInTheDocument();
    expect(screen.getByText("Statuses.SELECTED")).toBeInTheDocument();
  });

  it("renders REJECTED exception state with red marker", () => {
    render(
      <IdeaPipelineStage stage={reachedStage} exceptionState="REJECTED" />
    );

    const marker = screen.getByTestId("stage-marker");
    expect(marker).toHaveClass("bg-red-600");
  });

  it("renders reached stage with null date (no date text shown)", () => {
    const stageWithoutDate: PipelineStage = {
      ...completedStage,
      date: null,
    };
    render(<IdeaPipelineStage stage={stageWithoutDate} />);

    const marker = screen.getByTestId("stage-marker");
    expect(marker).toHaveClass("bg-civic-teal");
    expect(screen.queryByText(/20/)).not.toBeInTheDocument();
  });

  it("renders MERGED exception state differently from REJECTED", () => {
    render(
      <IdeaPipelineStage stage={completedStage} exceptionState="MERGED" />
    );

    const marker = screen.getByTestId("stage-marker");
    expect(marker).not.toHaveClass("bg-red-600");
    expect(marker).toHaveClass("bg-civic-teal");
  });
});
