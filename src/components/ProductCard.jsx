import { useContext } from 'react';
import { StorefrontThemeContext } from '../utils/storefrontTheme';
import EditorialProductCard from './EditorialProductCard';
import LegacyProductCard from './LegacyProductCard';

export default function ProductCard(props) {
  const layout = useContext(StorefrontThemeContext);
  return layout === 'editorial' ? <EditorialProductCard {...props} /> : <LegacyProductCard {...props} />;
}
