export function formatStoreDate(value: string) {
  return new Date(value).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}