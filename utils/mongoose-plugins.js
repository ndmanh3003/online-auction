export function paginationPlugin(schema) {
  schema.statics.paginate = async function (
    req,
    filter = {},
    sort = { createdAt: -1 }
  ) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const total = await this.countDocuments(filter)
    let query = this.find(filter).sort(sort).skip(skip).limit(limit)

    const items = await query
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
