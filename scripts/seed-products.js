import 'dotenv/config';
import './../utils/db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const seedProducts = async (sellers) => {
  try {
    console.log('Starting product seed...');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const categories = await Category.find({ parentId: { $ne: null } });
    
    if (categories.length === 0) {
      throw new Error('No subcategories found. Please run seed-categories first.');
    }

    const coinsCategory = categories.find(c => c.name === 'Coins & Currency');
    const stampsCategory = categories.find(c => c.name === 'Stamps');
    const toysCategory = categories.find(c => c.name === 'Vintage Toys');
    const paintingsCategory = categories.find(c => c.name === 'Paintings');
    const watchesCategory = categories.find(c => c.name === 'Luxury Watches');
    const jewelryCategory = categories.find(c => c.name === 'Jewelry');

    const now = new Date();
    const products = [];

    products.push({
      name: '1909-S VDB Lincoln Cent - Rare Coin',
      description: '<p>Extremely rare 1909-S VDB Lincoln Cent in excellent condition. This is one of the most sought-after coins in American numismatics.</p><p><strong>Details:</strong></p><ul><li>Grade: MS-65</li><li>Mint: San Francisco</li><li>Original luster preserved</li><li>Sharp strike with full details</li><li>Authenticated and graded by PCGS</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800',
        'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800',
      ],
      categoryId: coinsCategory._id,
      sellerId: sellers[0]._id,
      startPrice: 15000,
      stepPrice: 500,
      buyNowPrice: 25000,
      currentPrice: 15000,
      autoExtend: true,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Inverted Jenny Stamp 1918 - Aviation Error',
      description: '<p>The famous Inverted Jenny stamp from 1918 featuring an upside-down airplane. One of the most valuable stamp errors in philately.</p><p><strong>Provenance:</strong></p><ul><li>Original gum, hinged</li><li>Centering: VF-XF</li><li>Color: Vibrant</li><li>Certificate of authenticity included</li><li>From prestigious collection</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
      ],
      categoryId: stampsCategory._id,
      sellerId: sellers[1]._id,
      startPrice: 30000,
      stepPrice: 1000,
      buyNowPrice: 50000,
      currentPrice: 30000,
      autoExtend: true,
      allowNonRatedBidders: false,
      status: 'active',
      endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Original 1977 Star Wars Luke Skywalker Figure - MOC',
      description: '<p>Mint on card 1977 Kenner Star Wars Luke Skywalker action figure. An incredibly rare find in this condition!</p><p><strong>Condition:</strong></p><ul><li>Card: Near Mint</li><li>Bubble: Crystal clear, intact</li><li>Figure: Perfect condition</li><li>Never opened</li><li>AFA graded 85+</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800',
        'https://images.unsplash.com/photo-1560072810-1cffb09faf0f?w=800',
      ],
      categoryId: toysCategory._id,
      sellerId: sellers[0]._id,
      startPrice: 8000,
      stepPrice: 200,
      buyNowPrice: 15000,
      currentPrice: 8000,
      autoExtend: false,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Vincent van Gogh Style Oil Painting - Starry Night Homage',
      description: '<p>Beautiful oil on canvas painting in the style of Vincent van Gogh. Original artwork by contemporary artist.</p><p><strong>Specifications:</strong></p><ul><li>Size: 24" x 36"</li><li>Medium: Oil on canvas</li><li>Year: 2023</li><li>Signed by artist</li><li>Certificate of authenticity</li><li>Gallery-wrapped canvas ready to hang</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
      ],
      categoryId: paintingsCategory._id,
      sellerId: sellers[2]._id,
      startPrice: 3500,
      stepPrice: 100,
      buyNowPrice: 7000,
      currentPrice: 3500,
      autoExtend: true,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Rolex Submariner Date 116610LN - Full Set',
      description: '<p>Authentic Rolex Submariner Date with black dial and ceramic bezel. Complete set with box and papers.</p><p><strong>Details:</strong></p><ul><li>Reference: 116610LN</li><li>Year: 2019</li><li>Condition: Excellent, minimal wear</li><li>Box, papers, tags all included</li><li>Service history available</li><li>Warranty card dated 2019</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800',
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800',
      ],
      categoryId: watchesCategory._id,
      sellerId: sellers[3]._id,
      startPrice: 12000,
      stepPrice: 500,
      buyNowPrice: 18000,
      currentPrice: 12000,
      autoExtend: true,
      allowNonRatedBidders: false,
      status: 'active',
      endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Cartier Love Bracelet 18K Yellow Gold - Size 17',
      description: '<p>Authentic Cartier Love bracelet in 18K yellow gold. Comes with original screwdriver, box, and certificate.</p><p><strong>Specifications:</strong></p><ul><li>Material: 18K Yellow Gold</li><li>Size: 17</li><li>Condition: Excellent</li><li>Full set with papers</li><li>Recent purchase from Cartier boutique</li><li>Serial number verified</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
        'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800',
        'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800',
      ],
      categoryId: jewelryCategory._id,
      sellerId: sellers[1]._id,
      startPrice: 6000,
      stepPrice: 250,
      buyNowPrice: 9500,
      currentPrice: 6000,
      autoExtend: true,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: '1933 Double Eagle Gold Coin Replica - Museum Quality',
      description: '<p>High-quality museum replica of the legendary 1933 Double Eagle gold coin. Perfect for collectors and displays.</p><p><strong>Features:</strong></p><ul><li>24K gold plated</li><li>Same size and weight as original</li><li>Detailed strike</li><li>Display case included</li><li>Certificate stating this is a replica</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800',
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800',
      ],
      categoryId: coinsCategory._id,
      sellerId: sellers[2]._id,
      startPrice: 800,
      stepPrice: 50,
      buyNowPrice: 1500,
      currentPrice: 800,
      autoExtend: false,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'British Penny Black Stamp 1840 - First Postage Stamp',
      description: '<p>The world\'s first adhesive postage stamp. Penny Black from 1840 in good condition.</p><p><strong>Condition Report:</strong></p><ul><li>Four margins visible</li><li>Light cancel</li><li>Original gum removed (as typical)</li><li>No tears or thins</li><li>Expert certificate available</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
      ],
      categoryId: stampsCategory._id,
      sellerId: sellers[0]._id,
      startPrice: 5000,
      stepPrice: 200,
      buyNowPrice: 8500,
      currentPrice: 5000,
      autoExtend: true,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Vintage GI Joe Action Figures Collection - 1960s',
      description: '<p>Complete set of original 1960s GI Joe action figures with accessories and original packaging.</p><p><strong>Set Includes:</strong></p><ul><li>5 original figures</li><li>Military uniforms and gear</li><li>Original boxes (some wear)</li><li>Instruction booklets</li><li>Display stand</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1560072810-1cffb09faf0f?w=800',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800',
      ],
      categoryId: toysCategory._id,
      sellerId: sellers[3]._id,
      startPrice: 2500,
      stepPrice: 100,
      buyNowPrice: 5000,
      currentPrice: 2500,
      autoExtend: false,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Abstract Modern Art - Contemporary Oil Painting',
      description: '<p>Stunning contemporary abstract oil painting by emerging artist. Bold colors and dynamic composition.</p><p><strong>Details:</strong></p><ul><li>Size: 48" x 60"</li><li>Medium: Oil on canvas</li><li>Year: 2024</li><li>Signed and dated</li><li>Framed and ready to hang</li><li>Artist bio included</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800',
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
      ],
      categoryId: paintingsCategory._id,
      sellerId: sellers[1]._id,
      startPrice: 2000,
      stepPrice: 100,
      buyNowPrice: 4500,
      currentPrice: 2000,
      autoExtend: true,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Omega Speedmaster Professional Moonwatch',
      description: '<p>The legendary Omega Speedmaster Professional - the Moonwatch. Complete set in excellent condition.</p><p><strong>Specifications:</strong></p><ul><li>Reference: 311.30.42.30.01.005</li><li>Manual wind chronograph</li><li>Year: 2021</li><li>Full set with warranty</li><li>Sapphire display caseback</li><li>Original bracelet</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800',
      ],
      categoryId: watchesCategory._id,
      sellerId: sellers[2]._id,
      startPrice: 5000,
      stepPrice: 200,
      buyNowPrice: 7500,
      currentPrice: 5000,
      autoExtend: true,
      allowNonRatedBidders: false,
      status: 'active',
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Tiffany & Co. Diamond Engagement Ring - 1.5 Carat',
      description: '<p>Exquisite Tiffany & Co. solitaire diamond engagement ring with GIA certified diamond.</p><p><strong>Diamond Details:</strong></p><ul><li>Carat: 1.5ct</li><li>Cut: Excellent</li><li>Color: E</li><li>Clarity: VVS1</li><li>Platinum setting</li><li>GIA certificate included</li><li>Original Tiffany box and papers</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
        'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800',
      ],
      categoryId: jewelryCategory._id,
      sellerId: sellers[0]._id,
      startPrice: 18000,
      stepPrice: 500,
      buyNowPrice: 28000,
      currentPrice: 18000,
      autoExtend: true,
      allowNonRatedBidders: false,
      status: 'active',
      endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Morgan Silver Dollar 1878-CC - Carson City Mint',
      description: '<p>Scarce 1878-CC Morgan Silver Dollar from the Carson City Mint. Excellent eye appeal.</p><p><strong>Grading:</strong></p><ul><li>Grade: MS-64</li><li>Lustrous surfaces</li><li>Original toning</li><li>NGC certified</li><li>Sharp strike</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800',
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800',
      ],
      categoryId: coinsCategory._id,
      sellerId: sellers[1]._id,
      startPrice: 3500,
      stepPrice: 150,
      buyNowPrice: 6000,
      currentPrice: 3500,
      autoExtend: false,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Rare Chinese Stamps Collection - Cultural Revolution Era',
      description: '<p>Complete set of rare Chinese stamps from the Cultural Revolution period (1966-1976).</p><p><strong>Collection Includes:</strong></p><ul><li>15 mint stamps</li><li>All unmounted</li><li>Original gum</li><li>Certificate of authenticity</li><li>Album included</li><li>Historical documentation</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800',
      ],
      categoryId: stampsCategory._id,
      sellerId: sellers[3]._id,
      startPrice: 12000,
      stepPrice: 500,
      buyNowPrice: 20000,
      currentPrice: 12000,
      autoExtend: true,
      allowNonRatedBidders: false,
      status: 'active',
      endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Hot Wheels Redline Collection - 16 Cars - 1968-1972',
      description: '<p>Pristine collection of 16 original Hot Wheels Redline cars from 1968-1972. All in excellent condition.</p><p><strong>Highlights:</strong></p><ul><li>Original Redline wheels</li><li>All with working suspensions</li><li>Original paint</li><li>Display case included</li><li>Extremely clean examples</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800',
        'https://images.unsplash.com/photo-1560072810-1cffb09faf0f?w=800',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      ],
      categoryId: toysCategory._id,
      sellerId: sellers[2]._id,
      startPrice: 4500,
      stepPrice: 200,
      buyNowPrice: 8000,
      currentPrice: 4500,
      autoExtend: true,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    });

    products.push({
      name: 'Renaissance Style Portrait - Oil on Canvas',
      description: '<p>Beautiful Renaissance-inspired portrait painting. Professional artist with classical training.</p><p><strong>Artwork Details:</strong></p><ul><li>Size: 30" x 40"</li><li>Medium: Oil on linen canvas</li><li>Gold leaf frame</li><li>Year: 2023</li><li>Certificate of authenticity</li><li>Artist signature on front</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
        'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800',
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      ],
      categoryId: paintingsCategory._id,
      sellerId: sellers[0]._id,
      startPrice: 4000,
      stepPrice: 150,
      buyNowPrice: 7500,
      currentPrice: 4000,
      autoExtend: false,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() + 10 * 60 * 1000),
    });

    products.push({
      name: 'Patek Philippe Calatrava 5196G - White Gold',
      description: '<p>Elegant Patek Philippe Calatrava in 18K white gold. The epitome of dress watch sophistication.</p><p><strong>Specifications:</strong></p><ul><li>Reference: 5196G-001</li><li>White gold case</li><li>Automatic movement</li><li>Year: 2020</li><li>Full set with papers</li><li>Like new condition</li><li>Leather strap</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800',
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      ],
      categoryId: watchesCategory._id,
      sellerId: sellers[1]._id,
      startPrice: 20000,
      stepPrice: 1000,
      buyNowPrice: 32000,
      currentPrice: 20000,
      autoExtend: true,
      allowNonRatedBidders: false,
      status: 'active',
      endTime: new Date(now.getTime() + 10 * 60 * 1000),
    });

    products.push({
      name: 'Van Cleef & Arpels Alhambra Necklace - 18K Gold',
      description: '<p>Iconic Van Cleef & Arpels Magic Alhambra necklace in 18K yellow gold with mother of pearl.</p><p><strong>Details:</strong></p><ul><li>18K yellow gold</li><li>White mother of pearl</li><li>10 motifs</li><li>Adjustable length</li><li>Full set with VCA box</li><li>Certificate and papers</li><li>Recent service</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800',
        'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      ],
      categoryId: jewelryCategory._id,
      sellerId: sellers[3]._id,
      startPrice: 8500,
      stepPrice: 300,
      buyNowPrice: 14000,
      currentPrice: 8500,
      autoExtend: true,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() + 10 * 60 * 1000),
    });

    products.push({
      name: 'Ancient Roman Coins Collection - Imperial Era',
      description: '<p>Authentic collection of Ancient Roman coins from the Imperial period. Historical significance.</p><p><strong>Collection Features:</strong></p><ul><li>8 silver denarii</li><li>Emperors: Augustus to Nero</li><li>Authenticated by expert</li><li>Certificates included</li><li>Display box</li><li>Historical notes</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800',
        'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800',
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
      ],
      categoryId: coinsCategory._id,
      sellerId: sellers[2]._id,
      startPrice: 6500,
      stepPrice: 250,
      buyNowPrice: 11000,
      currentPrice: 6500,
      autoExtend: true,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() + 10 * 60 * 1000),
    });

    products.push({
      name: 'Rare Baseball Cards Collection - Mickey Mantle Era',
      description: '<p>Exceptional collection of vintage baseball cards including Mickey Mantle and other legends from the 1950s-60s.</p><p><strong>Collection Highlights:</strong></p><ul><li>15 cards total</li><li>Topps originals</li><li>Well-preserved condition</li><li>PSA graded</li><li>Display binder included</li><li>Certificate of authenticity</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1560072810-1cffb09faf0f?w=800',
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      ],
      categoryId: toysCategory._id,
      sellerId: sellers[0]._id,
      startPrice: 7500,
      stepPrice: 300,
      buyNowPrice: 13000,
      currentPrice: 7500,
      autoExtend: false,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() + 10 * 60 * 1000),
    });

    products.push({
      name: 'Impressionist Landscape - Original Oil Painting',
      description: '<p>Stunning impressionist landscape painting capturing the beauty of the French countryside.</p><p><strong>Artwork Information:</strong></p><ul><li>Size: 36" x 48"</li><li>Medium: Oil on canvas</li><li>Style: Impressionism</li><li>Signed by artist</li><li>Gallery provenance</li><li>Custom frame included</li></ul>',
      images: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
        'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800',
      ],
      categoryId: paintingsCategory._id,
      sellerId: sellers[1]._id,
      startPrice: 5500,
      stepPrice: 200,
      buyNowPrice: 9500,
      currentPrice: 5500,
      autoExtend: true,
      allowNonRatedBidders: true,
      status: 'active',
      endTime: new Date(now.getTime() + 10 * 60 * 1000),
    });

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    return createdProducts;
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};

