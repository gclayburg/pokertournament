import { fireEvent, render, screen } from "@testing-library/react";

import { BlindStructureEditor } from "@/components/BlindStructureEditor";
import { TournamentSettingsForm } from "@/components/TournamentSettingsForm";
import { DEFAULT_CONFIG, DEFAULT_LEVELS } from "@/state/defaults";
import type { BlindLevel, TournamentConfig } from "@/types/tournament";

function cloneConfig(overrides: Partial<TournamentConfig> = {}): TournamentConfig {
  return {
    ...DEFAULT_CONFIG,
    levels: DEFAULT_LEVELS.map((level) =>
      level.type === "break" ? { type: "break" } : { ...level },
    ),
    ...overrides,
  };
}

describe("BlindStructureEditor", () => {
  it("renders_default_levels", () => {
    render(<BlindStructureEditor levels={cloneConfig().levels} onLevelsChange={jest.fn()} />);

    expect(screen.getByText("Level 14")).toBeInTheDocument();
    expect(screen.getAllByText("BREAK")).toHaveLength(2);
  });

  it("edit_blind_values", () => {
    const onLevelsChange = jest.fn();

    render(<BlindStructureEditor levels={cloneConfig().levels} onLevelsChange={onLevelsChange} />);

    fireEvent.change(screen.getByLabelText("Small blind for level 1"), {
      target: { value: "75" },
    });

    expect(onLevelsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: "blind",
          smallBlind: 75,
          bigBlind: 50,
        }),
      ]),
    );
  });

  it("add_level", () => {
    const onLevelsChange = jest.fn();
    const levels = cloneConfig().levels;

    render(<BlindStructureEditor levels={levels} onLevelsChange={onLevelsChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Add Level" }));

    expect(onLevelsChange).toHaveBeenCalledWith([
      ...levels,
      { type: "blind", smallBlind: 0, bigBlind: 0 },
    ]);
  });

  it("add_break", () => {
    const onLevelsChange = jest.fn();
    const levels = cloneConfig().levels;

    render(<BlindStructureEditor levels={levels} onLevelsChange={onLevelsChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Add Break" }));

    expect(onLevelsChange).toHaveBeenCalledWith([...levels, { type: "break" }]);
  });

  it("remove_level", () => {
    const onLevelsChange = jest.fn();
    const levels = cloneConfig().levels;

    render(<BlindStructureEditor levels={levels} onLevelsChange={onLevelsChange} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    expect(onLevelsChange).toHaveBeenCalledWith(levels.slice(1));
  });

  it("reorder_levels", () => {
    const onLevelsChange = jest.fn();
    const levels = cloneConfig({
      levels: [
        { type: "blind", smallBlind: 25, bigBlind: 50 },
        { type: "blind", smallBlind: 50, bigBlind: 100 },
        { type: "break" },
      ] satisfies BlindLevel[],
    }).levels;

    render(<BlindStructureEditor levels={levels} onLevelsChange={onLevelsChange} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Move Down" })[0]);

    expect(onLevelsChange).toHaveBeenCalledWith([
      { type: "blind", smallBlind: 50, bigBlind: 100 },
      { type: "blind", smallBlind: 25, bigBlind: 50 },
      { type: "break" },
    ]);
  });
});

describe("TournamentSettingsForm", () => {
  it("settings_form_fields", () => {
    const config = cloneConfig();

    render(<TournamentSettingsForm config={config} onConfigChange={jest.fn()} />);

    expect(screen.getByLabelText("Number of entries")).toHaveValue(config.initialEntries);
    expect(screen.getByLabelText("Buyin amount ($)")).toHaveValue(config.buyinAmount);
    expect(screen.getByLabelText("Starting stack")).toHaveValue(config.startingStack);
    expect(screen.getByLabelText("Level duration (minutes)")).toHaveValue(
      config.levelDurationMinutes,
    );
    expect(screen.getByLabelText("Break duration (minutes)")).toHaveValue(
      config.breakDurationMinutes,
    );
    expect(screen.getByLabelText("Max rebuys")).toHaveValue(config.maxRebuys);
    expect(screen.getByLabelText("Rebuy cutoff level")).toHaveValue(
      config.rebuyCutoffLevel,
    );
  });

  it("rebuy_toggle", () => {
    const onConfigChange = jest.fn();
    const config = cloneConfig();
    const { rerender } = render(
      <TournamentSettingsForm config={config} onConfigChange={onConfigChange} />,
    );

    fireEvent.click(screen.getByLabelText("Allow rebuys"));

    expect(onConfigChange).toHaveBeenCalledWith({
      ...config,
      rebuysAllowed: false,
    });

    rerender(
      <TournamentSettingsForm
        config={{ ...config, rebuysAllowed: false }}
        onConfigChange={onConfigChange}
      />,
    );

    expect(screen.queryByLabelText("Max rebuys")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Rebuy cutoff level")).not.toBeInTheDocument();
  });

  it("validation_rejects_negative", () => {
    const onConfigChange = jest.fn();

    render(
      <TournamentSettingsForm config={cloneConfig()} onConfigChange={onConfigChange} />,
    );

    fireEvent.change(screen.getByLabelText("Buyin amount ($)"), {
      target: { value: "-1" },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Buyin amount cannot be negative.",
    );
    expect(onConfigChange).not.toHaveBeenCalled();
  });
});
