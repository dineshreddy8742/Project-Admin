import React from 'react';
import { Link } from 'react-router-dom';
import InfoCard from './InfoCard';

const QuickActions = () => {
  const actions = [
    {
      id: 'add-product',
      title: 'Add New Product',
      description: 'List a new handcrafted item',
      icon: 'Plus',
      color: 'primary',
      action: () => console.log('Add product')
    },
    {
      id: 'update-profile',
      title: 'Update Profile',
      description: 'Edit your artisan information',
      icon: 'User',
      color: 'secondary',
      link: '/profile'
    },
    {
      id: 'view-storefront',
      title: 'View Storefront',
      description: 'See your public store page',
      icon: 'Store',
      color: 'accent',
      link: '/artisan-storefront'
    },
    {
      id: 'verification',
      title: 'Verification Status',
      description: 'Check your trust score',
      icon: 'Shield',
      color: 'success',
      action: () => console.log('Check verification')
    },
    {
      id: 'analytics',
      title: 'Export Analytics',
      description: 'Download sales reports',
      icon: 'Download',
      color: 'warning',
      action: () => console.log('Export analytics')
    },
    {
      id: 'support',
      title: 'Get Support',
      description: 'Contact our help team',
      icon: 'HelpCircle',
      color: 'muted',
      action: () => console.log('Contact support')
    }
  ];

  const handleAction = (action) => {
    if (action?.action) {
      action?.action();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-warm-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary text-primary-foreground rounded-lg">
            <Icon name="Zap" size={20} />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Quick Actions
          </h3>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions?.map((action) => (
            action.link ? (
              <Link to={action.link} key={action.id}>
                <InfoCard {...action} />
              </Link>
            ) : (
              <button onClick={() => handleAction(action)} key={action.id} className="w-full text-left">
                <InfoCard {...action} />
              </button>
            )
          ))}
        </div>

        {/* Featured Action */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                  <Icon name="TrendingUp" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Boost Your Sales</h4>
                  <p className="text-sm text-muted-foreground">
                    Use AI to create promotional content and reach more customers
                  </p>
                </div>
              </div>
              <Button variant="default" size="sm">
                <Icon name="ArrowRight" size={16} className="ml-2" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;