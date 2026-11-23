/**
 * Little Moments - Types and Constants
 */

export const OCCASIONS = [
  { id: 'birthday', name: 'Birthday', icon: '🎂', category: 'personal' },
  { id: 'wedding', name: 'Wedding', icon: '💍', category: 'milestone' },
  { id: 'anniversary', name: 'Marriage Anniversary', icon: '🥂', category: 'milestone' },
  { id: 'valentine', name: 'Valentine\'s Day', icon: '💖', category: 'love' },
  { id: 'friendship', name: 'Friendship', icon: '🤝', category: 'love' },
  { id: 'friendship_day', name: 'Friendship Day', icon: '🌻', category: 'love' },
  { id: 'teacher', name: 'Teacher\'s Day', icon: '📚', category: 'respect' },
  { id: 'mother', name: 'Mother\'s Day', icon: '🌸', category: 'family' },
  { id: 'father', name: 'Father\'s Day', icon: '👔', category: 'family' },
  { id: 'family', name: 'Family', icon: '🏡', category: 'family' },
  { id: 'congratulations', name: 'Congratulations', icon: '🎉', category: 'milestone' },
  { id: 'thank_you', name: 'Thank You', icon: '💌', category: 'gratitude' },
  { id: 'get_well', name: 'Get Well Soon', icon: '🌈', category: 'care' },
  { id: 'farewell', name: 'Farewell', icon: '✈️', category: 'milestone' },
  { id: 'pets', name: 'Pet and Animal Lovers', icon: '🐾', category: 'personal' },
  { id: 'new_year', name: 'New Year', icon: '✨', category: 'celebration' },
  { id: 'custom', name: 'Custom Occasion', icon: '🎁', category: 'other' },
  // Festivals
  { id: 'diwali', name: 'Diwali', icon: '🪔', category: 'festival' },
  { id: 'christmas', name: 'Christmas', icon: '🎄', category: 'festival' },
  { id: 'eid', name: 'Eid', icon: '🌙', category: 'festival' },
  { id: 'holi', name: 'Holi', icon: '🎨', category: 'festival' },
  { id: 'ugadi', name: 'Ugadi', icon: '🌿', category: 'festival' },
  { id: 'sankranti', name: 'Sankranti / Pongal', icon: '🪁', category: 'festival' },
  { id: 'onam', name: 'Onam', icon: '🌺', category: 'festival' },
  { id: 'ganesh_chaturthi', name: 'Ganesh Chaturthi', icon: '🐘', category: 'festival' },
  { id: 'navratri', name: 'Navratri', icon: '💃', category: 'festival' },
  { id: 'raksha_bandhan', name: 'Raksha Bandhan', icon: '🧵', category: 'festival' },
  { id: 'baisakhi', name: 'Baisakhi', icon: '🌾', category: 'festival' },
  { id: 'other_festivals', name: 'Other Festivals', icon: '🎆', category: 'festival' },
];

export const FONT_OPTIONS = [
  { id: 'cursive', name: 'Elegant Cursive', className: 'font-cursive', preview: 'Dearest Love' },
  { id: 'handwriting', name: 'Handwritten', className: 'font-handwriting', preview: 'A warm note from me' },
  { id: 'serif_classic', name: 'Classic Serif', className: 'font-serif-classic', preview: 'Timeless Elegance' },
  { id: 'serif_royal', name: 'Royal Gold Serif', className: 'font-serif-royal', preview: 'ROYAL CELEBRATION' },
  { id: 'rounded', name: 'Cute Rounded', className: 'font-rounded', preview: 'Sweet little moments' },
  { id: 'modern', name: 'Modern Minimal', className: 'font-modern', preview: 'Pure and simple' },
];

export const PASSWORD_TYPES = {
  PIN: 'pin',
  ALPHANUMERIC: 'alphanumeric',
};
