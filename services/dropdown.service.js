export async function getDropdownData(Model, labelField, valueField, query = {}, sortBy = {}) {
  const data = await Model.find(query).select(`${labelField} ${valueField}`).sort(sortBy).lean();
  return data.map(item => ({
    label: item[labelField],
    value: item[valueField].toString(),
  }));
}
