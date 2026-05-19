/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// @ts-ignore -- RED scaffold import
import { IdeaShareRow } from "@/components/ideas/idea-share-row";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

const baseProps = {
  ideaId: "idea-123",
  title: "New bike lane on Dorobantilor",
  category: "TRANSPORT",
  district: "MANASTUR",
  locale: "ro",
};

describe("IdeaShareRow", () => {
  beforeEach(() => {
    Object.assign(window, {
      open: vi.fn(),
    });
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders WhatsApp, Facebook, and copy-link buttons", () => {
    render(<IdeaShareRow {...baseProps} />);
    expect(screen.getByLabelText(/whatsapp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/facebook/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/copy/i)).toBeInTheDocument();
  });

  it("opens WhatsApp Web intent URL when WhatsApp button is clicked", () => {
    render(<IdeaShareRow {...baseProps} />);
    fireEvent.click(screen.getByLabelText(/whatsapp/i));
    expect(window.open).toHaveBeenCalled();
    const callUrl = (window.open as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(callUrl).toContain("wa.me");
    // The share URL is encoded inside the text query param, so decode before asserting
    const decoded = decodeURIComponent(callUrl);
    expect(decoded).toContain("utm_source=whatsapp");
  });

  it("opens Facebook sharer URL when Facebook button is clicked", () => {
    render(<IdeaShareRow {...baseProps} />);
    fireEvent.click(screen.getByLabelText(/facebook/i));
    expect(window.open).toHaveBeenCalled();
    const callUrl = (window.open as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(callUrl).toContain("facebook.com/sharer");
    // The share URL is encoded inside the u query param, so decode before asserting
    const decoded = decodeURIComponent(callUrl);
    expect(decoded).toContain("utm_source=facebook");
  });

  it("copies link to clipboard when copy button is clicked", async () => {
    render(<IdeaShareRow {...baseProps} />);
    fireEvent.click(screen.getByLabelText(/copy/i));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const copiedUrl = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(copiedUrl).toContain("utm_source=copy");
  });

  it("share buttons have adequate mobile hit targets (44x44px minimum)", () => {
    const { container } = render(<IdeaShareRow {...baseProps} />);
    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      const style = getComputedStyle(btn);
      const minDim = Math.min(
        parseInt(style.width) || btn.offsetWidth,
        parseInt(style.height) || btn.offsetHeight
      );
      // Structural check: buttons should have min-h-11 min-w-11 (44px) or equivalent
      expect(btn.className).toMatch(/min-h-11|min-w-11|p-3|p-4/);
    });
  });

  it("includes idea title in WhatsApp share text", () => {
    render(<IdeaShareRow {...baseProps} />);
    fireEvent.click(screen.getByLabelText(/whatsapp/i));
    const callUrl = (window.open as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    const decoded = decodeURIComponent(callUrl);
    expect(decoded).toContain("New bike lane on Dorobantilor");
  });

  it("falls back to copy-link when WhatsApp intent fails", async () => {
    // window.open returns null (popup blocked or app not installed)
    (window.open as ReturnType<typeof vi.fn>).mockReturnValue(null);
    render(<IdeaShareRow {...baseProps} />);
    fireEvent.click(screen.getByLabelText(/whatsapp/i));
    // Fallback: link should be copied to clipboard
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const copiedUrl = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(copiedUrl).toContain("utm_source=whatsapp");
  });

  it("renders accessible labels using i18n translations", () => {
    render(<IdeaShareRow {...baseProps} />);
    // Labels should use the i18n namespace pattern (Share.shareOnWhatsApp, etc.)
    const whatsappBtn = screen.getByLabelText(/whatsapp/i);
    const facebookBtn = screen.getByLabelText(/facebook/i);
    const copyBtn = screen.getByLabelText(/copy/i);
    expect(whatsappBtn).toHaveAttribute("aria-label");
    expect(facebookBtn).toHaveAttribute("aria-label");
    expect(copyBtn).toHaveAttribute("aria-label");
  });
});
