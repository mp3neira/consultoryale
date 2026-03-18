const supabaseClient = window.supabase.createClient(
  "https://ymcjkioychfjgfexqaps.supabase.co",
  "sb_publishable_5hludyQvVRcmToSqw6EnnQ_M4N29FcE"
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

  // Popula o array global usado pelo HTML
  carros = data || [];

  // Monta o filtro de marcas com os dados reais
  const sel = document.getElementById("filterMarca");
  // Remove opções antigas (mantém só a primeira "Todas as marcas")
  while (sel.options.length > 1) sel.remove(1);

  const marcas = [...new Set(carros.map(c => c.marca).filter(Boolean))].sort();
  marcas.forEach(m => {
    const o = document.createElement("option");
    o.value = m;
    o.textContent = m;
    sel.appendChild(o);
  });

  filtrar();
}

carregarCars();