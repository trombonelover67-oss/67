const CARDS = [
  { id:"knight", name:"Knight", type:"troop", elixir:3 },
  { id:"archers", name:"Archers", type:"troop", elixir:3 },
  { id:"goblins", name:"Goblins", type:"troop", elixir:2 },
  { id:"minions", name:"Minions", type:"troop", elixir:3 },
  { id:"hog-rider", name:"Hog Rider", type:"troop", elixir:4 },
  { id:"giant", name:"Giant", type:"troop", elixir:5 },
  { id:"musketeer", name:"Musketeer", type:"troop", elixir:4 },
  { id:"baby-dragon", name:"Baby Dragon", type:"troop", elixir:4 },

  { id:"fireball", name:"Fireball", type:"spell", elixir:4 },
  { id:"arrows", name:"Arrows", type:"spell", elixir:3 },
  { id:"zap", name:"Zap", type:"spell", elixir:2 },
  { id:"log", name:"The Log", type:"spell", elixir:2 },

  { id:"cannon", name:"Cannon", type:"building", elixir:3 },
  { id:"tesla", name:"Tesla", type:"building", elixir:4 },
];

const featured = ["hog-rider","fireball","cannon","musketeer","knight","archers","zap","goblins"];

const els = {
  year: document.getElementById("year"),
  featuredDeck: document.getElementById("featuredDeck"),
  useFeaturedBtn: document.getElementById("useFeaturedBtn"),

  deckSlots: document.getElementById("deckSlots"),
  clearDeckBtn: document.getElementById("clearDeckBtn"),
  copyDeckBtn: document.getElementById("copyDeckBtn"),

  cardSearch: document.getElementById("cardSearch"),
  cardList: document.getElementById("cardList"),

  browserSearch: document.getElementById("browserSearch"),
  browserGrid: document.getElementById("browserGrid"),
  countText: document.getElementById("countText"),
};

els.year.textContent = new Date().getFullYear();

let activeType = "all";
let pickQuery = "";
let browseQuery = "";
let deck = []; // store card ids

function cardById(id){ return CARDS.find(c => c.id === id); }

function renderFeatured(){
  els.featuredDeck.innerHTML = featured.map(id => {
    const c = cardById(id);
    return `<div class="slot"><strong>${c?.name ?? id}</strong><div class="meta">${c?.type ?? ""} • ${c?.elixir ?? "?"} elixir</div></div>`;
  }).join("");
}

function renderDeck(){
  const slots = Array.from({length: 8}).map((_, i) => deck[i] ? cardById(deck[i]) : null);

  els.deckSlots.innerHTML = slots.map((c, i) => {
    if(!c) return `<div class="slot"><strong>Empty</strong><div class="meta">Pick a card</div></div>`;
    return `<div class="slot" data-remove="${i}">
      <strong>${c.name}</strong>
      <div class="meta">${c.type} • ${c.elixir} elixir</div>
      <div class="meta">(click to remove)</div>
    </div>`;
  }).join("");

  document.querySelectorAll("[data-remove]").forEach(el => {
    el.addEventListener("click", () => {
      const idx = Number(el.dataset.remove);
      deck.splice(idx, 1);
      renderDeck();
    });
  });
}

function renderPicker(){
  const list = CARDS.filter(c => {
    const typeOk = activeType === "all" || c.type === activeType;
    const q = pickQuery.toLowerCase();
    const qOk = !q || c.name.toLowerCase().includes(q) || c.type.includes(q);
    return typeOk && qOk;
  });

  els.cardList.innerHTML = list.map(c => `
    <button class="pick" data-pick="${c.id}">
      <strong>${c.name}</strong>
      <div class="meta">${c.type} • ${c.elixir} elixir</div>
    </button>
  `).join("");

  document.querySelectorAll("[data-pick]").forEach(btn => {
    btn.addEventListener("click", () => {
      if(deck.includes(btn.dataset.pick)) return;
      if(deck.length >= 8) return;
      deck.push(btn.dataset.pick);
      renderDeck();
    });
  });
}

function renderBrowser(){
  const q = browseQuery.toLowerCase().trim();
  const list = CARDS.filter(c => !q || c.name.toLowerCase().includes(q) || c.type.includes(q));
  els.countText.textContent = `${list.length} cards shown`;
  els.browserGrid.innerHTML = list.map(c => `
    <div class="card">
      <h4>${c.name}</h4>
      <div class="meta">Type: ${c.type}</div>
      <div class="meta">Elixir: ${c.elixir}</div>
    </div>
  `).join("");
}

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
    chip.classList.add("active");
    activeType = chip.dataset.type;
    renderPicker();
  });
});

els.cardSearch.addEventListener("input", e => { pickQuery = e.target.value; renderPicker(); });
els.browserSearch.addEventListener("input", e => { browseQuery = e.target.value; renderBrowser(); });

els.clearDeckBtn.addEventListener("click", () => { deck = []; renderDeck(); });
els.copyDeckBtn.addEventListener("click", async () => {
  const names = deck.map(id => cardById(id)?.name ?? id);
  const text = `My Royale Hub deck (${deck.length}/8):\n- ` + names.join("\n- ");
  try {
    await navigator.clipboard.writeText(text);
    els.copyDeckBtn.textContent = "Copied!";
    setTimeout(() => els.copyDeckBtn.textContent = "Copy", 900);
  } catch {
    alert(text);
  }
});

els.useFeaturedBtn.addEventListener("click", () => {
  deck = [...featured];
  renderDeck();
  location.hash = "#decks";
});

renderFeatured();
renderDeck();
renderPicker();
renderBrowser();
