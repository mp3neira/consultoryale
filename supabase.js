const supabaseClient = window.supabase.createClient(
  "https://apnlrxcmdkhwixtnfekg.supabase.co",
  "sb_publishable_qtx6d8pZf39dCNFXKscTRA_bD1pFcrN"
);

async function carregarCars() {
  const { data, error } = await supabaseClient
    .from("cars")
    .select("*")
    .order("id", { ascending: false });
  if (error) {
    console.error("Erro ao carregar veículos:", error);
    return;
  }
  carros = data || [];
  const sel = document.getElementById("filterMarca");
  if (sel) {
    while (sel.options.length > 1) sel.remove(1);
    const marcas = [...new Set(carros.map(c => c.marca).filter(Boolean))].sort();
    marcas.forEach(m => {
      const o = document.createElement("option");
      o.value = m;
      o.textContent = m;
      sel.appendChild(o);
    });
  }
  if (typeof filtrar === 'function') filtrar();
}

async function carregarImoveis() {
  const { data, error } = await supabaseClient
    .from("imoveis")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Erro ao carregar imóveis:", error);
    return;
  }
  imoveis = data || [];
}

// ⚠️ NÃO chamar carregarCars/carregarImoveis aqui.
// Cada página chama o que precisa no seu próprio .js.