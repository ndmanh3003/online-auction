import 'dotenv/config'
import Category from '../models/Category.js'
import Product from '../models/Product.js'
import './../utils/db.js'

export const seedProducts = async (sellers) => {
  try {
    console.log('Starting product seed...')

    const categories = await Category.find({ parentId: { $ne: null } })

    if (categories.length === 0) {
      throw new Error(
        'No subcategories found. Please run seed-categories first.'
      )
    }

    const seller = sellers[0]

    const categoryMap = {}
    for (const cat of categories) {
      categoryMap[cat.name] = cat._id
    }

    const now = new Date()
    const products = []

    const productData = [
      {
        name: 'Vintage Rolex Submariner Watch',
        description: `<p>Authentic vintage Rolex Submariner from the 1970s. This timepiece features the classic black dial with luminescent markers, original bezel, and automatic movement. Comes with original box and papers. Excellent condition with minor signs of wear consistent with age.</p>`,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
          'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
        ],
        categoryName: 'Luxury Watches',
        startPrice: 5000,
        stepPrice: 250,
        buyNowPrice: 8000,
        daysOffset: 7,
      },
      {
        name: 'Rare 1921 Morgan Silver Dollar',
        description: `<p>Extremely rare 1921 Morgan Silver Dollar in mint condition. This coin is one of the last Morgan dollars ever minted and is highly sought after by collectors. Features the iconic Lady Liberty on the obverse and an eagle on the reverse. Graded MS-65 by PCGS.</p>`,
        images: [
          'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800',
          'https://images.unsplash.com/photo-1608190003443-86ab6d05eb12?w=800',
          'https://images.unsplash.com/photo-1608190003443-86ab6d05eb12?w=800&q=80',
          'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800',
        ],
        categoryName: 'Coins & Currency',
        startPrice: 1200,
        stepPrice: 50,
        buyNowPrice: 2000,
        daysOffset: 10,
      },
      {
        name: 'Original Oil Painting - Landscape',
        description: `<p>Beautiful original oil painting on canvas depicting a serene mountain landscape at sunset. Signed by the artist and dated 1985. The painting measures 24x36 inches and is professionally framed. This piece showcases excellent technique with rich colors and detailed brushwork.</p>`,
        images: [
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
          'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800',
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        ],
        categoryName: 'Paintings',
        startPrice: 3000,
        stepPrice: 150,
        buyNowPrice: 5000,
        daysOffset: 12,
      },
      {
        name: 'Diamond and Platinum Necklace',
        description: `<p>Exquisite diamond and platinum necklace featuring a stunning 2-carat center diamond surrounded by smaller diamonds. The necklace is handcrafted by a renowned jeweler and comes with certification. The platinum chain is 18 inches long with a secure clasp. Perfect for special occasions.</p>`,
        images: [
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
          'https://images.unsplash.com/photo-1603561596112-67d5d536639e?w=800',
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
          'https://images.unsplash.com/photo-1611591437281-8bfb143adce8?w=800',
        ],
        categoryName: 'Jewelry',
        startPrice: 8000,
        stepPrice: 400,
        buyNowPrice: 15000,
        daysOffset: 14,
      },
      {
        name: 'Antique Victorian Mahogany Desk',
        description: `<p>Rare Victorian-era mahogany writing desk from the late 1800s. Features intricate hand-carved details, multiple drawers with original brass hardware, and a leather writing surface. This piece has been professionally restored while maintaining its authentic character. A true collector's item.</p>`,
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
          'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
        ],
        categoryName: 'Antique Furniture',
        startPrice: 4500,
        stepPrice: 200,
        buyNowPrice: 7000,
        daysOffset: 9,
      },
    ]

    for (const data of productData) {
      const categoryId = categoryMap[data.categoryName]
      if (!categoryId) {
        console.warn(
          `Category "${data.categoryName}" not found, skipping product "${data.name}"`
        )
        continue
      }

      const endTime = new Date(
        now.getTime() + data.daysOffset * 24 * 60 * 60 * 1000
      )

      products.push({
        name: data.name,
        description: data.description,
        images: data.images,
        categoryId: categoryId,
        sellerId: seller._id,
        startPrice: data.startPrice,
        currentPrice: data.startPrice,
        stepPrice: data.stepPrice,
        buyNowPrice: data.buyNowPrice,
        autoExtend: false,
        allowNonRatedBidders: true,
        status: 'active',
        endTime,
      })
    }

    const createdProducts = await Product.insertMany(products)
    console.log(`Created ${createdProducts.length} products`)

    return createdProducts
  } catch (error) {
    console.error('Error seeding products:', error)
    throw error
  }
}
