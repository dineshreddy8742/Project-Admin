import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  Heart,
  MapPin,
  Clock,
  User,
  Package,
  ShoppingCart,
  MessageCircle,
  Bookmark
} from 'lucide-react';
import { useSupabase, type EnhancedProduct, type ProductFeedback } from '@/hooks/useSupabase';
import { useToast } from '@/components/ui/use-toast';

interface ProductDetailModalProps {
  product: EnhancedProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: EnhancedProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  const { addFeedback, toggleLike, loading } = useSupabase();
  const { toast } = useToast();

  if (!product) return null;

  const handleSubmitFeedback = async () => {
    if (userRating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    const feedback = await addFeedback(product.id, userRating, userComment);
    if (feedback) {
      setUserRating(0);
      setUserComment('');
      setShowFeedbackForm(false);
    }
  };

  const handleLike = async () => {
    const newLikedState = await toggleLike(product.id, isLiked);
    setIsLiked(newLikedState);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const displayImages = product.images.length > 0 ? product.images : [{ id: 'emoji', url: '📦', alt: 'Product' }];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {displayImages[currentImageIndex]?.url.startsWith('http') ? (
                <img
                  src={displayImages[currentImageIndex].url}
                  alt={displayImages[currentImageIndex].alt || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  {displayImages[currentImageIndex].url}
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {displayImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index ? 'border-primary' : 'border-border'
                    }`}
                  >
                    {image.url.startsWith('http') ? (
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-muted">
                        {image.url}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-primary">
                  ₹{product.price}
                  <span className="text-lg text-muted-foreground">/{product.unit}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({product.rating}) • {product.feedback.length} reviews
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500' : ''}`} />
                  <span className="ml-1">{product.likesCount + (isLiked ? 1 : 0)}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSaved(!isSaved)}
                  className={isSaved ? 'text-blue-500 border-blue-500' : ''}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-blue-500' : ''}`} />
                  <span className="ml-1">{product.savesCount + (isSaved ? 1 : 0)}</span>
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isOrganic && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  🌱 Organic
                </Badge>
              )}
              <Badge variant="outline">{product.freshness}</Badge>
              <Badge variant="outline">{product.category}</Badge>
            </div>

            {/* Seller Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{product.seller}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{product.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{formatTimeAgo(product.postedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{product.quantity} {product.unit} available</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={() => onAddToCart(product)}
              className="w-full"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>

            <Separator />

            {/* Feedback Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Customer Reviews</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
              </div>

              {/* Feedback Form */}
              <AnimatePresence>
                {showFeedbackForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-4 border rounded-lg"
                  >
                    <div>
                      <label className="text-sm font-medium">Your Rating</label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onHoverStart={() => setHoveredStar(star)}
                            onHoverEnd={() => setHoveredStar(0)}
                            onClick={() => setUserRating(star)}
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                star <= (hoveredStar || userRating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Your Comment</label>
                      <Textarea
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSubmitFeedback} disabled={loading}>
                        Submit Review
                      </Button>
                      <Button variant="outline" onClick={() => setShowFeedbackForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reviews List */}
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {product.feedback.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No reviews yet. Be the first to review this product!
                  </p>
                ) : (
                  product.feedback.map((feedback) => (
                    <motion.div
                      key={feedback.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{feedback.userName}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < feedback.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(feedback.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};