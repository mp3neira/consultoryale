const supabase = window.supabase.createClient(
"https://ymcjkioychfjgfexqaps.supabase.co",
"sb_publishable_5hludyQvVRcmToSqw6EnnQ_M4N29FcE"
)

async function salvar(){

const carro = {
marca: document.getElementById("marca").value,
modelo: document.getElementById("modelo").value,
ano: document.getElementById("ano").value,
preco: document.getElementById("preco").value,
km: document.getElementById("km").value,
cor: document.getElementById("cor").value,
foto: document.getElementById("foto").value,
combustivel: document.getElementById("combustivel").value,
cambio: document.getElementById("cambio").value,
portas: document.getElementById("portas").value
}

const { error } = await supabase
.from("cars")
.insert(carro)

if(error){
alert("erro ao salvar")
console.log(error)
return
}

alert("carro salvo 🔥")

listar()

}

async function listar(){

const { data, error } = await supabase
.from("cars")
.select("*")
.order("id",{ascending:false})

if(error){
console.log(error)
return
}

const box = document.getElementById("estoque")
box.innerHTML = ""

data.forEach(c => {

box.innerHTML += `
<div style="border:1px solid #ccc;padding:10px;margin:10px">
<b>${c.marca} ${c.modelo}</b><br>
Ano: ${c.ano}<br>
Preço: ${c.preco}<br>
<button onclick="excluir(${c.id})">Excluir</button>
</div>
`

})

}

async function excluir(id){

if(!confirm("excluir?")) return

const { error } = await supabase
.from("cars")
.delete()
.eq("id",id)

if(error){
alert("erro")
return
}

listar()

}

listar()