export interface Client {
  name: string
  location: string
  category: string
  address: string
  phone: string
  show: boolean
  logo: string
}

export const clientes: Client[] = [
  { name: "Optica Rada Tilly", location: "Rada Tilly", category: "Óptica", address: "Islas malvinas 1638 ", phone: "297 4435801", show: true, logo: "/images/clientes/opticart.jpg" },
  { name: "IRP Import Racing", location: "Buenos Aires", category: "Repuestos automotor", address: "Díaz Vélez 4824 Munro", phone: "11 24006725", show: true, logo: "/images/clientes/irp.jpg" },
  { name: "TECNOSUR HIDROGRUAS", location: "Rada Tilly", category: "Taller de reparación", address: "Av. 24 de Marzo 925", phone: "297 403-6526", show: true, logo: "/images/clientes/tecnosur.jpg" },
  { name: "Clasica y moderna", location: "Comodoro Rivadavia", category: "Indumentaria", address: "San martin 669", phone: "297 4710350", show: true, logo: "/images/clientes/clasica.jpg" },
  { name: "El Sentir Patagonico", location: "Comodoro Rivadavia", category: "Programa TV", address: "Comodoro Rivadavia", phone: "297 4013586", show: true, logo: "/images/clientes/elsentir.jpg" },
  { name: "Tiziana Deco", location: "Comodoro Rivadavia", category: "Mueblería", address: "Calle San Martín 600", phone: "297 678-9012", show: true, logo: "/images/clientes/tiziana.jpg" },
   { name: "Cheeky", location: "Comodoro Rivadavia", category: "Indumentaria", address: "Av. Kennedy 2200", phone: "297 567-8901", show: true, logo: "/images/clientes/cheeky.jpg" },
  { name: "FRANCA TIENDA DE MAR", location: "Puerto Pirámides", category: "Regalería", address: "Av. costanera 200", phone: "297 345-6789", show: true, logo: "/images/clientes/franca.jpg" },
  { name: "Lompas", location: "Comodoro Rivadavia - R.Tilly", category: "Indumentaria", address: "San Martín 432", phone: " 297 4048148", show: true, logo: "/images/clientes/lompas.jpg" },
  { name: "CURTO Propiedades", location: "Rada Tilly", category: "Inmobiliaria", address: "Av. Argentina 450", phone: "297 456-7890", show: true, logo: "/images/clientes/curto.png" },
  { name: "Street Surf", location: "Puerto Madryn", category: "Indumentaria", address: "25 de Mayo 191", phone: "0280 445-7481", show: true, logo: "/images/clientes/street.jpg" },
   { name: "Lent-Sur", location: "Comodoro Rivadavia", category: "Óptica", address: "Av. km 3 1500", phone: "297 789-0123", show: true, logo: "/images/clientes/lentsur.jpg" },
  { name: "Ciudad Inmobiliaria", location: "Rada Tilly", category: "Inmobiliaria", address: "Av. costanera 100", phone: "297 890-1234", show: true, logo: "/images/clientes/ciudad.jpg" },
  { name: "Granada", location: "Rada Tilly", category: "Indumentaria", address: "Av. 24 de Marzo 500", phone: "297 901-2345", show: true, logo: "/images/clientes/granada.jpg" },
  { name: "Ossira", location: "C.Rivadavia R.Tilly", category: "indumentaria", address: "Bartolomé Mitre 815", phone: "2974214478", show: true, logo: "/images/clientes/ossira.jpg" },
  { name: "Sport Hits", location: "C.Rivadavia R.Tilly", category: "Indumentaria", address: "Av.Polonia 351", phone: "297447-3731", show: true, logo: "/images/clientes/shits.jpg" },
  { name: "New Wine", location: "Comodoro Rivadavia", category: "Vinoteca", address: "España 539", phone: "297 4299368", show: true, logo: "/images/clientes/newwine.jpg" },
    { name: "Ambientar", location: "Rada Tilly", category: "Vinoteca", address: "Juan Guteff 2075", phone: "2975904444", show: true, logo: "/images/clientes/ambientar.jpg" },
    { name: "Las Otillas", location: "Trelew", category: "Indumentaria", address: "Belgrano 394", phone: " 2804-42-9311", show: true, logo: "/images/clientes/otillas.jpg" },
     { name: "Todo Luz", location: "Rada Tilly", category: "Electricidad", address: "Lago Menéndez 2255", phone: "297 4190187", show: true, logo: "/images/clientes/todoluz.jpg" },
     { name: "Tijuana", location: "Comodoro Rivadavia", category: "Indumentaria", address: "Av.Kenedy 2226", phone: "2974214475", show: true, logo: "/images/clientes/tijuana.jpg" },
  { name: "Iveco", location: "Rada Tilly", category: "Venta de camiones", address: "Av. Hipólito Yrigoyen 5150", phone: "297 541-3893", show: true, logo: "/images/clientes/iveco.jpg" },
       { name: "Buddies CR", location: "Comodoro Rivadavia", category: "Indumentaria", address: "San Martin 548", phone: "2974529526", show: true, logo: "/images/clientes/buddies.jpg" },
    { name: "Musters", location: "Rada Tilly", category: "Vinoteca", address: "Calle Mitre 300", phone: "297 012-3456", show: true, logo: "/images/clientes/musters.jpg" },
  { name: "INVAP", location: "Comodoro Rivadavia", category: "Servicios petroleros", address: "Pedro, Pablo Ortega 2570", phone: "297  486-6535", show: false, logo: "/images/clientes/invap.jpg" },
]