import ProductSummaryCard from './ProductSummaryCard';

export default function ProductListLayout({ products }) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductSummaryCard key={product.id} product={product} />
      ))}
    </div>
  );
}
