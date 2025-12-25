export function processBids(product, req = {}) {
  const page = parseInt(req?.query?.page) || 1
  const limit = parseInt(req?.query?.limit) || 10

  const blockedIds = (product.blockedBidders ?? []).map((x) => x.toString())
  const filteredBids = (product.bids || []).filter(
    (bid) => !blockedIds.includes(bid.bidderId?.toString())
  )

  const sortedBids = [...filteredBids].sort((a, b) => {
    if (b.bidAmount !== a.bidAmount) return b.bidAmount - a.bidAmount
    return new Date(a.createdAt) - new Date(b.createdAt)
  })

  const total = sortedBids.length
  const skip = (page - 1) * limit
  const paginatedBids = sortedBids.slice(skip, skip + limit)

  const topBidder = product.currentWinnerId
    ? paginatedBids.find(
        (bid) =>
          (bid.bidderId?._id?.toString() || bid.bidderId?.toString()) ===
          product.currentWinnerId.toString()
      ) ||
      sortedBids.find(
        (bid) =>
          (bid.bidderId?._id?.toString() || bid.bidderId?.toString()) ===
          product.currentWinnerId.toString()
      ) ||
      null
    : sortedBids[0] || null

  return {
    items: paginatedBids,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    topBidder,
  }
}

