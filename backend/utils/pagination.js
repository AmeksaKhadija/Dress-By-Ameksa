const paginate = async (model, query = {}, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 12;
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  const [results, total] = await Promise.all([
    model.find(query).sort(sort).skip(skip).limit(limit).populate(options.populate || ''),
    model.countDocuments(query),
  ]);

  return {
    results,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = paginate;
