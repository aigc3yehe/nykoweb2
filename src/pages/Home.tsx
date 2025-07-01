import React from 'react'
import Banner from '../components/home/Banner'
import PopularWorkflows from '../components/home/PopularWorkflows'
import TrendingStyles from '../components/home/TrendingStyles'
import InspirationFeed from '../components/home/InspirationFeed'

const Home: React.FC = () => {
  return (
    <div className="w-full px-6 space-y-[1.875rem]"> {/* gap: 30px */}
      {/* Banner 区域 */}
      <Banner />
      
      {/* Popular Workflows */}
      <PopularWorkflows />
      
      {/* Trending Styles */}
      <TrendingStyles />
      
      {/* Inspiration Feed */}
      <InspirationFeed />
    </div>
  )
}

export default Home 