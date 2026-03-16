const TAG_COLORS = [
  { bg: '#dbeafe', text: '#1e40af' },
  { bg: '#dcfce7', text: '#166534' },
  { bg: '#fef9c3', text: '#854d0e' },
  { bg: '#fce7f3', text: '#9d174d' },
  { bg: '#ede9fe', text: '#5b21b6' },
  { bg: '#ffedd5', text: '#9a3412' },
  { bg: '#cffafe', text: '#155e75' },
  { bg: '#f3f4f6', text: '#374151' },
];

export function getTagColor(tag: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) & 0xffffffff;
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
}
