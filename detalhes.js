const supabaseClient = window.supabase.createClient(
  "https://ymcjkioychfjgfexqaps.supabase.co",
  "sb_publishable_5hludyQvVRcmToSqw6EnnQ_M4N29FcE"
);

const WHATSAPP = "5547999064574";

async function carregarDetalhe() {
  const id   = localStorage.getItem("carroSelecionado");
  const root = document.getElementById("root");

  if (!id) {
    root.innerHTML = erroHTML("Nenhum veículo selecionado.");
    return;
  }

  const { data: c, error } = await supabaseClient
    .from("cars")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !c) {
    root.innerHTML = erroHTML("Veículo não encontrado ou não está mais disponível.");
    return;
  }

  const waMsg = encodeURIComponent(
    `Olá! Tenho interesse no ${c.marca} ${c.modelo} ${c.ano || ""}. Poderia me passar mais informações?`
  );

  root.innerHTML = `
    <div class="page">
      <!-- Coluna esquerda: imagem -->
      <div class="gallery">
        ${c.foto
          ? `<img class="main-img" src="${c.foto}" alt="${c.marca} ${c.modelo}">`
          : `<div class="no-img">
               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1">
                 <rect x="2" y="7" width="20" height="13" rx="2"/>
                 <path d="M16 7l-2-4H10L8 7"/>
               </svg>
             </div>`
        }
        <div class="badge-row">
          ${c.combustivel ? `<div class="badge">${c.combustivel}</div>` : ""}
          ${c.cambio      ? `<div class="badge">${c.cambio}</div>`      : ""}
          ${c.portas      ? `<div class="badge">${c.portas}</div>`      : ""}
        </div>
      </div>

      <!-- Coluna direita: info -->
      <div class="info">
        <div class="eyebrow">${c.marca}</div>
        <h1 class="title">${c.modelo}</h1>
        <p class="subtitle">${c.ano || ""}${c.cor ? " · " + c.cor : ""}</p>

        <div class="price-block">
          <div class="price-label">Preço</div>
          <div class="price">${c.preco || "Consulte"}</div>
        </div>

        <div class="specs">
          <div class="spec">
            <div class="spec-label">Ano</div>
            <div class="spec-value">${c.ano || "—"}</div>
          </div>
          <div class="spec">
            <div class="spec-label">Quilometragem</div>
            <div class="spec-value">${c.km || "—"}</div>
          </div>
          <div class="spec">
            <div class="spec-label">Cor</div>
            <div class="spec-value">${c.cor || "—"}</div>
          </div>
          <div class="spec">
            <div class="spec-label">Câmbio</div>
            <div class="spec-value">${c.cambio || "—"}</div>
          </div>
          <div class="spec">
            <div class="spec-label">Combustível</div>
            <div class="spec-value">${c.combustivel || "—"}</div>
          </div>
          <div class="spec">
            <div class="spec-label">Portas</div>
            <div class="spec-value">${c.portas || "—"}</div>
          </div>
        </div>

        ${c.desc ? `<div class="desc-text visible">${c.desc}</div>` : ""}

        <a class="btn-wa"
           href="https://api.whatsapp.com/send/?phone=${WHATSAPP}&text=${waMsg}&type=phone_number&app_absent=0"
           target="_blank">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Falar no WhatsApp
        </a>

        <a class="btn-back" href="index.html">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Ver todos os veículos
        </a>
      </div>
    </div>`;
}

function erroHTML(msg) {
  return `
    <div class="error-page">
      <h2>Veículo não encontrado</h2>
      <p style="color:var(--muted);margin-bottom:24px">${msg}</p>
      <a class="btn-back" href="index.html" style="max-width:200px;display:inline-flex;align-items:center;gap:8px;padding:14px 24px;background:transparent;color:var(--muted);border:1px solid var(--border);border-radius:14px;text-decoration:none;font-size:13px">
        Ver estoque
      </a>
    </div>`;
}

carregarDetalhe();
