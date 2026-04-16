(function attachUtils(global) {
  const Kanban = (global.Kanban = global.Kanban || {});

  function createId(prefix) {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return prefix + "-" + global.crypto.randomUUID();
    }

    return (
      prefix +
      "-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function formatCardCount(count) {
    return count === 1 ? "1 card" : count + " cards";
  }

  const CARD_COLOR_OPTIONS = Object.freeze([
    Object.freeze({ label: "Padrao", value: "" }),
    Object.freeze({ label: "Areia", value: "#d9c6ae" }),
    Object.freeze({ label: "Terracota", value: "#cf8d66" }),
    Object.freeze({ label: "Mel", value: "#d8ad5c" }),
    Object.freeze({ label: "Sage", value: "#9bae8a" }),
    Object.freeze({ label: "Verde", value: "#7ba488" }),
    Object.freeze({ label: "Azul", value: "#86a8c4" }),
    Object.freeze({ label: "Rosa", value: "#d7a0b5" }),
  ]);

  function normalizeHexColor(value) {
    if (typeof value !== "string") {
      return "";
    }

    const trimmedValue = value.trim();
    const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(trimmedValue);

    if (shortHexMatch) {
      return (
        "#" +
        shortHexMatch[1]
          .split("")
          .map(function duplicateDigit(digit) {
            return digit + digit;
          })
          .join("")
          .toLowerCase()
      );
    }

    if (/^#[0-9a-f]{6}$/i.test(trimmedValue)) {
      return trimmedValue.toLowerCase();
    }

    return "";
  }

  function tintHexColor(hexColor, whiteRatio) {
    const normalizedColor = normalizeHexColor(hexColor);

    if (!normalizedColor) {
      return "";
    }

    const clampedRatio = Math.min(Math.max(whiteRatio, 0), 1);
    const colorChannels = [1, 3, 5].map(function mapChannel(index) {
      return Number.parseInt(normalizedColor.slice(index, index + 2), 16);
    });

    const tintedChannels = colorChannels.map(function tintChannel(channel) {
      return Math.round(channel + (255 - channel) * clampedRatio);
    });

    return (
      "#" +
      tintedChannels
        .map(function formatChannel(channel) {
          return channel.toString(16).padStart(2, "0");
        })
        .join("")
    );
  }

  Kanban.utils = {
    cardColorOptions: CARD_COLOR_OPTIONS,
    createId,
    formatCardCount,
    normalizeHexColor,
    normalizeText,
    tintHexColor,
  };
})(window);
