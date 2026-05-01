import { ProductGrid } from '../components/product-grid/ProductGrid'
import { TechCampaignSection } from '../components/home/TechCampaignSection'
import { ShoppableBanner } from '../components/home/ShoppableBanner'
import { LuxuryCollectionSection } from '../components/home/LuxuryCollectionSection'
import { PersonalCareSection } from '../components/home/PersonalCareSection'
import { HeroCarousel } from '../components/home/HeroCarousel'
import { SuperMarketShowcaseSection } from '../components/home/SuperMarketShowcaseSection'
import { AirpodsColorShowcase } from '../components/home/AirpodsColorShowcase'

export function ProductListPage() {
  return (
    <div className="space-y-16">
      <HeroCarousel />

      <ProductGrid />
      <TechCampaignSection />
      <ShoppableBanner />
      <LuxuryCollectionSection />
      <PersonalCareSection />
      <SuperMarketShowcaseSection />
      <AirpodsColorShowcase />
    </div>
  )
}

