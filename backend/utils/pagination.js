const paginate = async (model, query = {}, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 12;
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  let findQuery = model.find(query).sort(sort).skip(skip).limit(limit);

  if (options.populate) {
    const populates = Array.isArray(options.populate) ? options.populate : [options.populate];
    populates.forEach((p) => { findQuery = findQuery.populate(p); });
  }

  const [results, total] = await Promise.all([
    findQuery,
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
