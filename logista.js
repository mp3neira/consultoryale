const supabase = window.supabase.createClient(
  "https://ymcjkioychfjgfexqaps.supabase.co",
  "sb_publishable_5hludyQvVRcmToSqw6EnnQ_M4N29FcE"
);

// ── Salvar novo veículo ────────────────────────────────
async function salvar() {
  const marca  = document.getElementById("marca").value.trim();
  const modelo = document.getElementById("modelo").value.trim();

  if (!marca || !modelo) {
    showToast("Preencha ao menos marca e modelo.", true);
    return;
  }

  const carro = {
    marca,
    modelo,
    ano:        document.getElementById("ano").value.trim(),
    preco:      document.getElementById("preco").value.trim(),
    km:         document.getElementById("km").value.trim(),
    cor:        document.getElementById("cor").value.trim(),
    foto:       fotoData || document.getElementById("foto").value.trim(),
    combustivel: document.getElementById("combustivel").value,
    cambio:     document.getElementById("cambio").value,
    portas:     document.getElementById("portas").value,
  };

  const { error } = await supabase.from("cars").insert(carro);

  if (error) {
    console.error(error);
    showToast("Erro ao salvar veículo.", true);
    return;
  }

  showToast("Veículo publicado! 🔥");
  limparFormulario();
  updateBadge();
}

// ── Limpar formulário após salvar ─────────────────────
function limparFormulario() {
  ["marca","modelo","ano","preco","km","cor","foto"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("combustivel").value = "Flex";
  document.getElementById("cambio").value      = "Automático";
  document.getElementById("portas").value      = "";
  document.querySelectorAll("#colorGrid .color-chip").forEach(x => x.classList.remove("selected"));
  clearPreview();
}

// ── Renderizar estoque ────────────────────────────────
async function renderEstoque() {
  const termo = (document.getElementById("estoqueSearch")?.value || "").toLowerCase().trim();

  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  let carros = data || [];

  if (termo) {
    carros = carros.filter(c =>
      [c.marca, c.modelo, c.ano, c.cor].some(v => v && v.toLowerCase().includes(termo))
    );
  }

  const container = document.getElementById("carList");
  const countEl   = document.getElementById("estoqueCount");

  if (!carros.length) {
    countEl.innerHTML = "";
    container.innerHTML = `<div class="empty-estoque">Nenhum veículo encontrado.</div>`;
    return;
  }

  countEl.innerHTML = `<strong>${carros.length}</strong> veículo${carros.length > 1 ? "s" : ""}`;

  container.innerHTML = carros.map(c => `
    <div class="car-row">
      ${c.foto
        ? `<img class="car-thumb" src="${c.foto}" alt="${c.marca}" onerror="this.style.display='none'">`
        : `<div class="car-thumb-ph">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5">
               <rect x="2" y="7" width="20" height="13" rx="2"/><path d="M16 7l-2-4H10L8 7"/>
             </svg>
           </div>`
      }
      <div class="car-info">
        <div class="car-name">${c.marca} ${c.modelo}</div>
        <div class="car-meta">${c.ano || ""}${c.km ? " · " + c.km : ""}${c.cor ? " · " + c.cor : ""}</div>
      </div>
      <div class="car-price-tag">${c.preco || "Consulte"}</div>
      <div class="car-actions">
        <button class="icon-btn edit" title="Editar" onclick="abrirEdicao(${c.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="icon-btn del" title="Excluir" onclick="pedirExclusao(${c.id}, '${(c.marca + " " + c.modelo).replace(/'/g, "\\'")}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>
  `).join("");
}

// ── updateBadge ────────────────────────────────────────
async function updateBadge() {
  const { count } = await supabase
    .from("cars")
    .select("id", { count: "exact", head: true });
  document.getElementById("tabBadge").textContent = count ?? "—";
}

updateBadge();

// ── Edição ─────────────────────────────────────────────
let editId = null;

async function abrirEdicao(id) {
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) { showToast("Erro ao carregar veículo.", true); return; }

  editId = id;

  document.getElementById("eMarca").value        = data.marca        || "";
  document.getElementById("eModelo").value       = data.modelo       || "";
  document.getElementById("eAno").value          = data.ano          || "";
  document.getElementById("eCor").value          = data.cor          || "";
  document.getElementById("ePreco").value        = data.preco        || "";
  document.getElementById("eKm").value           = data.km           || "";
  document.getElementById("eFoto").value         = (!data.foto || data.foto.startsWith("data:")) ? "" : data.foto;
  document.getElementById("eCombustivel").value  = data.combustivel  || "Flex";
  document.getElementById("eCambio").value       = data.cambio       || "Automático";
  document.getElementById("ePortas").value       = data.portas       || "";

  syncColorChip("colorGridM", data.cor || "");
  setPreviewM(data.foto || "");

  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

async function salvarEdicao() {
  if (!editId) return;

  const updates = {
    marca:       document.getElementById("eMarca").value.trim(),
    modelo:      document.getElementById("eModelo").value.trim(),
    ano:         document.getElementById("eAno").value.trim(),
    cor:         document.getElementById("eCor").value.trim(),
    preco:       document.getElementById("ePreco").value.trim(),
    km:          document.getElementById("eKm").value.trim(),
    combustivel: document.getElementById("eCombustivel").value,
    cambio:      document.getElementById("eCambio").value,
    portas:      document.getElementById("ePortas").value,
    foto:        fotoDataM || document.getElementById("eFoto").value.trim() || undefined,
  };

  // Remove campos undefined para não sobrescrever foto com null
  Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

  const { error } = await supabase.from("cars").update(updates).eq("id", editId);

  if (error) {
    console.error(error);
    showToast("Erro ao salvar alterações.", true);
    return;
  }

  fecharModal();
  renderEstoque();
  showToast("Veículo atualizado!");
}

// ── Exclusão ───────────────────────────────────────────
let deleteId = null;

function pedirExclusao(id, nome) {
  deleteId = id;
  document.getElementById("confirmDesc").textContent =
    `Excluir ${nome}? Esta ação não pode ser desfeita.`;
  document.getElementById("confirmOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

async function confirmarExclusao() {
  if (!deleteId) return;

  const { error } = await supabase.from("cars").delete().eq("id", deleteId);

  if (error) {
    console.error(error);
    showToast("Erro ao excluir.", true);
    fecharConfirm();
    return;
  }

  fecharConfirm();
  updateBadge();
  renderEstoque();
  showToast("Veículo excluído.");
}