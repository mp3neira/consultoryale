// logista.js — lógica Supabase para veículos e imóveis
// Requer supabase.js carregado antes (expõe supabaseClient)

(async () => {
  if (typeof supabaseClient === 'undefined') {
    console.error('supabaseClient não encontrado. Verifique supabase.js');
    return;
  }

  // ── Estado ────────────────────────────────────────────
  let carros   = [];
  let imoveis  = [];
  let editandoId   = null;
  let editandoTipo = null;
  let deletandoId   = null;
  let deletandoTipo = null;

  // ══════════════════════════════════════════════════════
  // CONVERTER FOTOS PARA BASE64 (sem Storage)
  // ══════════════════════════════════════════════════════
  async function uploadFotos(files) {
    const base64s = [];
    for (const file of files) {
      const b64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      base64s.push(b64);
    }
    return base64s;
  }

  // ══════════════════════════════════════════════════════
  // CARREGAR DADOS
  // ══════════════════════════════════════════════════════
  async function carregarCarros() {
    const { data, error } = await supabaseClient
      .from('cars')
      .select('*')
      .order('id', { ascending: false });
    if (error) { console.error(error); return; }
    carros = data || [];
    atualizarBadge();
    const sel = document.getElementById('filterMarca');
    if (sel) {
      while (sel.options.length > 1) sel.remove(1);
      const marcas = [...new Set(carros.map(c => c.marca).filter(Boolean))].sort();
      marcas.forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; sel.appendChild(o); });
    }
    if (document.getElementById('panelEstoque')?.style.display !== 'none') renderEstoque();
  }

  async function carregarImoveis() {
    const { data, error } = await supabaseClient
      .from('imoveis')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    imoveis = data || [];
    atualizarBadge();
    if (document.getElementById('panelEstoque')?.style.display !== 'none') renderEstoque();
  }

  function atualizarBadge() {
    const badge = document.getElementById('tabBadge');
    if (badge) badge.textContent = carros.length + imoveis.length;
  }

  // ══════════════════════════════════════════════════════
  // SALVAR VEÍCULO
  // ══════════════════════════════════════════════════════
  window.salvar = async function() {
    const marca  = document.getElementById('marca').value.trim();
    const modelo = document.getElementById('modelo').value.trim();
    if (!marca || !modelo) { showToast('Preencha marca e modelo', true); return; }

    const files = window.fotoFilesMap?.veiculo || [];
    if (files.length > 0) showToast('Processando fotos…');

    const fotos = await uploadFotos(files);

    const obj = {
      marca, modelo,
      ano:         document.getElementById('ano').value.trim() || null,
      combustivel: document.getElementById('combustivel').value,
      cambio:      document.getElementById('cambio').value,
      portas:      document.getElementById('portas').value || null,
      cor:         document.getElementById('cor').value.trim() || null,
      preco:       document.getElementById('preco').value.trim() || null,
      km:          document.getElementById('km').value.trim() || null,
      fotos, foto: fotos[0] || null,
    };

    const { error } = await supabaseClient.from('cars').insert([obj]);
    if (error) { showToast('Erro ao salvar: ' + error.message, true); return; }

    showToast('Veículo publicado!');
    limparFormVeiculo();
    await carregarCarros();
  };

  // ══════════════════════════════════════════════════════
  // SALVAR IMÓVEL
  // ══════════════════════════════════════════════════════
  window.salvarImovel = async function() {
    const titulo = document.getElementById('im_titulo').value.trim();
    if (!titulo) { showToast('Preencha o título do imóvel', true); return; }

    const files = window.fotoFilesMap?.imovel || [];
    if (files.length > 0) showToast('Processando fotos…');

    const fotos = await uploadFotos(files);

    const gIm = id => document.getElementById(id)?.value?.trim() || null;
    const obj = {
      titulo,
      tipo:      document.getElementById('im_tipo')?.value || null,
      bairro:    gIm('im_bairro'),
      cidade:    gIm('im_cidade'),
      area:      gIm('im_area'),
      quartos:   document.getElementById('im_quartos')?.value || null,
      banheiros: document.getElementById('im_banheiros')?.value || null,
      vagas:     gIm('im_vagas'),
      preco:     gIm('im_preco'),
      descricao: gIm('im_descricao'),
      fotos, foto: fotos[0] || null,
    };

    const { error } = await supabaseClient.from('imoveis').insert([obj]);
    if (error) { showToast('Erro ao salvar: ' + error.message, true); return; }

    showToast('Imóvel publicado!');
    limparFormImovel();
    await carregarImoveis();
  };

  // ══════════════════════════════════════════════════════
  // EDITAR — abrir modais
  // ══════════════════════════════════════════════════════
  window.abrirModalVeiculo = function(id) {
    const c = carros.find(x => String(x.id) === String(id));
    if (!c) return;
    editandoId   = id;
    editandoTipo = 'veiculo';

    document.getElementById('eMarca').value       = c.marca || '';
    document.getElementById('eModelo').value      = c.modelo || '';
    document.getElementById('eAno').value         = c.ano || '';
    document.getElementById('eCombustivel').value = c.combustivel || 'Flex';
    document.getElementById('eCambio').value      = c.cambio || 'Automático';
    document.getElementById('ePortas').value      = c.portas || '';
    document.getElementById('eCor').value         = c.cor || '';
    document.getElementById('ePreco').value       = c.preco || '';
    document.getElementById('eKm').value          = c.km || '';

    if (typeof syncColorChip === 'function') syncColorChip('colorGridM', c.cor);
    mostrarFotosExistentes('modal_veiculo', c.fotos || (c.foto ? [c.foto] : []));
    if (window.fotoFilesMap) window.fotoFilesMap.modal_veiculo = [];

    document.getElementById('modalVeiculo').style.display = 'block';
    document.getElementById('modalImovel').style.display  = 'none';
    document.getElementById('modalTitulo').textContent    = 'Editar Veículo';
    document.getElementById('modalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.abrirModalImovel = function(id) {
    const im = imoveis.find(x => String(x.id) === String(id));
    if (!im) return;
    editandoId   = id;
    editandoTipo = 'imovel';

    const s = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    s('eImTitulo',    im.titulo);
    s('eImTipo',      im.tipo);
    s('eImBairro',    im.bairro);
    s('eImCidade',    im.cidade);
    s('eImArea',      im.area);
    s('eImQuartos',   im.quartos);
    s('eImBanheiros', im.banheiros);
    s('eImVagas',     im.vagas);
    s('eImPreco',     im.preco);
    s('eImdescricao', im.descricao);

    mostrarFotosExistentes('modal_imovel', im.fotos || (im.foto ? [im.foto] : []));
    if (window.fotoFilesMap) window.fotoFilesMap.modal_imovel = [];

    document.getElementById('modalVeiculo').style.display = 'none';
    document.getElementById('modalImovel').style.display  = 'block';
    document.getElementById('modalTitulo').textContent    = 'Editar Imóvel';
    document.getElementById('modalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  function mostrarFotosExistentes(ctx, fotosExistentes) {
    const cfgMap = {
      modal_veiculo: { previews: 'previewsModalVeiculo', count: 'countModalVeiculo' },
      modal_imovel:  { previews: 'previewsModalImovel',  count: 'countModalImovel'  },
    };
    const cfg = cfgMap[ctx];
    if (!cfg) return;
    window[`_fotosExistentes_${ctx}`] = fotosExistentes;

    const el = document.getElementById(cfg.previews);
    if (!el) return;

    let html = fotosExistentes.map((url, i) => `
      <div class="foto-preview-item">
        <img src="${url}" alt="Foto ${i+1}">
        ${i === 0 ? '<div class="foto-badge">Capa</div>' : ''}
      </div>`).join('');
    for (let i = fotosExistentes.length; i < 5; i++) html += `<div class="foto-preview-empty">+</div>`;
    el.innerHTML = html;
    el.style.display = 'grid';

    const countEl = document.getElementById(cfg.count);
    if (countEl) {
      countEl.style.display = 'block';
      countEl.innerHTML = `<span>${fotosExistentes.length}</span> / 5 fotos salvas · <em style="opacity:.6">Selecione novas para substituir</em>`;
    }
  }

  // ══════════════════════════════════════════════════════
  // SALVAR EDIÇÃO
  // ══════════════════════════════════════════════════════
  window.salvarEdicao = async function() {
    if (!editandoId) return;
    if (editandoTipo === 'veiculo') await salvarEdicaoVeiculo();
    else await salvarEdicaoImovel();
  };

  async function salvarEdicaoVeiculo() {
    const newFiles = window.fotoFilesMap?.modal_veiculo || [];
    let fotos;
    if (newFiles.length > 0) {
      showToast('Processando fotos…');
      fotos = await uploadFotos(newFiles);
    } else {
      fotos = window._fotosExistentes_modal_veiculo || [];
    }

    const obj = {
      marca:       document.getElementById('eMarca').value.trim(),
      modelo:      document.getElementById('eModelo').value.trim(),
      ano:         document.getElementById('eAno').value.trim() || null,
      combustivel: document.getElementById('eCombustivel').value,
      cambio:      document.getElementById('eCambio').value,
      portas:      document.getElementById('ePortas').value || null,
      cor:         document.getElementById('eCor').value.trim() || null,
      preco:       document.getElementById('ePreco').value.trim() || null,
      km:          document.getElementById('eKm').value.trim() || null,
      fotos, foto: fotos[0] || null,
    };

    const { error } = await supabaseClient.from('cars').update(obj).eq('id', editandoId);
    if (error) { showToast('Erro: ' + error.message, true); return; }
    showToast('Veículo atualizado!');
    fecharModal();
    await carregarCarros();
  }

  async function salvarEdicaoImovel() {
    const newFiles = window.fotoFilesMap?.modal_imovel || [];
    let fotos;
    if (newFiles.length > 0) {
      showToast('Processando fotos…');
      fotos = await uploadFotos(newFiles);
    } else {
      fotos = window._fotosExistentes_modal_imovel || [];
    }

    const gEIm = id => document.getElementById(id)?.value?.trim() || null;
    const obj = {
      titulo:    gEIm('eImTitulo') || '',
      tipo:      document.getElementById('eImTipo')?.value || null,
      bairro:    gEIm('eImBairro'),
      cidade:    gEIm('eImCidade'),
      area:      gEIm('eImArea'),
      quartos:   document.getElementById('eImQuartos')?.value || null,
      banheiros: document.getElementById('eImBanheiros')?.value || null,
      vagas:     gEIm('eImVagas'),
      preco:     gEIm('eImPreco'),
      descricao: gEIm('eImdescricao'),
      fotos, foto: fotos[0] || null,
    };

    const { error } = await supabaseClient.from('imoveis').update(obj).eq('id', editandoId);
    if (error) { showToast('Erro: ' + error.message, true); return; }
    showToast('Imóvel atualizado!');
    fecharModal();
    await carregarImoveis();
  }

  // ══════════════════════════════════════════════════════
  // EXCLUIR
  // ══════════════════════════════════════════════════════
  window.pedirExclusao = function(id, tipo, nome) {
    deletandoId   = id;
    deletandoTipo = tipo;
    const desc = document.getElementById('confirmDesc');
    if (desc) desc.textContent = `Excluir "${nome}"? Esta ação não pode ser desfeita.`;
    document.getElementById('confirmOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.confirmarExclusao = async function() {
    const tabela = deletandoTipo === 'imovel' ? 'imoveis' : 'cars';
    const { error } = await supabaseClient.from(tabela).delete().eq('id', deletandoId);
    if (error) { showToast('Erro: ' + error.message, true); return; }
    showToast('Item excluído.');
    fecharConfirm();
    if (deletandoTipo === 'imovel') await carregarImoveis();
    else await carregarCarros();
  };

  // ══════════════════════════════════════════════════════
  // ESTOQUE — RENDERIZAR
  // ══════════════════════════════════════════════════════
  window.renderEstoque = function() {
    const tab = document.getElementById('estoqueTabAtiva')?.value || 'veiculos';
    if (tab === 'imoveis') renderEstoqueImoveis();
    else renderEstoqueCarros();
  };

  function renderEstoqueCarros() {
    const termo = (document.getElementById('estoqueSearch')?.value || '').toLowerCase().trim();
    let lista = carros;
    if (termo) lista = lista.filter(c =>
      [c.marca, c.modelo, c.ano, c.cor].some(v => v && v.toLowerCase().includes(termo))
    );
    const count = document.getElementById('estoqueCount');
    if (count) count.innerHTML = `<strong>${lista.length}</strong> veículo${lista.length !== 1 ? 's' : ''}`;
    const el = document.getElementById('carList');
    if (!el) return;
    if (!lista.length) { el.innerHTML = `<div class="empty-estoque">Nenhum veículo cadastrado.</div>`; return; }
    el.innerHTML = lista.map(c => {
      const thumb = c.fotos?.[0] || c.foto || '';
      return `<div class="car-row">
        ${thumb ? `<img class="car-thumb" src="${thumb}" loading="lazy">` : `<div class="car-thumb-ph"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M16 7l-2-4H10L8 7"/></svg></div>`}
        <div class="car-info"><div class="car-name">${c.marca} ${c.modelo}</div><div class="car-meta">${c.ano||''}${c.km?' · '+c.km:''}${c.cor?' · '+c.cor:''}</div></div>
        <div class="car-price-tag">${c.preco||'—'}</div>
        <div class="car-actions">
          <button class="icon-btn edit" onclick="abrirModalVeiculo('${c.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="icon-btn del" onclick="pedirExclusao('${c.id}','veiculo','${c.marca} ${c.modelo}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
        </div></div>`;
    }).join('');
  }

  function renderEstoqueImoveis() {
    const termo = (document.getElementById('estoqueSearch')?.value || '').toLowerCase().trim();
    let lista = imoveis;
    if (termo) lista = lista.filter(i =>
      [i.titulo, i.tipo, i.bairro, i.cidade].some(v => v && v.toLowerCase().includes(termo))
    );
    const count = document.getElementById('estoqueCount');
    if (count) count.innerHTML = `<strong>${lista.length}</strong> imóvel${lista.length !== 1 ? 'is' : ''}`;
    const el = document.getElementById('carList');
    if (!el) return;
    if (!lista.length) { el.innerHTML = `<div class="empty-estoque">Nenhum imóvel cadastrado.</div>`; return; }
    el.innerHTML = lista.map(im => {
      const thumb = im.fotos?.[0] || im.foto || '';
      return `<div class="car-row">
        ${thumb ? `<img class="car-thumb" src="${thumb}" loading="lazy">` : `<div class="car-thumb-ph"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div>`}
        <div class="car-info"><div class="car-name">${im.titulo}</div><div class="car-meta">${im.tipo||''}${im.bairro?' · '+im.bairro:''}${im.cidade?' · '+im.cidade:''}</div></div>
        <div class="car-price-tag">${im.preco||'—'}</div>
        <div class="car-actions">
          <button class="icon-btn edit" onclick="abrirModalImovel('${im.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="icon-btn del" onclick="pedirExclusao('${im.id}','imovel','${im.titulo}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>
        </div></div>`;
    }).join('');
  }

  // ── Limpar forms ──────────────────────────────────────
  function limparFormVeiculo() {
    ['marca','modelo','ano','cor','preco','km'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
    document.querySelectorAll('#colorGrid .color-chip').forEach(x => x.classList.remove('selected'));
    if (window.fotoFilesMap) { window.fotoFilesMap.veiculo = []; if (typeof renderPreviews === 'function') renderPreviews('veiculo'); }
  }

  function limparFormImovel() {
    ['im_titulo','im_bairro','im_cidade','im_area','im_vagas','im_preco','im_descricao'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
    if (window.fotoFilesMap) { window.fotoFilesMap.imovel = []; if (typeof renderPreviews === 'function') renderPreviews('imovel'); }
  }

  // ── Init ──────────────────────────────────────────────
  await carregarCarros();
  await carregarImoveis();

  const searchEl = document.getElementById('estoqueSearch');
  if (searchEl) searchEl.addEventListener('input', () => renderEstoque());

})();