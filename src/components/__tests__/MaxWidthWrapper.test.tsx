/**
 * Component test for the layout wrapper. It is small but every page renders
 * inside this component, so a regression on its class merging or children
 * passthrough would visually break the whole app.
 */
import { render, screen } from "@testing-library/react";
import MaxWidthWrapper from "../MaxWidthWrapper";

describe("<MaxWidthWrapper />", () => {
  it("renders its children", () => {
    render(
      <MaxWidthWrapper>
        <span>hello</span>
      </MaxWidthWrapper>,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("applies the default layout classes (mx-auto, max-w-screen-xl, px-2.5)", () => {
    const { container } = render(
      <MaxWidthWrapper>
        <span>x</span>
      </MaxWidthWrapper>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("mx-auto");
    expect(root.className).toContain("max-w-screen-xl");
    expect(root.className).toContain("px-2.5");
  });

  it("merges in a caller-provided className without dropping defaults", () => {
    const { container } = render(
      <MaxWidthWrapper className="extra-class">
        <span>x</span>
      </MaxWidthWrapper>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("extra-class");
    expect(root.className).toContain("mx-auto");
  });
});
