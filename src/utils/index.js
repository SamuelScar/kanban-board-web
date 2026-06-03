export function criarId(prefixo) {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return prefixo + "-" + window.crypto.randomUUID();
  }
  return prefixo + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export function normalizarTexto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

export function formatarQuantidadeCartoes(quantidade) {
  return quantidade === 1 ? "1 cartao" : quantidade + " cartoes";
}

export const OPCOES_COR_CARTAO = Object.freeze([
  Object.freeze({ rotulo: "Padrao", valor: "" }),
  Object.freeze({ rotulo: "Areia", valor: "#d9c6ae" }),
  Object.freeze({ rotulo: "Terracota", valor: "#cf8d66" }),
  Object.freeze({ rotulo: "Mel", valor: "#d8ad5c" }),
  Object.freeze({ rotulo: "Sage", valor: "#9bae8a" }),
  Object.freeze({ rotulo: "Verde", valor: "#7ba488" }),
  Object.freeze({ rotulo: "Azul", valor: "#86a8c4" }),
  Object.freeze({ rotulo: "Rosa", valor: "#d7a0b5" }),
]);

export function normalizarCorHexadecimal(valor) {
  if (typeof valor !== "string") {
    return "";
  }
  const valorSemEspacos = valor.trim();
  const correspondenciaHexCurto = /^#([0-9a-f]{3})$/i.exec(valorSemEspacos);
  if (correspondenciaHexCurto) {
    return "#" + correspondenciaHexCurto[1].split("").map((digito) => digito + digito).join("").toLowerCase();
  }
  if (/^#[0-9a-f]{6}$/i.test(valorSemEspacos)) {
    return valorSemEspacos.toLowerCase();
  }
  return "";
}

export function clarearCorHexadecimal(corHexadecimal, proporcaoBranco) {
  const corNormalizada = normalizarCorHexadecimal(corHexadecimal);
  if (!corNormalizada) return "";
  const proporcaoLimitada = Math.min(Math.max(proporcaoBranco, 0), 1);
  const canaisCor = [1, 3, 5].map((indice) => Number.parseInt(corNormalizada.slice(indice, indice + 2), 16));
  const canaisClareados = canaisCor.map((canal) => Math.round(canal + (255 - canal) * proporcaoLimitada));
  return "#" + canaisClareados.map((canal) => canal.toString(16).padStart(2, "0")).join("");
}
