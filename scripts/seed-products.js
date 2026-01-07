import 'dotenv/config'
import Category from '../models/Category.js'
import Product from '../models/Product.js'
import './../utils/db.js'

export const seedProducts = async (sellers) => {
  try {
    console.log('Starting product seed...')

    const categories = await Category.find({ parentId: { $ne: null } })

    const seller = sellers[0]

    const categoryMap = {}
    for (const cat of categories) {
      categoryMap[cat.name] = cat._id
    }

    const now = new Date()
    const products = []

    const smartphonesCategory = categoryMap['Smartphones']
    const tabletsCategory = categoryMap['Tablets']
    const laptopsCategory = categoryMap['Laptops']

    if (!smartphonesCategory || !tabletsCategory || !laptopsCategory) {
      throw new Error(
        'Required categories (Smartphones, Tablets, Laptops) not found'
      )
    }

    const activeProducts = [
      {
        name: 'iPhone 17',
        description: `<p>iPhone 17 mới nhất với chip A19 Pro, camera 48MP, màn hình Super Retina XDR 6.7 inch. Hộp đầy đủ phụ kiện, bảo hành chính hãng 12 tháng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 5000000,
        stepPrice: 100000,
        buyNowPrice: 15000000,
      },
      {
        name: 'iPad Pro M4',
        description: `<p>iPad Pro M4 12.9 inch 512GB, chip M4, màn hình Liquid Retina XDR. Sắp kết thúc đấu giá!</p>`,
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
        ],
        categoryId: tabletsCategory,
        startPrice: 1000000,
        stepPrice: 100000,
        buyNowPrice: 40000000,
      },
      {
        name: 'iPhone 16 Pro Max',
        description: `<p>iPhone 16 Pro Max 256GB, màu Titanium Blue, camera 48MP, pin trâu. Máy còn bảo hành đến tháng 12/2025.</p>`,
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
          'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 25000000,
        stepPrice: 500000,
        buyNowPrice: 35000000,
      },
      {
        name: 'iPhone 15',
        description: `<p>iPhone 15 128GB, màu Pink, máy mới seal, chưa kích hoạt. Bảo hành chính hãng Apple.</p>`,
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 15000000,
        stepPrice: 300000,
        buyNowPrice: 20000000,
      },
      {
        name: 'iPad Air M2',
        description: `<p>iPad Air M2 11 inch 256GB, chip M2, màn hình Liquid Retina, hỗ trợ Apple Pencil 2. Máy mới nguyên seal.</p>`,
        images: [
          'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        ],
        categoryId: tabletsCategory,
        startPrice: 18000000,
        stepPrice: 400000,
        buyNowPrice: 25000000,
      },
      {
        name: 'MacBook Pro M3',
        description: `<p>MacBook Pro 14 inch M3, 16GB RAM, 512GB SSD, màn hình Liquid Retina XDR. Máy mới, bảo hành chính hãng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800',
          'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        ],
        categoryId: laptopsCategory,
        startPrice: 35000000,
        stepPrice: 1000000,
        buyNowPrice: 45000000,
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: `<p>Samsung Galaxy S24 Ultra 256GB, màu Titanium Black, camera 200MP, S Pen. Máy mới, bảo hành chính hãng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 22000000,
        stepPrice: 500000,
        buyNowPrice: 30000000,
      },
      {
        name: 'iPhone 14 Pro',
        description: `<p>iPhone 14 Pro 128GB, màu Deep Purple, camera 48MP, Dynamic Island. Máy đã qua sử dụng nhưng còn rất mới.</p>`,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
          'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 18000000,
        stepPrice: 400000,
        buyNowPrice: 25000000,
      },
      {
        name: 'iPad Mini 6',
        description: `<p>iPad Mini 6 256GB, chip A15 Bionic, màn hình 8.3 inch, hỗ trợ Apple Pencil 2. Máy mới nguyên seal.</p>`,
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
          'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        ],
        categoryId: tabletsCategory,
        startPrice: 12000000,
        stepPrice: 300000,
        buyNowPrice: 18000000,
      },
      {
        name: 'MacBook Air M2',
        description: `<p>MacBook Air 13 inch M2, 8GB RAM, 256GB SSD, màn hình Liquid Retina. Máy mới, bảo hành chính hãng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
          'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
          'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800',
        ],
        categoryId: laptopsCategory,
        startPrice: 25000000,
        stepPrice: 500000,
        buyNowPrice: 32000000,
      },
      {
        name: 'iPhone 13 Pro Max',
        description: `<p>iPhone 13 Pro Max 256GB, màu Sierra Blue, camera 12MP, pin trâu. Máy đã qua sử dụng, còn rất mới.</p>`,
        images: [
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 12000000,
        stepPrice: 300000,
        buyNowPrice: 18000000,
      },
      {
        name: 'Samsung Galaxy Tab S9',
        description: `<p>Samsung Galaxy Tab S9 11 inch 256GB, S Pen, màn hình Super AMOLED. Máy mới, bảo hành chính hãng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
        ],
        categoryId: tabletsCategory,
        startPrice: 15000000,
        stepPrice: 400000,
        buyNowPrice: 22000000,
      },
      {
        name: 'iPhone 12 Pro',
        description: `<p>iPhone 12 Pro 128GB, màu Pacific Blue, camera 12MP, chip A14. Máy đã qua sử dụng, còn tốt.</p>`,
        images: [
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 10000000,
        stepPrice: 200000,
        buyNowPrice: 15000000,
      },
      {
        name: 'MacBook Pro M2',
        description: `<p>MacBook Pro 16 inch M2, 32GB RAM, 1TB SSD, màn hình Liquid Retina XDR. Máy mới, bảo hành chính hãng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
          'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
        ],
        categoryId: laptopsCategory,
        startPrice: 45000000,
        stepPrice: 1000000,
        buyNowPrice: 55000000,
      },
      {
        name: 'iPhone SE 2024',
        description: `<p>iPhone SE 2024 128GB, chip A17, camera 12MP, thiết kế nhỏ gọn. Máy mới nguyên seal.</p>`,
        images: [
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
          'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800',
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 8000000,
        stepPrice: 200000,
        buyNowPrice: 12000000,
      },
      {
        name: 'iPad 10th Gen',
        description: `<p>iPad 10th Gen 256GB, chip A14, màn hình 10.9 inch, hỗ trợ Apple Pencil 1. Máy mới nguyên seal.</p>`,
        images: [
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
        ],
        categoryId: tabletsCategory,
        startPrice: 10000000,
        stepPrice: 300000,
        buyNowPrice: 15000000,
      },
      {
        name: 'Samsung Galaxy Z Fold 5',
        description: `<p>Samsung Galaxy Z Fold 5 512GB, màn hình gập, S Pen, camera 50MP. Máy mới, bảo hành chính hãng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
          'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800',
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 35000000,
        stepPrice: 1000000,
        buyNowPrice: 45000000,
      },
      {
        name: 'MacBook Air M1',
        description: `<p>MacBook Air 13 inch M1, 16GB RAM, 512GB SSD, màn hình Retina. Máy đã qua sử dụng, còn tốt.</p>`,
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
        ],
        categoryId: laptopsCategory,
        startPrice: 20000000,
        stepPrice: 500000,
        buyNowPrice: 28000000,
      },
      {
        name: 'iPhone 11 Pro',
        description: `<p>iPhone 11 Pro 256GB, màu Midnight Green, camera 12MP, chip A13. Máy đã qua sử dụng, còn tốt.</p>`,
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 8000000,
        stepPrice: 200000,
        buyNowPrice: 12000000,
      },
      {
        name: 'iPad Pro M3',
        description: `<p>iPad Pro M3 12.9 inch 256GB, chip M3, màn hình Liquid Retina XDR, hỗ trợ Apple Pencil Pro. Máy mới nguyên seal.</p>`,
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
          'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
        ],
        categoryId: tabletsCategory,
        startPrice: 28000000,
        stepPrice: 600000,
        buyNowPrice: 38000000,
      },
      {
        name: 'Samsung Galaxy S23 Ultra',
        description: `<p>Samsung Galaxy S23 Ultra 256GB, màu Phantom Black, camera 200MP, S Pen. Máy mới, bảo hành chính hãng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
          'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
          'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 20000000,
        stepPrice: 500000,
        buyNowPrice: 28000000,
      },
      {
        name: 'MacBook Pro M1',
        description: `<p>MacBook Pro 13 inch M1, 16GB RAM, 512GB SSD, màn hình Retina. Máy đã qua sử dụng, còn tốt.</p>`,
        images: [
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
        ],
        categoryId: laptopsCategory,
        startPrice: 22000000,
        stepPrice: 500000,
        buyNowPrice: 30000000,
      },
    ]

    const expiredProducts = [
      {
        name: 'iPhone XS Max',
        description: `<p>iPhone XS Max 256GB, màu Gold, camera 12MP, chip A12. Máy đã qua sử dụng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 5000000,
        stepPrice: 100000,
        buyNowPrice: 8000000,
      },
      {
        name: 'iPad Air 4',
        description: `<p>iPad Air 4 256GB, chip A14, màn hình 10.9 inch, hỗ trợ Apple Pencil 2. Máy đã qua sử dụng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
          'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800',
        ],
        categoryId: tabletsCategory,
        startPrice: 8000000,
        stepPrice: 200000,
        buyNowPrice: 12000000,
      },
      {
        name: 'Samsung Galaxy Note 20',
        description: `<p>Samsung Galaxy Note 20 Ultra 256GB, màu Mystic Bronze, S Pen, camera 108MP. Máy đã qua sử dụng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 12000000,
        stepPrice: 300000,
        buyNowPrice: 18000000,
      },
      {
        name: 'MacBook Pro 2019',
        description: `<p>MacBook Pro 15 inch 2019, Intel i9, 32GB RAM, 1TB SSD, Touch Bar. Máy đã qua sử dụng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
          'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800',
        ],
        categoryId: laptopsCategory,
        startPrice: 25000000,
        stepPrice: 500000,
        buyNowPrice: 35000000,
      },
      {
        name: 'iPhone 8 Plus',
        description: `<p>iPhone 8 Plus 128GB, màu Space Gray, camera 12MP, chip A11. Máy đã qua sử dụng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 3000000,
        stepPrice: 100000,
        buyNowPrice: 5000000,
      },
      {
        name: 'iPad Pro 2020',
        description: `<p>iPad Pro 11 inch 2020, chip A12Z, 256GB, hỗ trợ Apple Pencil 2. Máy đã qua sử dụng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
          'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
        ],
        categoryId: tabletsCategory,
        startPrice: 15000000,
        stepPrice: 400000,
        buyNowPrice: 22000000,
      },
      {
        name: 'Samsung Galaxy S21',
        description: `<p>Samsung Galaxy S21 Ultra 256GB, màu Phantom Black, camera 108MP. Máy đã qua sử dụng.</p>`,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
          'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 15000000,
        stepPrice: 400000,
        buyNowPrice: 22000000,
      },
    ]

    for (const data of activeProducts) {
      const daysAgo = Math.floor(Math.random() * 7) + 1
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      const hoursFromNow = Math.floor(Math.random() * 336) + 1
      const endTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000)

      products.push({
        name: data.name,
        description: data.description,
        images: data.images,
        categoryId: data.categoryId,
        sellerId: seller._id,
        startPrice: data.startPrice,
        currentPrice: 0,
        stepPrice: data.stepPrice,
        buyNowPrice: data.buyNowPrice,
        autoExtend: false,
        allowNonRatedBidders: true,
        status: 'active',
        endTime,
        createdAt,
      })
    }

    const endingSoonProducts = [
      {
        name: 'iPhone 15 Pro',
        description: `<p>iPhone 15 Pro 256GB, màu Natural Titanium, camera 48MP, chip A17 Pro. Sắp kết thúc đấu giá!</p>`,
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        ],
        categoryId: smartphonesCategory,
        startPrice: 20000000,
        stepPrice: 500000,
        buyNowPrice: 30000000,
      },
      {
        name: 'MacBook Pro M3 Max',
        description: `<p>MacBook Pro 16 inch M3 Max, 64GB RAM, 2TB SSD, màn hình Liquid Retina XDR. Sắp kết thúc đấu giá!</p>`,
        images: [
          'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800',
          'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        ],
        categoryId: laptopsCategory,
        startPrice: 60000000,
        stepPrice: 2000000,
        buyNowPrice: 80000000,
      },
    ]

    const endingMinutes = [1, 2, 3]
    for (let i = 0; i < endingSoonProducts.length; i++) {
      const data = endingSoonProducts[i]
      const minutes = endingMinutes[i]
      const createdAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      const endTime = new Date(now.getTime() + minutes * 60 * 1000)

      products.push({
        name: data.name,
        description: data.description,
        images: data.images,
        categoryId: data.categoryId,
        sellerId: seller._id,
        startPrice: data.startPrice,
        currentPrice: 0,
        stepPrice: data.stepPrice,
        buyNowPrice: data.buyNowPrice,
        autoExtend: false,
        allowNonRatedBidders: true,
        status: 'active',
        endTime,
        createdAt,
      })
    }

    for (const data of expiredProducts) {
      const daysAgo = Math.floor(Math.random() * 11) + 5
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      const endDaysAgo = Math.floor(Math.random() * 5) + 1
      const endTime = new Date(now.getTime() - endDaysAgo * 24 * 60 * 60 * 1000)

      products.push({
        name: data.name,
        description: data.description,
        images: data.images,
        categoryId: data.categoryId,
        sellerId: seller._id,
        startPrice: data.startPrice,
        currentPrice: 0,
        stepPrice: data.stepPrice,
        buyNowPrice: data.buyNowPrice,
        autoExtend: false,
        allowNonRatedBidders: true,
        status: 'ended',
        endTime,
        createdAt,
      })
    }

    const createdProducts = await Product.insertMany(products)
    console.log(
      `Created ${createdProducts.length} products (${activeProducts.length} active, ${expiredProducts.length} expired)`
    )

    return createdProducts
  } catch (error) {
    console.error('Error seeding products:', error)
    throw error
  }
}
