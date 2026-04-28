export type ProductType = 'clothing' | 'shoes' | 'default'

export type ProductSize = string | number

export type ProductItem = {
  id: number
  name: string
  price: number
  category: string
  image?: string
  description: string
  type: ProductType
  availableSizes: ProductSize[]
}

export const SAMPLE_PRODUCTS: ProductItem[] = [
  {
    id: 101,
    name: 'Nocturne Ceket',
    price: 12990,
    category: 'GECE YÜNÜ',
    description: 'Keskin omuz hattı ve mat yüzey dokusuyla modern şehir silueti.',
    type: 'clothing',
    availableSizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 102,
    name: 'Atelier Gömlek',
    price: 6490,
    category: 'PAMUK SATEN',
    description: 'Yumuşak düşüşlü kumaş ve minimal dikiş çizgisi.',
    type: 'clothing',
    availableSizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 103,
    name: 'Linea Loafer',
    price: 8990,
    category: 'NAPPA DERİ',
    description: 'Gün boyu konfor için dengeli taban ve rafine üst form.',
    type: 'shoes',
    availableSizes: [38, 39, 40, 41, 42, 43],
  },
  {
    id: 104,
    name: 'Obsidian Bot',
    price: 10990,
    category: 'TEKNİK SÜET',
    description: 'Yüksek bilek yapısı ve güçlü taban geometrisi.',
    type: 'shoes',
    availableSizes: [39, 40, 41, 42, 43],
  },
  {
    id: 105,
    name: 'Silk Core Çanta',
    price: 7590,
    category: 'PARLAK DERİ',
    description: 'Arşiv formundan ilham alan temiz çizgili günlük kullanım.',
    type: 'default',
    availableSizes: [],
  },
  {
    id: 106,
    name: 'Studio Kemer',
    price: 2990,
    category: 'TAM DAMARLI DERİ',
    description: 'Sessiz lüks yaklaşımını tamamlayan ince profil.',
    type: 'default',
    availableSizes: [],
  },
  {
    id: 107,
    name: 'Contour Pantolon',
    price: 5890,
    category: 'TEKNİK KREP',
    description: 'Akıcı kalıp, yüksek bel ve dengeli paça genişliği.',
    type: 'clothing',
    availableSizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 108,
    name: 'Aurum Sneaker',
    price: 9490,
    category: 'MİKRO FİBER DERİ',
    description: 'Premium sokak estetiği için minimal ve güçlü form.',
    type: 'shoes',
    availableSizes: [38, 39, 40, 41, 42, 43],
  },
]

