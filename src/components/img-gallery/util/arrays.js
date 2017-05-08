export function nextIndex(index, count) {
  return index === count - 1 ? 0 : index + 1;
}

export function previousIndex(index, count) {
  return (index > 0 ? index : count) - 1;
}
