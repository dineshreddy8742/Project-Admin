import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { Star, User, Calendar, Package, MessageCircle, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';

const CustomerReviewSystem = () => {
  const { t: languageT } = useLanguage();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState(0); // 0 = all ratings
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    productId: '',
    name: '',
    email: '',
    rating: 5,
    title: '',
    review: '',
    pros: '',
    cons: ''
  });

  // Mock data for products
  const mockProducts = [
    { id: 'prod-1', name: 'Kanchipuram Silk Saree' },
    { id: 'prod-2', name: 'Blue Pottery Handi' },
    { id: 'prod-3', name: 'Warli Tribal Painting' },
    { id: 'prod-4', name: 'Bidriware Pen Stand' },
    { id: 'prod-5', name: 'Madhubani Painting' }
  ];

  // Mock reviews data
  const mockReviews = [
    {
      id: 1,
      productId: 'prod-1',
      productName: 'Kanchipuram Silk Saree',
      reviewerName: 'Priya Sharma',
      reviewerEmail: 'priya@example.com',
      rating: 5,
      title: 'Absolutely Beautiful!',
      review: 'The saree is exquisite! The zari work is so intricate and the colors are vibrant. It arrived well-packaged and in perfect condition. The craftsmanship is truly outstanding.',
      pros: 'Beautiful design, excellent quality, fast delivery',
      cons: 'Slightly expensive but worth it',
      date: '2023-10-15',
      verified: true,
      helpful: 24,
      notHelpful: 2,
      reply: 'Thank you for your kind words! We are delighted you loved the saree.'
    },
    {
      id: 2,
      productId: 'prod-2',
      productName: 'Blue Pottery Handi',
      reviewerName: 'Ravi Kumar',
      reviewerEmail: 'ravi@example.com',
      rating: 4,
      title: 'Good quality pottery',
      review: 'The handi is beautifully crafted with authentic blue pottery designs. It adds a traditional touch to my home decor. The size is perfect for the purpose.',
      pros: 'Authentic design, good size, traditional craft',
      cons: 'Could be slightly more robust',
      date: '2023-10-10',
      verified: true,
      helpful: 18,
      notHelpful: 1,
      reply: 'Thank you for your feedback. We are glad you like our traditional designs.'
    },
    {
      id: 3,
      productId: 'prod-3',
      productName: 'Warli Tribal Painting',
      reviewerName: 'Anita Desai',
      reviewerEmail: 'anita@example.com',
      rating: 5,
      title: 'Artistic masterpiece!',
      review: 'This painting is a true representation of Warli art. The artist has captured the essence of tribal life beautifully. The colors are natural and vibrant.',
      pros: 'Authentic style, meaningful art, natural colors',
      cons: 'None',
      date: '2023-10-05',
      verified: true,
      helpful: 32,
      notHelpful: 0,
      reply: 'We appreciate your appreciation for our authentic tribal art!'
    },
    {
      id: 4,
      productId: 'prod-1',
      productName: 'Kanchipuram Silk Saree',
      reviewerName: 'Sunita Singh',
      reviewerEmail: 'sunita@example.com',
      rating: 3,
      title: 'Average quality',
      review: 'The saree is decent but I expected better quality for the price. The silk feels a bit rough compared to other brands. But the design is traditional.',
      pros: 'Traditional design, good pattern',
      cons: 'Quality of silk could be better, feels rough',
      date: '2023-09-28',
      verified: true,
      helpful: 12,
      notHelpful: 5
    },
    {
      id: 5,
      productId: 'prod-4',
      productName: 'Bidriware Pen Stand',
      reviewerName: 'Amit Patel',
      reviewerEmail: 'amit@example.com',
      rating: 5,
      title: 'Intricate craftsmanship!',
      review: 'The silver inlay work is simply amazing. Very detailed and perfect for my office. It makes a great conversation piece.',
      pros: 'Beautiful inlay work, good size, office friendly',
      cons: 'None',
      date: '2023-09-20',
      verified: true,
      helpful: 27,
      notHelpful: 1,
      reply: 'Thank you for choosing our traditional Bidriware. We are glad you loved it!'
    },
    {
      id: 6,
      productId: 'prod-5',
      productName: 'Madhubani Painting',
      reviewerName: 'Kavita Verma',
      reviewerEmail: 'kavita@example.com',
      rating: 4,
      title: 'Vibrant colors and design',
      review: 'The painting is beautiful with very vibrant colors. It adds a cultural touch to my living room. The delivery was prompt.',
      pros: 'Vibrant colors, cultural art, timely delivery',
      cons: 'Frame could be sturdier',
      date: '2023-09-15',
      verified: false,
      helpful: 15,
      notHelpful: 3
    }
  ];

  useEffect(() => {
    setProducts(mockProducts);
    setReviews(mockReviews);
  }, []);

  // Filter reviews based on selected criteria
  const filteredReviews = reviews.filter(review => {
    return (
      (selectedProduct === 'all' || review.productId === selectedProduct) &&
      (filterRating === 0 || review.rating === filterRating)
    );
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReview.productId || !newReview.name || !newReview.email || !newReview.title || !newReview.review) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Add new review to the list
    const reviewToAdd = {
      id: reviews.length + 1,
      ...newReview,
      date: new Date().toISOString().split('T')[0],
      verified: false, // New reviews start as unverified
      helpful: 0,
      notHelpful: 0
    };

    setReviews([reviewToAdd, ...reviews]);
    
    toast({
      title: "Review Submitted",
      description: "Thank you for your review! It will be displayed after verification."
    });

    // Reset form
    setNewReview({
      productId: '',
      name: '',
      email: '',
      rating: 5,
      title: '',
      review: '',
      pros: '',
      cons: ''
    });
    setShowReviewForm(false);
  };

  const handleRatingChange = (rating: number) => {
    setNewReview({...newReview, rating});
  };

  const markHelpful = (reviewId: number, helpful: boolean) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? {...review, helpful: helpful ? review.helpful + 1 : review.helpful, notHelpful: !helpful ? review.notHelpful + 1 : review.notHelpful} 
        : review
    ));
    
    toast({
      title: "Feedback Recorded",
      description: "Thank you for your feedback on this review."
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full mr-4">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-hero text-primary font-indian mb-2">
              Customer Reviews & Feedback
            </h1>
            <p className="text-lg text-muted-foreground">
              See what customers are saying about artisan products
            </p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Review Filters
            </div>
            <Button onClick={() => setShowReviewForm(!showReviewForm)}>
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Product</label>
              <select 
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-background border rounded-md px-3 py-2"
              >
                <option value="all">All Products</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-background border rounded-md px-3 py-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <select 
                value={filterRating}
                onChange={(e) => setFilterRating(parseInt(e.target.value))}
                className="w-full bg-background border rounded-md px-3 py-2"
              >
                <option value={0}>All Ratings</option>
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="hover:shadow-glow transition-all bg-card">
            <CardHeader>
              <CardTitle className="text-card-title text-primary font-indian flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Write a Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Product *</label>
                  <select 
                    value={newReview.productId}
                    onChange={(e) => setNewReview({...newReview, productId: e.target.value})}
                    className="w-full bg-background border rounded-md px-3 py-2"
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Name *</label>
                    <Input
                      value={newReview.name}
                      onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Email *</label>
                    <Input
                      type="email"
                      value={newReview.email}
                      onChange={(e) => setNewReview({...newReview, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Rating *</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className={`p-1 ${newReview.rating >= star ? 'text-amber-500' : 'text-muted-foreground'}`}
                      >
                        <Star 
                          className={`h-6 w-6 ${newReview.rating >= star ? 'fill-current' : ''}`} 
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {newReview.rating} star{newReview.rating !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Review Title *</label>
                  <Input
                    value={newReview.title}
                    onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                    placeholder="Summarize your experience"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Review *</label>
                  <Textarea
                    value={newReview.review}
                    onChange={(e) => setNewReview({...newReview, review: e.target.value})}
                    placeholder="Share your experience with the product..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pros</label>
                    <Textarea
                      value={newReview.pros}
                      onChange={(e) => setNewReview({...newReview, pros: e.target.value})}
                      placeholder="What did you like about the product?"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cons</label>
                    <Textarea
                      value={newReview.cons}
                      onChange={(e) => setNewReview({...newReview, cons: e.target.value})}
                      placeholder="What could be improved?"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full">
                    Submit Review
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your review will be verified before being published. This may take 1-2 business days.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reviews Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold text-primary">
          {sortedReviews.length} Review{sortedReviews.length !== 1 ? 's' : ''} for Artisan Products
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className="text-3xl font-bold text-primary">4.2</div>
            <div className="ml-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${star <= 4 ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} 
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">Based on {reviews.length} reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">Rating Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(review => review.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center mb-2">
                    <div className="w-10 text-sm font-medium">{rating}★</div>
                    <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden mx-2">
                      <div 
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right text-sm">{count}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">4.2</div>
                <div className="flex justify-center my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-6 w-6 ${star <= 4 ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                <div className="text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <Card key={review.id} className="hover:shadow-glow transition-all bg-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{review.title}</h3>
                    {review.verified && (
                      <Badge variant="secondary">Verified Purchase</Badge>
                    )}
                  </div>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} 
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium">{review.rating}</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(review.date).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{review.reviewerName}</div>
                  <div className="text-sm text-muted-foreground mb-2">{review.productName}</div>
                  
                  <p className="mb-3">{review.review}</p>
                  
                  {(review.pros || review.cons) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-3">
                      {review.pros && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-green-800">Pros</div>
                          <div className="text-sm">{review.pros}</div>
                        </div>
                      )}
                      {review.cons && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="font-medium text-red-800">Cons</div>
                          <div className="text-sm">{review.cons}</div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {review.reply && (
                    <div className="mt-4 p-4 bg-secondary rounded-lg border-l-4 border-primary">
                      <div className="font-medium text-primary">Artisan Reply</div>
                      <div className="text-sm mt-1">{review.reply}</div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button 
                        className="flex items-center gap-1 hover:text-primary"
                        onClick={() => markHelpful(review.id, true)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{review.helpful} found this helpful</span>
                      </button>
                      <button 
                        className="flex items-center gap-1 hover:text-primary"
                        onClick={() => markHelpful(review.id, false)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{review.notHelpful}</span>
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {review.helpful + review.notHelpful} people found this review useful
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedReviews.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No reviews found</h3>
          <p className="text-muted-foreground mb-4">
            There are no reviews matching your current filters. Try adjusting your filters to see more reviews.
          </p>
          <Button onClick={() => {
            setSelectedProduct('all');
            setFilterRating(0);
          }}>
            Reset Filters
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default CustomerReviewSystem;