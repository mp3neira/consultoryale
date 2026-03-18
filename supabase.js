const supabaseClient = window.supabase.createClient(
"https://ymcjkioychfjgfexqaps.supabase.co",
"sb_publishable_5hludyQvVRcmToSqw6EnnQ_M4N29FcE"
)

async function carregarCarros(){

const { data, error } = await supabaseClient
.from("cars")
.select("*")

if(error){
console.log(error)
return
}

carros = data
filtrar()

}

carregarCarros()