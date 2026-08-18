// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const antdColorPickerMocks = vi.hoisted(() => ({
  lastOnChangeComplete: null as ((color: { toHex: () => string }) => void) | null,
}));

vi.mock("antd", () => ({
  ColorPicker: (props: {
    value: string;
    disabled?: boolean;
    onChangeComplete: (color: { toHex: () => string }) => void;
  }) => {
    antdColorPickerMocks.lastOnChangeComplete = props.onChangeComplete;
    return (
      <button
        type="button"
        data-testid="antd-color-picker"
        disabled={props.disabled}
        onClick={() => props.onChangeComplete({ toHex: () => "3b82f6" })}
      />
    );
  },
}));

import { ColorPicker } from "@/pages/threshold-config/components/ColorPicker";

describe("ColorPicker", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the current hex value in the text input with a valid-looking border", () => {
    render(<ColorPicker value="#10B981" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("#RRGGBB") as HTMLInputElement;
    expect(input.value).toBe("#10B981");
    expect(input.className).toContain("border-slate-200");
    expect(input.className).not.toContain("border-rose-400");
  });

  it("marks the text input as invalid when the value doesn't match the hex pattern", () => {
    render(<ColorPicker value="not-a-color" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("#RRGGBB") as HTMLInputElement;
    expect(input.className).toContain("border-rose-400");
    expect(input.className).toContain("text-rose-600");
  });

  it("calls onChange with the raw typed value when the text input changes", () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#10B981" onChange={onChange} />);

    const input = screen.getByPlaceholderText("#RRGGBB");
    fireEvent.change(input, { target: { value: "#ZZZZZZ" } });

    expect(onChange).toHaveBeenCalledWith("#ZZZZZZ");
  });

  it("calls onChange with an uppercase hex value when a color is picked via the color-picker widget", () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#10B981" onChange={onChange} />);

    fireEvent.click(screen.getByTestId("antd-color-picker"));

    expect(onChange).toHaveBeenCalledWith("#3B82F6");
  });

  it("disables both the widget and the text input when disabled is true", () => {
    render(<ColorPicker value="#10B981" onChange={vi.fn()} disabled />);

    expect(screen.getByTestId("antd-color-picker")).toBeDisabled();
    expect(screen.getByPlaceholderText("#RRGGBB")).toBeDisabled();
  });
});
