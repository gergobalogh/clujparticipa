import { describe, expect, it } from "vitest";
import { routing } from "../routing";

describe("i18n routing", () => {
  it("localizes the How It Works pathname for Romanian and Hungarian", () => {
    expect(routing.pathnames["/how-it-works"]).toEqual({
      ro: "/cum-functioneaza",
      hu: "/hogyan-mukodik",
      en: "/how-it-works",
    });
  });

  it("localizes the login pathname for all supported locales", () => {
    expect(routing.pathnames["/login"]).toEqual({
      ro: "/autentificare",
      hu: "/bejelentkezes",
      en: "/sign-in",
    });
  });
});
