const STORAGE_PREVIEW = "cardapio_menu_preview_v1";

function isValidMenuShape(data) {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.categories) &&
    data.categories.length > 0
  );
}

export async function loadMenuData() {
  try {
    const prev = localStorage.getItem(STORAGE_PREVIEW);
    if (prev) {
      const parsed = JSON.parse(prev);
      if (isValidMenuShape(parsed)) return parsed;
      try {
        localStorage.removeItem(STORAGE_PREVIEW);
      } catch (e2) {}
    }
  } catch (e) {
    try {
      localStorage.removeItem(STORAGE_PREVIEW);
    } catch (e2) {}
  }
  const jsonUrl = new URL("data/menu-data.json", window.location.href);
  const res = await fetch(jsonUrl.href, { cache: "no-store" });
  if (!res.ok) throw new Error("Não foi possível carregar o cardápio.");
  return res.json();
}
