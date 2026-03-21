// /detalhes/.js — carrega veículo ou imóvel pelo localStorage e renderiza a página

(async () => {
  if (typeof supabaseClient === 'undefined') { console.error('supabaseClient não carregado'); return; }

  const WHATSAPP = "5547999064574";

  let tipo = 'veiculo';
  let itemId = null;
  try {
    const raw = localStorage.getItem('itemSelecionado');
    if (raw) {
      const parsed = JSON.parse(raw);
      tipo   = parsed.tipo || 'veiculo';
      itemId = parsed.id;
    } else {
      itemId = localStorage.getItem('carroSelecionado');
      tipo   = 'veiculo';
    }
  } catch(e) {
    itemId = localStorage.getItem('carroSelecionado');
    tipo   = 'veiculo';
  }

  const root = document.getElementById('root');
  if (!itemId) { renderErro(root); return; }

  const tabela = tipo === 'imovel' ? 'imoveis' : 'cars';
  const { data, error } = await supabaseClient.from(tabela).select('*').eq('id', itemId).single();
  if (error || !data) { renderErro(root); return; }

  if (tipo === 'imovel') renderImovel(root, data);
  else renderVeiculo(root, data);

  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
})();

function renderVeiculo(root, c) {
  const WHATSAPP = "5547999064574";
  const fotos = (c.fotos && c.fotos.length) ? c.fotos : (c.foto ? [c.foto] : []);
  const waMsg = encodeURIComponent(`Olá! Tenho interesse no ${c.marca} ${c.modelo} ${c.ano || ''}. Poderia me passar mais informações?`);

  root.innerHTML = `
  <div class="page">
    <div class="gallery">
      ${buildGalleryHTML(fotos)}
      <div class="badge-row">
        ${c.combustivel ? `<div class="badge">${c.combustivel}</div>` : ''}
        ${c.cambio      ? `<div class="badge">${c.cambio}</div>` : ''}
        ${c.portas      ? `<div class="badge">${c.portas}</div>` : ''}
      </div>
    </div>
    <div class="info">
      <div class="eyebrow">${c.marca || ''}</div>
      <h1 class="title">${c.modelo || ''}</h1>
      <p class="subtitle">${c.ano || ''}${c.cor ? ' · ' + c.cor : ''}</p>
      <div class="price-block">
        <div class="price-label">Preço</div>
        <div class="price">${c.preco || 'Consulte'}</div>
      </div>
      <div class="specs">
        <div class="spec"><div class="spec-label">Ano</div><div class="spec-value">${c.ano || '—'}</div></div>
        <div class="spec"><div class="spec-label">Quilometragem</div><div class="spec-value">${c.km || '—'}</div></div>
        <div class="spec"><div class="spec-label">Cor</div><div class="spec-value">${c.cor || '—'}</div></div>
        <div class="spec"><div class="spec-label">Câmbio</div><div class="spec-value">${c.cambio || '—'}</div></div>
        <div class="spec"><div class="spec-label">Combustível</div><div class="spec-value">${c.combustivel || '—'}</div></div>
        <div class="spec"><div class="spec-label">Marca</div><div class="spec-value">${c.marca || '—'}</div></div>
      </div>
      ${c.descricao ? `<div class="desc-text">${c.descricao}</div>` : ''}
      <a class="btn-wa" href="https://api.whatsapp.com/send/?phone=${WHATSAPP}&text=${waMsg}&type=phone_number&app_absent=0" target="_blank">
        ${waIcon()} Falar no WhatsApp
      </a>
      <a class="btn-back" href="/painel/">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Ver todos os veículos
      </a>
    </div>
  </div>`;

  initGallery(fotos);
}

function renderImovel(root, im) {
  const WHATSAPP = "5547999064574";
  const fotos = (im.fotos && im.fotos.length) ? im.fotos : (im.foto ? [im.foto] : []);
  const waMsg = encodeURIComponent(`Olá! Tenho interesse no imóvel: ${im.titulo}${im.bairro ? ' - ' + im.bairro : ''}. Poderia me passar mais informações?`);
  const subtitulo = [im.tipo, im.bairro, im.cidade].filter(Boolean).join(' · ');

  root.innerHTML = `
  <div class="page">
    <div class="gallery">
      ${buildGalleryHTML(fotos)}
      <div class="badge-row">
        ${im.tipo   ? `<div class="badge">${im.tipo}</div>` : ''}
        ${im.area   ? `<div class="badge">${im.area}</div>` : ''}
        ${im.cidade ? `<div class="badge">${im.cidade}</div>` : ''}
      </div>
    </div>
    <div class="info">
      <div class="eyebrow">${im.tipo || 'Imóvel'}</div>
      <h1 class="title">${im.titulo || ''}</h1>
      <p class="subtitle">${subtitulo}</p>
      <div class="price-block">
        <div class="price-label">Preço</div>
        <div class="price">${im.preco || 'Consulte'}</div>
      </div>
      <div class="specs">
        <div class="spec"><div class="spec-label">Tipo</div><div class="spec-value">${im.tipo || '—'}</div></div>
        <div class="spec"><div class="spec-label">Área</div><div class="spec-value">${im.area || '—'}</div></div>
        <div class="spec"><div class="spec-label">Quartos</div><div class="spec-value">${im.quartos || '—'}</div></div>
        <div class="spec"><div class="spec-label">Banheiros</div><div class="spec-value">${im.banheiros || '—'}</div></div>
        <div class="spec"><div class="spec-label">Vagas</div><div class="spec-value">${im.vagas || '—'}</div></div>
        <div class="spec"><div class="spec-label">Bairro</div><div class="spec-value">${im.bairro || '—'}</div></div>
      </div>
      ${im.descricao ? `<div class="desc-text">${im.descricao}</div>` : ''}
      <a class="btn-wa" href="https://api.whatsapp.com/send/?phone=${WHATSAPP}&text=${waMsg}&type=phone_number&app_absent=0" target="_blank">
        ${waIcon()} Falar no WhatsApp
      </a>
      <a class="btn-back" href="/painel/">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Ver todos os imóveis
      </a>
    </div>
  </div>`;

  initGallery(fotos);
}

function buildGalleryHTML(fotos) {
  if (!fotos.length) {
    return `<div class="no-img"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(128,128,128,0.3)" stroke-width="1"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M16 7l-2-4H10L8 7"/></svg></div>`;
  }
  const thumbs = fotos.length > 1 ? `
    <div class="thumbnails">
      ${fotos.map((f, i) => `<img class="thumb${i===0?' active':''}" src="${f}" alt="Foto ${i+1}" onclick="setFotoAtiva(${i})" loading="lazy">`).join('')}
    </div>` : '';
  return `
    <div class="main-img-wrap">
      <img class="main-img" id="mainImg" src="${fotos[0]}" alt="Foto principal">
      ${fotos.length > 1 ? `
        <button class="gallery-arrow prev hidden" id="galleryPrev" onclick="galeriaPrev()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button class="gallery-arrow next" id="galleryNext" onclick="galeriaNext()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <div class="photo-count" id="photoCount">1 / ${fotos.length}</div>
      ` : ''}
    </div>
    ${thumbs}`;
}

function initGallery(fotos) {
  window.galeriaFotos = fotos;
  window.galeriaIdx   = 0;
}

function renderErro(root) {
  root.innerHTML = `
  <div class="error-page">
    <h2>Item não encontrado</h2>
    <p style="color:var(--muted);margin-bottom:24px">Este item pode não estar mais disponível.</p>
    <a class="btn-back" href="/painel/" style="max-width:200px;display:inline-flex">Ver estoque</a>
  </div>`;
}

function waIcon() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
}