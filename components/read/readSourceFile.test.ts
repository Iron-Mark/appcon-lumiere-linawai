import { describe, expect, it } from "vitest";
import { toPlainSource } from "./readSourceFile";

describe("toPlainSource", () => {
  it("turns a markdown notice into sentences without markup", () => {
    const plain = toPlainSource(`# Water advisory

**Water service** will be
interrupted on Saturday from 9:00 AM to 3:00 PM.

- Residents must store water on Friday night.
> Only if they register before 12:00 noon.

See [the desk](https://example.invalid/desk).
`);

    expect(plain).not.toMatch(/[#>*`[\]]/);
    expect(plain).toContain("Water service will be interrupted on Saturday from 9:00 AM to 3:00 PM.");
    expect(plain).toContain("Residents must store water on Friday night.");
    expect(plain).toContain("Only if they register before 12:00 noon.");
    expect(plain).toContain("See the desk.");
  });
});
