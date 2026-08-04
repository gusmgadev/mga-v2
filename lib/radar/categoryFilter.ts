function fold(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

const CONFLICT_TYPES = new Set([
  'restaurant', 'food', 'cafe', 'bakery', 'bar', 'meal_takeaway', 'meal_delivery', 'night_club',
  'supermarket', 'grocery_or_supermarket', 'convenience_store', 'liquor_store',
  'local_government_office', 'city_hall', 'government_office', 'tourist_attraction', 'museum',
  'police', 'fire_station', 'library', 'embassy', 'courthouse', 'post_office',
  'school', 'university', 'secondary_school', 'primary_school',
  'place_of_worship', 'church', 'mosque', 'synagogue', 'cemetery',
  'bus_station', 'train_station', 'transit_station', 'airport', 'lodging', 'hotel', 'hostel', 'motel',
  'campground', 'bed_and_breakfast', 'travel_agency',
  'car_repair', 'car_dealer', 'car_wash', 'gas_station', 'mechanic', 'parking', 'auto_parts_store',
  'hospital', 'doctor', 'dentist', 'physiotherapist', 'veterinary_care', 'pharmacy',
  'clothing_store', 'shoe_store', 'fashion_accessories_store', 'department_store',
  'electronics_store', 'home_goods_store', 'furniture_store', 'hardware_store', 'home_improvement_store',
  'book_store', 'jewelry_store', 'florist',
  'beauty_salon', 'hair_care', 'barber_shop', 'spa', 'day_spa', 'nail_salon', 'tanning_salon', 'gym',
  'real_estate_agency', 'locksmith', 'lawyer', 'accounting', 'insurance_agency',
  'pet_store', 'optometrist', 'shopping_mall',
])

const OFFTOPIC_NAME = [
  'turismo', 'turistico', 'informes', 'oficina', 'municipal', 'gobierno', 'intendencia', 'secretaria', 'biblioteca',
  'escuela', 'colegio', 'universidad', 'iglesia', 'capilla', 'hospital', 'centro de salud', 'centro medico',
  'plaza', 'parque', 'playa', 'estadio', 'cancha', 'polideportivo', 'velodromo', 'camping',
  'hotel', 'hostal', 'apart', 'alojamiento', 'hospedaje',
  'nafta', 'combustible', 'estacion de servicio', 'parking', 'estacionamiento',
  'abogado', 'contador', 'estudio juridico', 'seguro', 'banco',
  'holistica', 'tarot', 'reiki', 'espiritual',
  'biciclet', 'bike', 'buceo', 'nautico', 'vela', 'surf',
  'alquiler de', 'rent', 'excursiones', 'eventos', 'club',
]

const FOOD_NAME = [
  'restaurante', 'restaurant', 'parrilla', 'comidas', 'pizzeria', 'heladeria', 'confiteria', 'panaderia',
  'verduleria', 'carniceria', 'polleria', 'pescaderia', 'kiosco', 'supermercado', 'rotiseria', 'lomiteria',
  'sanguche', 'cafe', 'bistro', 'delicatessen', 'comida',
]

const STOPWORDS = new Set(['de', 'en', 'y', 'la', 'el', 'los', 'las', 'del', 'a', 'e', 'o', 'con', 'para'])

interface RubroDomain {
  types: string[]
  synonyms: string[]
  food?: boolean
}

const RUBRO_DOMAINS: Record<string, RubroDomain> = {
  'indumentaria': {
    types: ['clothing_store', 'shoe_store', 'fashion_accessories_store', 'department_store', 'shopping_mall'],
    synonyms: ['indumentaria', 'ropa', 'vestimenta', 'calzado', 'zapatilla', 'zapatillas', 'zapato', 'zapatos',
      'remera', 'remeras', 'jean', 'jeans', 'jogg', 'joggin', 'jogging', 'calza', 'calzas', 'musculosa',
      'musculosas', 'gorra', 'gorras', 'botas', 'moda', 'lenceria', 'campera', 'camisas', 'vestidos',
      'pantalon', 'shorts', 'bikini', 'chomba', 'chombas', 'abrigo', 'sweater', 'buzo', 'medias', 'blusa',
      'blusas', 'camperas', 'pollera', 'falda', 'zapateria', 'shoes', 'deportes', 'sports', 'sport',
      'camisetas', 'boutique', 'accesorios', 'merceria', 'textil'],
  },
  'restaurante': {
    types: ['restaurant', 'food', 'cafe', 'bar', 'meal_takeaway', 'meal_delivery', 'bakery', 'night_club'],
    synonyms: ['restaurante', 'restaurant', 'comida', 'parrilla', 'pizzeria', 'hamburgueseria', 'cafe',
      'confiteria', 'heladeria', 'comedor', 'resto', 'rotiseria', 'lomiteria', 'sanguche', 'comidas', 'menu'],
    food: true,
  },
  'panaderia': {
    types: ['bakery', 'food'],
    synonyms: ['panaderia', 'pan', 'facturas', 'confiteria', 'pasteleria', 'panificados'],
    food: true,
  },
  'supermercado': {
    types: ['supermarket', 'grocery_or_supermarket', 'shopping_mall'],
    synonyms: ['supermercado', 'super', 'mercado', 'autoservicio', 'minimercado', 'maxikiosco', 'verduleria', 'despensa'],
    food: true,
  },
  'kiosco': {
    types: ['convenience_store', 'store'],
    synonyms: ['kiosco', 'maxikiosco', 'minimercado', 'despensa', 'autoservicio'],
    food: true,
  },
  'farmacia': {
    types: ['pharmacy', 'drugstore'],
    synonyms: ['farmacia', 'drogueria', 'farmacias', 'salud'],
  },
  'ferreteria': {
    types: ['hardware_store', 'home_improvement_store'],
    synonyms: ['ferreteria', 'herramientas', 'pinturerias', 'sanitarios', 'ferreterias'],
  },
  'cerrajeria': {
    types: ['locksmith'],
    synonyms: ['cerrajeria', 'cerrajeros', 'llaves'],
  },
  'gimnasio': {
    types: ['gym', 'gymnasium', 'health', 'fitness_center'],
    synonyms: ['gimnasio', 'gym', 'fitness', 'crossfit', 'gimnasios', 'musculacion', 'entrenamiento'],
  },
  'centro de estetica': {
    types: ['beauty_salon', 'spa', 'day_spa', 'hair_care', 'nail_salon', 'tanning_salon'],
    synonyms: ['estetica', 'belleza', 'spa', 'uñas', 'manicura', 'depilacion', 'cosmetologia', 'masajes', 'pestanas'],
  },
  'peluqueria': {
    types: ['beauty_salon', 'hair_care', 'barber_shop'],
    synonyms: ['peluqueria', 'peluqueros', 'barberia', 'barbero', 'estilista', 'unisex', 'corte de pelo'],
  },
  'zapateria': {
    types: ['shoe_store'],
    synonyms: ['zapateria', 'zapatos', 'zapatillas', 'calzado', 'zapatilleria', 'shoes'],
  },
  'libreria': {
    types: ['book_store'],
    synonyms: ['libreria', 'libros', 'papeleria', 'utiles', 'articulos de libreria', 'textos'],
  },
  'jugueteria': {
    types: [],
    synonyms: ['juguete', 'juguetes', 'jugueteria'],
  },
  'regaleria': {
    types: ['store'],
    synonyms: ['regaleria', 'regalos', 'souvenir', 'souvenirs', 'gifts'],
  },
  'muebleria': {
    types: ['furniture_store', 'home_goods_store'],
    synonyms: ['muebleria', 'muebles', 'colchones', 'colchoneria', 'blancos', 'decohogar'],
  },
  'decoracion': {
    types: ['furniture_store', 'home_goods_store', 'florist'],
    synonyms: ['decoracion', 'deco', 'hogar', 'cortinas', 'cortinados', 'decorativos'],
  },
  'electrodomesticos': {
    types: ['electronics_store', 'home_goods_store', 'appliance_store'],
    synonyms: ['electrodomesticos', 'heladera', 'heladeras', 'lavarropa', 'lavarropas', 'microondas',
      'televisores', 'cocinas', 'freezer', 'ventilador', 'electro'],
  },
  'electronica': {
    types: ['electronics_store', 'shopping_mall'],
    synonyms: ['electronica', 'computacion', 'computadoras', 'smartphone', 'celulares', 'informatica',
      'tecnologia', 'notebooks', 'audio', 'pc', 'gaming'],
  },
  'inmobiliaria': {
    types: ['real_estate_agency'],
    synonyms: ['inmobiliaria', 'inmuebles', 'propiedades', 'alquiler', 'alquileres', 'remax', 'casas'],
  },
  'odontologia': {
    types: ['dentist', 'doctor'],
    synonyms: ['odontologia', 'dentista', 'dental', 'clinica dental', 'implantes', 'ortodoncia'],
  },
  'optica': {
    types: ['optometrist', 'store'],
    synonyms: ['optica', 'lentes', 'anteojos', 'lentes de contacto', 'oculista'],
  },
  'taller mecanico': {
    types: ['car_repair', 'mechanic', 'car_dealer'],
    synonyms: ['taller', 'mecanico', 'mecanica', 'chapista', 'gomeria', 'neumaticos'],
  },
  'veterinaria': {
    types: ['veterinary_care', 'pet_store'],
    synonyms: ['veterinaria', 'vet', 'mascotas', 'animales', 'clinica veterinaria', 'pet'],
  },
}

function findDomain(category: string): RubroDomain | null {
  const key = fold(category)
  if (RUBRO_DOMAINS[key]) return RUBRO_DOMAINS[key]
  for (const [k, d] of Object.entries(RUBRO_DOMAINS)) {
    if (key.includes(k) || k.includes(key)) return d
  }
  return null
}

export function passesCategoryFilter(
  category: string | null | undefined,
  place: { name?: string | null; types?: string[] | null },
  searchKeywords: string[] = [],
): boolean {
  if (!category || !category.trim()) return true

  const types = (place.types ?? []).map(fold)
  const name = fold(place.name ?? '')
  const domain = findDomain(category)
  const accepted = domain?.types ?? []

  if (accepted.some((t) => types.includes(t))) return true

  const positives = [
    ...(domain?.synonyms ?? fold(category).split(/\s+/).filter((w) => w.length >= 3 && !STOPWORDS.has(w))),
    ...searchKeywords.map(fold),
  ]
  if (positives.some((k) => k.length >= 3 && name.includes(k))) return true

  if (types.some((t) => CONFLICT_TYPES.has(t) && !accepted.includes(t))) return false

  const negatives = domain?.food ? OFFTOPIC_NAME : [...OFFTOPIC_NAME, ...FOOD_NAME]
  if (negatives.some((m) => name.includes(m))) return false

  return true
}
