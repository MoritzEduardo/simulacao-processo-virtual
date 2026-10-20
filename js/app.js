const movements = [
  {id:"summary", index:"—", title:"Resumo do processo", filename:"Resumo", signer:"Sistema acadêmico", type:"summary"},
  {id:"1.0", index:"Mov. 1.0", title:"Petição Inicial", filename:"PETIÇÃO INICIAL (mov. 1.0).pdf", signer:"Nathalia"},
  {id:"1.1", index:"Mov. 1.1", title:"Relatório preliminar de vistoria", filename:"Documento 1 (mov. 1.1).pdf", signer:"Nathalia"},
  {id:"1.2", index:"Mov. 1.2", title:"Laudo de analise fisico-quimica da agua", filename:"Documento 2 (mov. 1.2).pdf", signer:"Nathalia"},
  {id:"1.3", index:"Mov. 1.3", title:"Relatório Metereologico e hidrológico", filename:"Documento 7 (mov. 1.3).pdf", signer:"Nathalia"},
  {id:"1.4", index:"Mov. 1.4", title:"Declaração de João Ferreira", filename:"Documento 9 (mov. 1.4).pdf", signer:"Nathalia"},
  {id:"1.5", index:"Mov. 1.5", title:"Relatório fotográfico de vistoria ambiental", filename:"Documento 10 (mov. 1.5).pdf", signer:"Nathalia"},
  {id:"2.0", index:"Mov. 2.0", title:"Despacho Inicial", filename:"DESPACHO INICIAL (mov. 2).pdf", signer:"Eduardo"},
  {id:"3.0", index:"Mov. 3.0", title:"Manifestação Ministerial", filename:"MANIFESTAÇÃO MINISTERIAL (mov. 3).pdf", signer:"Mayara"},
  {id:"4.0", index:"Mov. 4.0", title:"Decisão", filename:"DECISÃO TUTELA URGÊNCIA (mov. 4).pdf", signer:"Eduardo"},
  {id:"5.0", index:"Mov. 5.0", title:"Intimação", filename:"TERMO DE CITAÇÃO (mov. 5).pdf", signer:"Joberson da Silva"},
  {id:"6.0", index:"Mov. 6.0", title:"Contestação", filename:"CONTESTAÇÃO (mov. 6).pdf", signer:"Yago"}
];
const el = id => document.getElementById(id);
let selectedMovement = movements[0];
let activePdfUrl = null;
const attachedPdfs = new Map();

function renderMovementList(){
  const nav = el("movementList");
  nav.innerHTML = "";
  movements.forEach(m => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "movement-item" + (m.id === selectedMovement.id ? " active" : "") + (m.type === "summary" ? " summary-item" : "");
    button.innerHTML = `<span class="movement-index">${m.type === "summary" ? "▤" : escapeHtml(m.index)}</span><span class="movement-copy"><strong>${escapeHtml(m.title)}</strong><small>${m.type === "summary" ? "Visão geral dos autos" : escapeHtml(m.filename)}</small></span>`;
    button.addEventListener("click", () => selectMovement(m.id));
    nav.appendChild(button);
  });
  el("movementCount").textContent = `${movements.length} itens`;
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function selectMovement(id){
  selectedMovement = movements.find(m => m.id === id) || movements[0];
  renderMovementList();
  const isSummary = selectedMovement.type === "summary";
  el("summaryView").classList.toggle("d-none", !isSummary);
  el("pdfView").classList.toggle("d-none", isSummary);
  el("breadcrumbTitle").textContent = selectedMovement.title;
  el("openFileButton").disabled = isSummary;
  el("resetDocumentButton").disabled = isSummary || !attachedPdfs.has(selectedMovement.id);
  if(isSummary){ clearPdfFrame(); return; }
  el("documentTitle").textContent = selectedMovement.title;
  el("documentFilename").textContent = selectedMovement.filename;
  el("documentSigner").textContent = selectedMovement.signer;
  el("pdfFooterFilename").textContent = selectedMovement.filename;
  showSelectedPdf();
}
function showSelectedPdf(){
  const file = attachedPdfs.get(selectedMovement.id);
  clearPdfFrame();
  if(file){
    // Anexo escolhido manualmente nesta sessão: útil para testar/substituir temporariamente.
    activePdfUrl = URL.createObjectURL(file);
    el("pdfFrame").src = activePdfUrl;
    el("pdfFrame").classList.remove("d-none");
    el("pdfPlaceholder").classList.add("d-none");
    el("resetDocumentButton").disabled = false;
  } else {
    // Carrega o PDF permanente hospedado na pasta documentos/ do repositório.
    el("pdfFrame").src = encodeURI("documentos/" + selectedMovement.filename);
    el("pdfFrame").classList.remove("d-none");
    el("pdfPlaceholder").classList.add("d-none");
    el("resetDocumentButton").disabled = true;
  }
}
function clearPdfFrame(){
  if(activePdfUrl){ URL.revokeObjectURL(activePdfUrl); activePdfUrl = null; }
  el("pdfFrame").removeAttribute("src");
}
function uploadSelectedPdf(file){
  if(!file || selectedMovement.type === "summary") return;
  if(file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")){
    alert("Selecione um arquivo PDF.");
    return;
  }
  attachedPdfs.set(selectedMovement.id, file);
  renderSummaryDocuments();
  showSelectedPdf();
}
function renderSummaryDocuments(){
  const target = el("summaryDocuments");
  target.innerHTML = "";
  movements.filter(m => m.type !== "summary").forEach(m => {
    const row = document.createElement("div");
    row.className = "summary-doc-row";
    const isAttached = attachedPdfs.has(m.id);
    row.innerHTML = `<span class="mov">${escapeHtml(m.index)}</span><div><strong>${escapeHtml(m.title)}</strong><small>${escapeHtml(m.filename)} · ${isAttached ? "PDF anexado nesta sessão" : "Aguardando anexo"} · Assinado por: ${escapeHtml(m.signer)}</small></div><button type="button" class="btn ${isAttached ? "btn-outline-success" : "btn-outline-primary"} btn-sm">${isAttached ? "Visualizar PDF" : "Abrir movimento"}</button>`;
    row.querySelector("button").addEventListener("click", () => selectMovement(m.id));
    target.appendChild(row);
  });
}
el("proceedButton").addEventListener("click", () => {
  el("welcomeScreen").classList.add("d-none");
  el("appShell").classList.remove("d-none");
  el("currentDate").textContent = new Intl.DateTimeFormat("pt-BR").format(new Date());
  renderMovementList(); renderSummaryDocuments(); selectMovement("summary");
});
el("backToWelcome").addEventListener("click", () => {
  el("appShell").classList.add("d-none");
  el("welcomeScreen").classList.remove("d-none");
});
el("openFileButton").addEventListener("click", () => el("pdfUpload").click());
el("placeholderUploadButton").addEventListener("click", () => el("pdfUpload").click());
el("pdfUpload").addEventListener("change", event => {
  uploadSelectedPdf(event.target.files[0]);
  event.target.value = "";
});
el("resetDocumentButton").addEventListener("click", () => {
  attachedPdfs.delete(selectedMovement.id);
  renderSummaryDocuments(); showSelectedPdf();
});
function setLogo(inputId, previewId, fallbackId){
  el(inputId).addEventListener("change", event => {
    const file = event.target.files[0];
    if(!file) return;
    if(!file.type.startsWith("image/")){ alert("Selecione um arquivo de imagem."); return; }
    const preview = el(previewId);
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
    el(fallbackId).hidden = true;
  });
}
setLogo("universityLogoInput","universityLogoPreview","universityLogoFallback");
setLogo("projectLogoInput","projectLogoPreview","projectLogoFallback");
renderMovementList(); renderSummaryDocuments();
