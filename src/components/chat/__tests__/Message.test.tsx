/**
 * Component tests for the chat <Message /> bubble. The chat surface is the
 * core of the product, so we want at least:
 *  - text from a user message renders verbatim
 *  - bot messages render their markdown content
 *  - citations render and clicking one fires onCitationClick with the right
 *    fileId/page/citation
 */
import { fireEvent, render, screen } from "@testing-library/react";
import Message from "../Message";

const mockSaveHighlight = jest.fn();

jest.mock("@/app/_trpc/client", () => ({
  trpc: {
    saveAsHighlight: {
      useMutation: () => ({ mutate: mockSaveHighlight, isLoading: false }),
    },
  },
}));

jest.mock("../../ui/use-toast", () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

// react-markdown's ESM build trips up jest-jsdom; mock it to render text.
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <span>{children}</span>,
}));

const baseMessage = {
  id: "m1",
  text: "hello world",
  isUserMessage: true,
  createdAt: new Date("2024-01-01T09:05:00Z").toISOString(),
} as const;

describe("<Message />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the text content of a user message", () => {
    render(
      <Message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message={baseMessage as any}
        isNextMessageSamePerson={false}
      />,
    );
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("renders bot message markdown content via the mocked react-markdown", () => {
    render(
      <Message
        message={
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { ...baseMessage, id: "m2", isUserMessage: false, text: "**bold answer**" } as any
        }
        isNextMessageSamePerson={false}
      />,
    );
    expect(screen.getByText("**bold answer**")).toBeInTheDocument();
  });

  it("renders each citation and fires onCitationClick when clicked", () => {
    const onCitationClick = jest.fn();
    render(
      <Message
        message={
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {
            ...baseMessage,
            id: "m3",
            isUserMessage: false,
            text: "answer",
            citations: [
              { fileId: "f1", fileName: "report.pdf", pageNumber: 7, snippet: "snip" },
            ],
          } as any
        }
        isNextMessageSamePerson={false}
        onCitationClick={onCitationClick}
      />,
    );

    const btn = screen.getByRole("button", { name: /report\.pdf p\.7/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);

    expect(onCitationClick).toHaveBeenCalledWith({
      fileId: "f1",
      page: 7,
      citation: expect.objectContaining({ fileId: "f1", pageNumber: 7 }),
    });
  });
});
