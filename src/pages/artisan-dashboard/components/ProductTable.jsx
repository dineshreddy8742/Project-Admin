import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ProductTable = ({ products, onUpdateProduct, onDeleteProduct }) => {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleEdit = (product) => {
    setEditingId(product?.id);
    setEditData({
      price: product?.price,
      stock: product?.stock,
      status: product?.status
    });
  };

  const handleSave = (productId) => {
    onUpdateProduct(productId, editData);
    setEditingId(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev?.includes(productId) 
        ? prev?.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts?.length === products?.length 
        ? [] 
        : products?.map(p => p?.id)
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      case 'out_of_stock':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-warm-sm">
      {/* Table Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Product Inventory
          </h3>
          <div className="flex items-center space-x-3">
            {selectedProducts?.length > 0 && (
              <Button variant="outline" size="sm">
                <Icon name="Megaphone" size={16} className="mr-2" />
                Promote ({selectedProducts?.length})
              </Button>
            )}
            <Button variant="default" size="sm" onClick={() => { console.log('Add Product button clicked'); navigate('/artisan/add-product'); }}>
              <Icon name="Plus" size={16} className="mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 text-left">
                <label htmlFor="select-all-products" className="sr-only">Select all products</label>
                <input
                  id="select-all-products"
                  name="select-all-products"
                  type="checkbox"
                  checked={selectedProducts?.length === products?.length}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">Product</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">Category</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">Price</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">Stock</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product?.id} className="border-b border-border hover:bg-muted/50">
                <td className="p-4">
                  <label htmlFor={`select-product-${product?.id}`} className="sr-only">Select {product?.name}</label>
                  <input
                    id={`select-product-${product?.id}`}
                    name={`select-product-${product?.id}`}
                    type="checkbox"
                    checked={selectedProducts?.includes(product?.id)}
                    onChange={() => handleSelectProduct(product?.id)}
                    className="rounded border-border"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={product?.image}
                        alt={product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product?.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {product?.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-foreground">{product?.category}</td>
                <td className="p-4">
                  {editingId === product?.id ? (
                    <>
                      <label htmlFor={`edit-price-${product?.id}`} className="sr-only">Edit price for {product?.name}</label>
                      <Input
                        id={`edit-price-${product?.id}`}
                        name={`edit-price-${product?.id}`}
                        type="number"
                        value={editData?.price}
                        onChange={(e) => setEditData({...editData, price: e?.target?.value})}
                        className="w-20"
                      />
                    </>
                  ) : (
                    <span className="text-sm text-foreground">₹{product?.price}</span>
                  )}
                </td>
                <td className="p-4">
                  {editingId === product?.id ? (
                    <>
                      <label htmlFor={`edit-stock-${product?.id}`} className="sr-only">Edit stock for {product?.name}</label>
                      <Input
                        id={`edit-stock-${product?.id}`}
                        name={`edit-stock-${product?.id}`}
                        type="number"
                        value={editData?.stock}
                        onChange={(e) => setEditData({...editData, stock: e?.target?.value})}
                        className="w-20"
                      />
                    </>
                  ) : (
                    <span className="text-sm text-foreground">{product?.stock}</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product?.status)}`}>
                    {product?.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {editingId === product?.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSave(product?.id)}
                        >
                          <Icon name="Check" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancel}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Icon name="Edit2" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteProduct(product?.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden p-4 space-y-4">
        {products?.map((product) => (
          <div key={product?.id} className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-3">
              <label htmlFor={`select-product-mobile-${product?.id}`} className="sr-only">Select {product?.name}</label>
              <input
                id={`select-product-mobile-${product?.id}`}
                name={`select-product-mobile-${product?.id}`}
                type="checkbox"
                checked={selectedProducts?.includes(product?.id)}
                onChange={() => handleSelectProduct(product?.id)}
                className="mt-1 rounded border-border min-w-5 min-h-5"
                aria-label={`Select product ${product?.name}`}
              />
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={product?.image}
                  alt={product?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{product?.name}</h4>
                <p className="text-sm text-muted-foreground">{product?.category}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(product?.status)}`}>
                  {product?.status?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="font-medium text-foreground">₹{product?.price}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock</p>
                <p className="font-medium text-foreground">{product?.stock}</p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2" role="group" aria-label="Product Actions">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} aria-label="Edit product">
                <Icon name="Edit2" size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDeleteProduct(product?.id)} aria-label="Delete product">
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductTable;