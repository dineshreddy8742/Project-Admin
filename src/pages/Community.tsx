import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, Send, Image as ImageIcon } from 'lucide-react';
import eventBus from '@/lib/eventBus';

const categories = [
  'Crop Diseases',
  'Fertilizers & Pesticides',
  'Market Prices & Government Schemes',
  'Weather & Irrigation',
  'General Farming Tips',
];

const initialPosts = [
  {
    id: 1,
    author: 'Rajesh Kumar',
    avatar: 'https://github.com/shadcn.png',
    time: '2 hours ago',
    isExpert: false,
    content: 'I have been noticing these yellow spots on my tomato plants. Does anyone know what this could be? I have attached a picture.',
    image: 'https://i.imgur.com/YOUR_IMAGE_ID.jpg', // Replace with a real image URL
    likes: 12,
    comments: [
      {
        id: 1,
        author: 'Dr. Anjali Sharma',
        avatar: 'https://github.com/expert.png',
        time: '1 hour ago',
        isExpert: true,
        content: 'This looks like early blight. I recommend using a copper-based fungicide. Make sure to remove the affected leaves to prevent it from spreading.',
      },
      {
        id: 2,
        author: 'Suresh Patel',
        avatar: 'https://github.com/farmer2.png',
        time: '30 minutes ago',
        isExpert: false,
        content: 'I had the same issue last year. Dr. Sharma is right, the fungicide works well. Also, try to water the plants at the base and not on the leaves.',
      },
    ],
  },
  {
    id: 2,
    author: 'Priya Singh',
    avatar: 'https://github.com/priya.png',
    time: '5 hours ago',
    isExpert: false,
    content: 'What is the current market price for onions in the Bangalore region? I am planning to harvest next week.',
    likes: 5,
    comments: [],
  },
];

const Community = () => {
  const [selectedCategory, setSelectedCategory] = useState('Crop Diseases');
  const [posts, setPosts] = useState(initialPosts);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    const handleFillField = ({ field, value }: { field: string, value: string }) => {
        if (field === 'category') {
            const category = categories.find(c => c.toLowerCase() === value.toLowerCase());
            if (category) {
                setSelectedCategory(category);
            }
        }
    };

    eventBus.on('fill-community-field', handleFillField);

    return () => {
        eventBus.remove('fill-community-field', handleFillField);
    };
  }, []);

  const handlePostSubmit = () => {
    if (newPostContent.trim() === '') return;

    const newPost = {
      id: posts.length + 1,
      author: 'You',
      avatar: 'https://github.com/you.png',
      time: 'Just now',
      isExpert: false,
      content: newPostContent,
      likes: 0,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category}>
                      <Button
                        variant={selectedCategory === category ? 'default' : 'ghost'}
                        className="w-full justify-start h-auto whitespace-normal text-left"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Discussion Forum */}
          <div className="md:col-span-3">
            {/* New Post Input */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create a new post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid w-full gap-2">
                  <Textarea
                    placeholder={`What's on your mind, related to ${selectedCategory}?`}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <Button variant="ghost" size="icon">
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                    <Button onClick={handlePostSubmit}>
                      <Send className="h-5 w-5 mr-2" /> Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={post.avatar} />
                        <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{post.author}</p>
                        <p className="text-sm text-gray-500">{post.time}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{post.content}</p>
                    {post.image && (
                      <img src={post.image} alt="User post" className="mt-4 rounded-lg" />
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-5 w-5 mr-2" /> {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-5 w-5 mr-2" /> {post.comments.length}
                        </Button>
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-4 mt-4">
                      {post.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`flex items-start space-x-4 p-4 rounded-lg ${
                            comment.isExpert ? 'bg-green-100 border-l-4 border-green-500' : 'bg-gray-100'
                          }`}>
                          <Avatar>
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-semibold">{comment.author}</p>
                              {comment.isExpert && (
                                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                  Expert Verified
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{comment.time}</p>
                            <p className="mt-2">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Community;