import { Home, List, Plus, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type NavTab = 'map' | 'browse' | 'add' | 'chat' | 'profile';

interface BottomNavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadCount?: number;
  userRole?: 'food_giver' | 'food_receiver';
}

const BottomNavigation = ({ currentTab, onTabChange, unreadCount = 0, userRole }: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t flex items-center justify-around shadow-[var(--shadow-elegant)] z-50">
      <NavButton
        icon={Home}
        label="Map"
        active={currentTab === 'map'}
        onClick={() => onTabChange('map')}
      />
      <NavButton
        icon={List}
        label="Browse"
        active={currentTab === 'browse'}
        onClick={() => onTabChange('browse')}
      />
      <NavButton
        icon={Plus}
        label="Add"
        active={currentTab === 'add'}
        onClick={() => onTabChange('add')}
        elevated
      />
      <NavButton
        icon={MessageCircle}
        label="Chat"
        active={currentTab === 'chat'}
        onClick={() => onTabChange('chat')}
        badge={unreadCount}
      />
      <NavButton
        icon={User}
        label="Profile"
        active={currentTab === 'profile'}
        onClick={() => onTabChange('profile')}
      />
    </div>
  );
};

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  elevated?: boolean;
  badge?: number;
}

const NavButton = ({ icon: Icon, label, active, onClick, elevated, badge }: NavButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center min-w-[60px] h-full relative transition-all",
        active && "text-primary",
        !active && "text-muted-foreground hover:text-foreground",
        elevated && "transform -translate-y-4"
      )}
    >
      {elevated && (
        <div className="absolute inset-0 -top-4 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[var(--shadow-elegant)]">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      )}
      {!elevated && (
        <>
          <div className="relative">
            <Icon className="h-6 w-6" />
            {badge && badge > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
              >
                {badge > 9 ? '9+' : badge}
              </Badge>
            )}
          </div>
          <span className={cn(
            "text-xs mt-1 font-medium",
            active && "text-primary"
          )}>
            {label}
          </span>
        </>
      )}
      {elevated && <span className="text-xs mt-1 font-medium text-muted-foreground">{label}</span>}
    </button>
  );
};

export default BottomNavigation;
