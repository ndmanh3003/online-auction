import 'dotenv/config'
import Category from '../models/Category.js'
import './../utils/db.js'

export const seedCategories = async () => {
  try {
    console.log('Starting category seed...')

    const collectibles = await Category.create({
      name: 'Collectibles',
    })

    const art = await Category.create({
      name: 'Art & Antiques',
    })

    const luxury = await Category.create({
      name: 'Luxury Items',
    })

    await Category.create({
      name: 'Coins & Currency',
      parentId: collectibles._id,
    })

    await Category.create({
      name: 'Stamps',
      parentId: collectibles._id,
    })

    await Category.create({
      name: 'Vintage Toys',
      parentId: collectibles._id,
    })

    await Category.create({
      name: 'Paintings',
      parentId: art._id,
    })

    await Category.create({
      name: 'Sculptures',
      parentId: art._id,
    })

    await Category.create({
      name: 'Antique Furniture',
      parentId: art._id,
    })

    await Category.create({
      name: 'Luxury Watches',
      parentId: luxury._id,
    })

    await Category.create({
      name: 'Jewelry',
      parentId: luxury._id,
    })

    await Category.create({
      name: 'Luxury Handbags',
      parentId: luxury._id,
    })

    console.log(`Total categories created: ${await Category.countDocuments()}`)

    return { collectibles, art, luxury }
  } catch (error) {
    console.error('Error seeding categories:', error)
    throw error
  }
}
