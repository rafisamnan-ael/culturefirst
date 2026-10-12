import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock server-only module for Node/Vitest environment
vi.mock("server-only", () => ({}), { virtual: true });
