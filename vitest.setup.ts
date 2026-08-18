import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("rc-tween-one", () => ({
  TweenOneGroup: ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));
