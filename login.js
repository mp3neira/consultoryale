// ── Credenciais ────────────────────────────────────────
// Dica: em produção, mova a validação para uma Edge Function do Supabase
const USUARIO_CORRETO = "master";
const SENHA_CORRETA   = "Master.2078!";
const MAX_TENTATIVAS  = 5;
const BLOQUEIO_MS     = 60 * 1000; // 1 minuto

let tentativas   = parseInt(sessionStorage.getItem("loginTentativas")  || "0");
let bloqueadoAte = parseInt(sessionStorage.getItem("loginBloqueadoAte") || "0");

// Redireciona se já autenticado
if (sessionStorage.getItem("logistAutenticado") === "true") {
  window.location.href = "logista.html";
}

const btnEntrar   = document.getElementById("btnEntrar");
const errorMsg    = document.getElementById("errorMsg");
const errorText   = document.getElementById("errorText");
const attemptsMsg = document.getElementById("attemptsMsg");

// ── Mostrar/ocultar senha ─────────────────────────────
function toggleSenha() {
  const input = document.getElementById("senha");
  const icon  = document.getElementById("eyeIcon");
  if (input.type === "password") {
    input.type = "text";
    icon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>`;
  } else {
    input.type = "password";
    icon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>`;
  }
}

// ── Bloqueio por tentativas ────────────────────────────
function verificarBloqueio() {
  const agora = Date.now();
  if (bloqueadoAte > agora) {
    const restante = Math.ceil((bloqueadoAte - agora) / 1000);
    mostrarErro(`Muitas tentativas. Aguarde ${restante}s.`);
    btnEntrar.disabled = true;
    setTimeout(() => {
      btnEntrar.disabled = false;
      errorMsg.classList.remove("visible");
      attemptsMsg.textContent = "";
      tentativas = 0;
      sessionStorage.removeItem("loginTentativas");
      sessionStorage.removeItem("loginBloqueadoAte");
    }, bloqueadoAte - agora);
    return true;
  }
  return false;
}

// ── Utilitários de UI ─────────────────────────────────
function mostrarErro(msg) {
  errorText.textContent = msg;
  errorMsg.classList.remove("visible");
  void errorMsg.offsetWidth;
  errorMsg.classList.add("visible");
  document.getElementById("usuario").classList.add("error-input");
  document.getElementById("senha").classList.add("error-input");
}

function limparErro() {
  errorMsg.classList.remove("visible");
  document.getElementById("usuario").classList.remove("error-input");
  document.getElementById("senha").classList.remove("error-input");
}

// ── Login ─────────────────────────────────────────────
function tentarLogin() {
  if (verificarBloqueio()) return;

  const usuario = document.getElementById("usuario").value.trim();
  const senha   = document.getElementById("senha").value;

  if (!usuario || !senha) {
    mostrarErro("Preencha usuário e senha.");
    return;
  }

  btnEntrar.classList.add("loading");
  btnEntrar.disabled = true;
  limparErro();

  setTimeout(() => {
    btnEntrar.classList.remove("loading");
    btnEntrar.disabled = false;

    if (usuario === USUARIO_CORRETO && senha === SENHA_CORRETA) {
      sessionStorage.setItem("logistAutenticado", "true");
      sessionStorage.removeItem("loginTentativas");
      sessionStorage.removeItem("loginBloqueadoAte");
      document.getElementById("successOverlay").classList.add("show");
      setTimeout(() => window.location.href = "logista.html", 1800);
    } else {
      tentativas++;
      sessionStorage.setItem("loginTentativas", tentativas);
      const restantes = MAX_TENTATIVAS - tentativas;

      if (tentativas >= MAX_TENTATIVAS) {
        bloqueadoAte = Date.now() + BLOQUEIO_MS;
        sessionStorage.setItem("loginBloqueadoAte", bloqueadoAte);
        mostrarErro("Conta bloqueada por 60 segundos.");
        attemptsMsg.textContent = "";
        verificarBloqueio();
      } else {
        mostrarErro("Usuário ou senha incorretos.");
        if (restantes <= 2) {
          attemptsMsg.className  = "attempts-msg warn";
          attemptsMsg.textContent = `${restantes} tentativa${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""}.`;
        } else {
          attemptsMsg.className  = "attempts-msg";
          attemptsMsg.textContent = "";
        }
      }
    }
  }, 900);
}

// ── Eventos ───────────────────────────────────────────
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && !btnEntrar.disabled) tentarLogin();
});

["usuario", "senha"].forEach(id => {
  document.getElementById(id).addEventListener("input", limparErro);
});

verificarBloqueio();
