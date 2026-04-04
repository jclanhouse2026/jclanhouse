
import React from 'react';
import { Link } from 'react-router-dom';
import type { PortfolioProduct } from '../types';
import { formatCurrency } from '../lib/formatters';

const ProductCard: React.FC<{ product: PortfolioProduct }> = ({ product }) => (
  <div key={product.id} className="group relative bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-700 transition-transform duration-300 transform hover:scale-105">
    <div className="w-full h-56 bg-slate-700">
      {product.images.length > 0 && (
         <img src={product.images[0].url} alt={product.name} className="w-full h-full object-center object-cover" />
      )}
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <div>
        <h3 className="text-base text-white font-semibold">
          <Link to={`/produto/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-slate-400 line-clamp-2">{product.description}</p>
      </div>
      <div className="flex-grow"></div>
      <div className="flex justify-between items-center mt-4">
        <div>
           {typeof product.promoPrice === 'number' ? (
              <>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(product.promoPrice)}</p>
                  <p className="text-sm text-slate-500 line-through">{formatCurrency(product.originalPrice)}</p>
              </>
            ) : (
              <p className="text-lg font-medium text-white">{formatCurrency(product.originalPrice)}</p>
            )}
        </div>
        <Link to={`/produto/${product.id}`} className="bg-cyan-500 text-white text-sm font-bold py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors z-10 relative">
            Comprar
        </Link>
      </div>
    </div>
  </div>
);

export default ProductCard;
